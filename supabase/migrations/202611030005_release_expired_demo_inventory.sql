create or replace function public.apply_demo_checkout_event(
  p_event_id text, p_event_type text, p_session_id text, p_payment_intent_id text, p_payment_status text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_booking public.bookings%rowtype;
  v_event_rows integer;
begin
  insert into public.stripe_webhook_events(event_id, event_type)
    values (p_event_id, p_event_type) on conflict do nothing;
  get diagnostics v_event_rows = row_count;
  if v_event_rows = 0 then return false; end if;

  select * into v_booking from public.bookings
    where stripe_checkout_session_id = p_session_id and is_demo for update;
  if not found or v_booking.payment_status = 'paid' then return false; end if;

  if p_event_type = 'checkout.session.expired' then
    update public.flight_inventory set
      seats_available = least(seats_total, seats_available + v_booking.passenger_count),
      offer_payload = jsonb_set(offer_payload, '{numberOfBookableSeats}', to_jsonb(least(9, seats_available + v_booking.passenger_count)), true),
      updated_at = now()
    where flight_instance_id in (v_booking.flight_instance_id, v_booking.return_flight_instance_id)
      and cabin_class = v_booking.cabin_class;
    update public.bookings set payment_status = 'failed', status = 'expired'
      where id = v_booking.id and payment_status <> 'paid';
  elsif p_payment_status = 'paid' then
    update public.bookings set payment_status = 'paid', status = 'confirmed', stripe_payment_intent_id = p_payment_intent_id
      where id = v_booking.id and payment_status <> 'paid';
  else
    update public.bookings set payment_status = 'failed', status = 'failed', stripe_payment_intent_id = p_payment_intent_id
      where id = v_booking.id and payment_status <> 'paid';
  end if;
  return true;
end;
$$;

revoke all on function public.apply_demo_checkout_event(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.apply_demo_checkout_event(text,text,text,text,text) to service_role;
