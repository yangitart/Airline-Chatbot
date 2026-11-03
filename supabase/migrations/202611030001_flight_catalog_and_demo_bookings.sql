create table if not exists public.airports (
  code text primary key check (code ~ '^[A-Z]{3}$'),
  icao text not null unique check (icao ~ '^[A-Z]{4}$'),
  name text not null,
  city text not null,
  country text not null,
  time_zone text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.flight_instances (
  id uuid primary key default gen_random_uuid(),
  flight_number text not null,
  origin_code text not null references public.airports(code),
  destination_code text not null references public.airports(code),
  departure_date date not null,
  departure_at timestamptz not null,
  arrival_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled', 'completed')),
  is_demo boolean not null default true,
  source_label text not null default 'Demo inventory',
  source_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint flight_instances_distinct_airports check (origin_code <> destination_code),
  constraint flight_instances_arrival_after_departure check (arrival_at > departure_at),
  constraint flight_instances_flight_schedule_unique unique (flight_number, departure_at)
);

create table if not exists public.flight_inventory (
  offer_id text not null unique,
  flight_instance_id uuid not null references public.flight_instances(id) on delete cascade,
  cabin_class text not null check (cabin_class in ('economy', 'premium-economy', 'business', 'first')),
  seats_total integer not null check (seats_total >= 0),
  seats_available integer not null check (seats_available >= 0 and seats_available <= seats_total),
  fare_minor integer not null check (fare_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  offer_payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (flight_instance_id, cabin_class)
);

create table if not exists public.flight_status_snapshots (
  id uuid primary key default gen_random_uuid(),
  flight_instance_id uuid not null references public.flight_instances(id) on delete cascade,
  provider text not null default 'aviationstack-demo',
  flight_date date not null,
  flight_status text not null check (flight_status in ('scheduled', 'active', 'landed', 'cancelled', 'incident', 'diverted')),
  is_demo boolean not null default true,
  status_payload jsonb not null,
  fetched_at timestamptz not null default now(),
  unique (flight_instance_id, provider)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_instance_id uuid not null references public.flight_instances(id),
  return_flight_instance_id uuid references public.flight_instances(id),
  cabin_class text not null check (cabin_class in ('economy', 'premium-economy', 'business', 'first')),
  passenger_count integer not null check (passenger_count between 1 and 9),
  outbound_unit_fare_minor integer not null check (outbound_unit_fare_minor > 0),
  return_unit_fare_minor integer check (return_unit_fare_minor is null or return_unit_fare_minor > 0),
  total_fare_minor integer not null check (total_fare_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status text not null default 'demo_saved' check (status in ('demo_saved', 'pending_payment', 'confirmed', 'failed', 'expired', 'cancelled')),
  is_demo boolean not null default true,
  itinerary_snapshot jsonb not null,
  flight_order_payload jsonb not null,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  constraint bookings_return_flight_pair check (return_flight_instance_id is null or return_flight_instance_id <> flight_instance_id),
  constraint bookings_user_idempotency_unique unique (user_id, idempotency_key)
);

create index if not exists flight_instances_route_date_idx
  on public.flight_instances (origin_code, destination_code, departure_date)
  where status = 'scheduled';
create index if not exists flight_inventory_available_idx
  on public.flight_inventory (cabin_class, seats_available);
create index if not exists bookings_user_created_idx
  on public.bookings (user_id, created_at desc);

alter table public.airports enable row level security;
alter table public.flight_instances enable row level security;
alter table public.flight_inventory enable row level security;
alter table public.flight_status_snapshots enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Published airports are readable" on public.airports;
create policy "Published airports are readable" on public.airports
  for select to anon, authenticated using (is_published);

drop policy if exists "Scheduled flights are publicly searchable" on public.flight_instances;
create policy "Scheduled flights are publicly searchable" on public.flight_instances
  for select to anon, authenticated using (status = 'scheduled');

drop policy if exists "Available cabin inventory is publicly searchable" on public.flight_inventory;
create policy "Available cabin inventory is publicly searchable" on public.flight_inventory
  for select to anon, authenticated using (
    exists (
      select 1 from public.flight_instances f
      where f.id = flight_instance_id and f.status = 'scheduled'
    )
  );

drop policy if exists "Travelers can read their own bookings" on public.bookings;
create policy "Travelers can read their own bookings" on public.bookings
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Scheduled flight status is publicly readable" on public.flight_status_snapshots;
create policy "Scheduled flight status is publicly readable" on public.flight_status_snapshots
  for select to anon, authenticated using (
    exists (
      select 1 from public.flight_instances f
      where f.id = flight_instance_id and f.status = 'scheduled'
    )
  );

revoke insert, update, delete on public.airports from anon, authenticated;
revoke insert, update, delete on public.flight_instances from anon, authenticated;
revoke insert, update, delete on public.flight_inventory from anon, authenticated;
revoke insert, update, delete on public.flight_status_snapshots from anon, authenticated;
revoke insert, update, delete on public.bookings from anon, authenticated;
grant select on public.airports, public.flight_instances, public.flight_inventory, public.flight_status_snapshots to anon, authenticated;
grant select on public.bookings to authenticated;

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
  where f.id = p_flight_instance_id and f.status = 'scheduled' and f.is_demo;
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
    where f.id = p_return_flight_instance_id and f.status = 'scheduled' and f.is_demo;
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
    currency, status, is_demo, itinerary_snapshot, flight_order_payload, idempotency_key
  ) values (
    v_reference, v_user_id, p_flight_instance_id, p_return_flight_instance_id, p_cabin_class,
    p_passenger_count, v_outbound_inventory.fare_minor,
    case when p_return_flight_instance_id is null then null else v_return_inventory.fare_minor end,
    v_total, v_currency, 'demo_saved', true, v_snapshot, v_order_payload, p_idempotency_key
  ) returning * into v_booking;

  return v_booking;
end;
$$;

revoke all on function public.create_demo_booking(uuid, uuid, text, integer, integer, integer, uuid) from public, anon;
grant execute on function public.create_demo_booking(uuid, uuid, text, integer, integer, integer, uuid) to authenticated;
