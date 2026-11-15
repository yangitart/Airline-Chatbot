-- Only bookings that have never linked a Stripe session use this deadline.
-- Linked sessions continue to be reconciled exclusively by signed Stripe events.
alter table public.bookings add column hold_expires_at timestamptz not null
  default (now() + interval '30 minutes');

update public.bookings b set hold_expires_at = least(
  b.created_at + interval '30 minutes', f.departure_at
) from public.flight_instances f where f.id = b.flight_instance_id;

create index bookings_unstarted_hold_expiry_idx on public.bookings(hold_expires_at)
  where is_demo and status = 'demo_saved' and payment_status = 'unpaid'
    and stripe_checkout_session_id is null;

create or replace function public.expire_unstarted_demo_bookings()
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_ids uuid[];
  v_count integer;
begin
  -- Lock bookings before inventory, as Checkout/webhook operations do. Concurrent
  -- sweepers skip already claimed rows. Never claim a linked or paid booking.
  select array_agg(id) into v_ids from (
    select id from public.bookings
      where is_demo and status = 'demo_saved' and payment_status = 'unpaid'
        and stripe_checkout_session_id is null and hold_expires_at <= clock_timestamp()
      order by hold_expires_at, id limit 100 for update skip locked
  ) candidates;
  if v_ids is null then return 0; end if;

  -- Lock all inventory for the batch in one global order to avoid deadlocks
  -- between overlapping round trips and webhook inventory releases.
  perform 1 from public.flight_inventory i where exists (
    select 1 from public.bookings b where b.id = any(v_ids)
      and i.flight_instance_id in (b.flight_instance_id, b.return_flight_instance_id)
      and i.cabin_class = b.cabin_class
  ) order by i.flight_instance_id, i.cabin_class for update;

  with released as (
    select leg.flight_id, b.cabin_class, sum(b.passenger_count)::integer as seats
      from public.bookings b
      cross join lateral (values (b.flight_instance_id), (b.return_flight_instance_id)) leg(flight_id)
      where b.id = any(v_ids) and leg.flight_id is not null
      group by leg.flight_id, b.cabin_class
  )
  update public.flight_inventory i set
    seats_available = least(i.seats_total, i.seats_available + r.seats),
    offer_payload = jsonb_set(i.offer_payload, '{numberOfBookableSeats}',
      to_jsonb(least(9, i.seats_total, i.seats_available + r.seats)), true),
    updated_at = clock_timestamp()
    from released r where i.flight_instance_id = r.flight_id and i.cabin_class = r.cabin_class;

  update public.bookings set status = 'expired', payment_status = 'failed' where id = any(v_ids);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.expire_unstarted_demo_bookings() from public, anon, authenticated;
grant execute on function public.expire_unstarted_demo_bookings() to service_role;

create or replace function public.create_demo_booking(
  p_flight_instance_id uuid,
  p_return_flight_instance_id uuid,
  p_cabin_class text,
  p_passenger_count integer,
  p_expected_outbound_fare_minor integer,
  p_expected_return_fare_minor integer,
  p_idempotency_key uuid
)
returns public.bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_outbound public.flight_instances%rowtype;
  v_return public.flight_instances%rowtype;
  v_outbound_inventory public.flight_inventory%rowtype;
  v_return_inventory public.flight_inventory%rowtype;
  v_existing public.bookings%rowtype;
  v_currency text;
  v_total integer;
  v_reference text;
  v_snapshot jsonb;
  v_order_payload jsonb;
  v_booking public.bookings%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_cabin_class is null or p_cabin_class not in ('economy', 'premium-economy', 'business', 'first')
    or p_passenger_count is null or p_passenger_count < 1 or p_passenger_count > 9
    or p_expected_outbound_fare_minor is null or p_expected_outbound_fare_minor < 1
    or (p_expected_return_fare_minor is not null and p_expected_return_fare_minor < 1)
    or p_idempotency_key is null then
    raise exception using errcode = '22023', message = 'invalid_booking_request';
  end if;

  select * into v_existing from public.bookings
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  -- Lock all requested inventory in deterministic order to prevent overbooking and reduce deadlocks.
  perform 1 from public.flight_inventory i
  where i.flight_instance_id in (p_flight_instance_id, p_return_flight_instance_id)
    and i.cabin_class = p_cabin_class
  order by i.flight_instance_id
  for update;

  select * into v_existing from public.bookings
  where user_id = v_user_id and idempotency_key = p_idempotency_key;
  if found then return v_existing; end if;

  select * into v_outbound from public.flight_instances f
  where f.id = p_flight_instance_id and f.status = 'scheduled' and f.is_demo
    and f.departure_at > clock_timestamp();
  if not found then
    raise exception using errcode = 'P0002', message = 'outbound_flight_unavailable';
  end if;
  select * into v_outbound_inventory from public.flight_inventory i
  where i.flight_instance_id = p_flight_instance_id and i.cabin_class = p_cabin_class;
  if not found or v_outbound_inventory.seats_available < p_passenger_count then
    raise exception using errcode = '40001', message = 'outbound_inventory_changed';
  end if;
  if v_outbound_inventory.fare_minor <> p_expected_outbound_fare_minor then
    raise exception using errcode = '40001', message = 'outbound_fare_changed';
  end if;
  v_currency := v_outbound_inventory.currency;

  if p_return_flight_instance_id is not null then
    if p_expected_return_fare_minor is null then
      raise exception using errcode = '22023', message = 'return_fare_required';
    end if;
    select * into v_return from public.flight_instances f
    where f.id = p_return_flight_instance_id and f.status = 'scheduled' and f.is_demo
      and f.departure_at > clock_timestamp();
    if not found or v_return.origin_code <> v_outbound.destination_code
      or v_return.destination_code <> v_outbound.origin_code
      or v_return.departure_at <= v_outbound.departure_at then
      raise exception using errcode = '22023', message = 'return_flight_invalid';
    end if;
    select * into v_return_inventory from public.flight_inventory i
    where i.flight_instance_id = p_return_flight_instance_id and i.cabin_class = p_cabin_class;
    if not found or v_return_inventory.seats_available < p_passenger_count then
      raise exception using errcode = '40001', message = 'return_inventory_changed';
    end if;
    if v_return_inventory.fare_minor <> p_expected_return_fare_minor then
      raise exception using errcode = '40001', message = 'return_fare_changed';
    end if;
    if v_return_inventory.currency <> v_currency then
      raise exception using errcode = '22023', message = 'flight_currency_mismatch';
    end if;
  elsif p_expected_return_fare_minor is not null then
    raise exception using errcode = '22023', message = 'unexpected_return_fare';
  end if;

  v_total := (v_outbound_inventory.fare_minor + coalesce(v_return_inventory.fare_minor, 0)) * p_passenger_count;
  v_reference := 'DEMO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
  v_snapshot := jsonb_build_object(
    'outbound', v_outbound_inventory.offer_payload,
    'return', case when p_return_flight_instance_id is null then null else v_return_inventory.offer_payload end,
    'cabin_class', p_cabin_class,
    'passenger_count', p_passenger_count,
    'currency', v_currency,
    'total_fare_minor', v_total,
    'is_demo', true
  );
  v_order_payload := jsonb_build_object(
    'type', 'flight-order',
    'id', v_reference,
    'associatedRecords', jsonb_build_array(jsonb_build_object(
      'reference', v_reference,
      'originSystemCode', 'DEMO',
      'flightOfferId', v_outbound_inventory.offer_id
    )),
    'flightOffers', case
      when p_return_flight_instance_id is null then jsonb_build_array(v_outbound_inventory.offer_payload)
      else jsonb_build_array(v_outbound_inventory.offer_payload, v_return_inventory.offer_payload)
    end,
    'travelers', (select coalesce(jsonb_agg(jsonb_build_object(
      'id', traveler_number::text,
      'dateOfBirth', '1990-01-01',
      'name', jsonb_build_object('firstName', 'DEMO', 'lastName', 'TRAVELER'),
      'travelerType', 'ADULT',
      'isDemo', true
    )), '[]'::jsonb) from generate_series(1, p_passenger_count) as traveler_number),
    'demo', true
  );

  update public.flight_inventory set
    seats_available = seats_available - p_passenger_count,
    offer_payload = jsonb_set(offer_payload, '{numberOfBookableSeats}', to_jsonb(least(9, seats_available - p_passenger_count)), true),
    updated_at = now()
  where flight_instance_id = p_flight_instance_id and cabin_class = p_cabin_class;
  if p_return_flight_instance_id is not null then
    update public.flight_inventory set
      seats_available = seats_available - p_passenger_count,
      offer_payload = jsonb_set(offer_payload, '{numberOfBookableSeats}', to_jsonb(least(9, seats_available - p_passenger_count)), true),
      updated_at = now()
    where flight_instance_id = p_return_flight_instance_id and cabin_class = p_cabin_class;
  end if;

  insert into public.bookings (
    booking_reference, user_id, flight_instance_id, return_flight_instance_id, cabin_class,
    passenger_count, outbound_unit_fare_minor, return_unit_fare_minor, total_fare_minor,
    currency, status, is_demo, itinerary_snapshot, flight_order_payload, idempotency_key, hold_expires_at
  ) values (
    v_reference, v_user_id, p_flight_instance_id, p_return_flight_instance_id, p_cabin_class,
    p_passenger_count, v_outbound_inventory.fare_minor,
    case when p_return_flight_instance_id is null then null else v_return_inventory.fare_minor end,
    v_total, v_currency, 'demo_saved', true, v_snapshot, v_order_payload, p_idempotency_key,
    least(clock_timestamp() + interval '30 minutes', v_outbound.departure_at)
  ) returning * into v_booking;

  return v_booking;
end;
$$;

revoke all on function public.create_demo_booking(uuid, uuid, text, integer, integer, integer, uuid) from public, anon;
grant execute on function public.create_demo_booking(uuid, uuid, text, integer, integer, integer, uuid) to authenticated;

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
    where id = p_booking_id and user_id = p_user_id and is_demo
      and exists (select 1 from public.flight_instances f
        where f.id = flight_instance_id and f.status = 'scheduled'
          and f.departure_at > clock_timestamp()) and (
      (status = 'demo_saved' and payment_status = 'unpaid'
        and hold_expires_at > clock_timestamp())
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

