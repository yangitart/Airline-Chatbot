-- Only the authenticated Next.js Checkout route can link a session created by Stripe.
create or replace function public.attach_demo_checkout_session(
  p_booking_id uuid, p_user_id uuid, p_session_id text
) returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if p_session_id is null or p_session_id !~ '^cs_test_[A-Za-z0-9]+$' then
    raise exception using errcode = '22023', message = 'invalid_checkout_session';
  end if;

  update public.bookings
    set payment_status = 'checkout_pending',
        status = 'pending_payment',
        stripe_checkout_session_id = p_session_id
    where id = p_booking_id and user_id = p_user_id and is_demo and (
      (status = 'demo_saved' and payment_status = 'unpaid')
      or (status = 'failed' and payment_status = 'failed'
          and stripe_checkout_session_id is distinct from p_session_id)
      or (status = 'pending_payment' and payment_status = 'checkout_pending'
          and stripe_checkout_session_id = p_session_id)
    );

  if not found then
    raise exception using errcode = 'P0002', message = 'booking_not_payable';
  end if;
  return true;
end;
$$;

revoke all on function public.save_demo_checkout_session(uuid,text) from public, anon, authenticated, service_role;
revoke all on function public.attach_demo_checkout_session(uuid,uuid,text) from public, anon, authenticated;
grant execute on function public.attach_demo_checkout_session(uuid,uuid,text) to service_role;

-- Legacy events were recorded even when the booking was not ready. A replay can
-- claim a legacy row only after passing verification against the current booking.
alter table public.stripe_webhook_events add column if not exists applied_booking_id uuid;

create or replace function public.apply_verified_demo_checkout_event(
  p_event_id text,
  p_event_type text,
  p_session_id text,
  p_booking_id uuid,
  p_amount_total bigint,
  p_currency text,
  p_payment_intent_id text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_booking public.bookings%rowtype;
begin
  if p_session_id is null or p_session_id !~ '^cs_test_[A-Za-z0-9]+$'
    or p_event_type is null or p_event_type not in (
      'checkout.session.completed', 'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed', 'checkout.session.expired'
    ) then
    return false;
  end if;

  select * into v_booking from public.bookings
    where id = p_booking_id and is_demo for update;

  if not found or v_booking.total_fare_minor is distinct from p_amount_total
    or v_booking.currency is distinct from p_currency
    or v_booking.payment_status = 'paid'
    or v_booking.status in ('expired', 'cancelled') then
    return false;
  end if;

  if v_booking.stripe_checkout_session_id is distinct from p_session_id then
    if v_booking.status in ('demo_saved', 'failed') then
      -- A signed event may arrive before the route has linked the new session.
      -- Roll back without logging it so Stripe can retry.
      raise exception using errcode = 'P0002', message = 'checkout_session_not_linked';
    end if;
    return false;
  end if;

  insert into public.stripe_webhook_events as events (event_id, event_type, applied_booking_id)
    values (p_event_id, p_event_type, v_booking.id)
    on conflict (event_id) do update
      set applied_booking_id = excluded.applied_booking_id
      where events.applied_booking_id is null;
  if not found then return false; end if;

  if p_event_type = 'checkout.session.expired' then
    perform 1 from public.flight_inventory
      where flight_instance_id in (v_booking.flight_instance_id, v_booking.return_flight_instance_id)
        and cabin_class = v_booking.cabin_class
      order by flight_instance_id for update;
    update public.flight_inventory set
      seats_available = least(seats_total, seats_available + v_booking.passenger_count),
      offer_payload = jsonb_set(offer_payload, '{numberOfBookableSeats}', to_jsonb(least(9, seats_available + v_booking.passenger_count)), true),
      updated_at = now()
    where flight_instance_id in (v_booking.flight_instance_id, v_booking.return_flight_instance_id)
      and cabin_class = v_booking.cabin_class;
    update public.bookings set payment_status = 'failed', status = 'expired'
      where id = v_booking.id;
  elsif p_event_type in ('checkout.session.completed', 'checkout.session.async_payment_succeeded') then
    update public.bookings set payment_status = 'paid', status = 'confirmed',
      stripe_payment_intent_id = p_payment_intent_id where id = v_booking.id;
  else
    update public.bookings set payment_status = 'failed', status = 'failed',
      stripe_payment_intent_id = p_payment_intent_id where id = v_booking.id;
  end if;
  return true;
end;
$$;

revoke all on function public.apply_demo_checkout_event(text,text,text,text,text) from public, anon, authenticated, service_role;
revoke all on function public.apply_verified_demo_checkout_event(text,text,text,uuid,bigint,text,text) from public, anon, authenticated;
grant execute on function public.apply_verified_demo_checkout_event(text,text,text,uuid,bigint,text,text) to service_role;
