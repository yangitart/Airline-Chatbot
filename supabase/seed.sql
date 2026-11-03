insert into public.airports (code, icao, name, city, country, time_zone)
values
  ('DEL', 'VIDP', 'Indira Gandhi International Airport', 'New Delhi', 'India', 'Asia/Kolkata'),
  ('BOM', 'VABB', 'Chhatrapati Shivaji Maharaj International Airport', 'Mumbai', 'India', 'Asia/Kolkata'),
  ('BLR', 'VOBL', 'Kempegowda International Airport', 'Bengaluru', 'India', 'Asia/Kolkata'),
  ('MAA', 'VOMM', 'Chennai International Airport', 'Chennai', 'India', 'Asia/Kolkata'),
  ('HYD', 'VOHS', 'Rajiv Gandhi International Airport', 'Hyderabad', 'India', 'Asia/Kolkata')
on conflict (code) do update set
  icao = excluded.icao,
  name = excluded.name,
  city = excluded.city,
  country = excluded.country,
  time_zone = excluded.time_zone,
  is_published = true;

with routes(flight_number, origin_code, destination_code, departure_time, duration_minutes, base_fare_minor) as (
  values
    ('AI 101', 'DEL', 'BOM', time '06:00', 135, 475000),
    ('AI 105', 'DEL', 'BOM', time '13:20', 140, 455000),
    ('AI 109', 'DEL', 'BOM', time '19:40', 145, 495000),
    ('AI 201', 'BOM', 'DEL', time '07:10', 135, 465000),
    ('AI 205', 'BOM', 'DEL', time '14:25', 140, 445000),
    ('AI 209', 'BOM', 'DEL', time '20:30', 145, 485000),
    ('AI 301', 'DEL', 'BLR', time '05:50', 170, 625000),
    ('AI 305', 'DEL', 'BLR', time '12:40', 175, 605000),
    ('AI 309', 'DEL', 'BLR', time '18:55', 175, 645000),
    ('AI 401', 'BLR', 'DEL', time '06:15', 170, 615000),
    ('AI 405', 'BLR', 'DEL', time '13:10', 175, 595000),
    ('AI 409', 'BLR', 'DEL', time '19:25', 175, 635000),
    ('AI 501', 'DEL', 'MAA', time '06:35', 175, 585000),
    ('AI 505', 'DEL', 'MAA', time '14:00', 180, 565000),
    ('AI 509', 'DEL', 'MAA', time '20:10', 180, 605000),
    ('AI 601', 'MAA', 'DEL', time '06:45', 175, 575000),
    ('AI 605', 'MAA', 'DEL', time '13:50', 180, 555000),
    ('AI 609', 'MAA', 'DEL', time '20:00', 180, 595000),
    ('AI 701', 'DEL', 'HYD', time '07:00', 130, 525000),
    ('AI 705', 'DEL', 'HYD', time '14:15', 135, 505000),
    ('AI 709', 'DEL', 'HYD', time '20:25', 135, 545000),
    ('AI 801', 'HYD', 'DEL', time '07:20', 130, 515000),
    ('AI 805', 'HYD', 'DEL', time '14:35', 135, 495000),
    ('AI 809', 'HYD', 'DEL', time '20:45', 135, 535000)
), scheduled as (
  select
    r.*,
    departure_day::date as departure_date,
    (departure_day::date + r.departure_time) at time zone 'Asia/Kolkata' as departure_at,
    ((departure_day::date + r.departure_time) + make_interval(mins => r.duration_minutes)) at time zone 'Asia/Kolkata' as arrival_at
  from routes r
  cross join generate_series(current_date::timestamp, (current_date + 21)::timestamp, interval '1 day') as days(departure_day)
)
insert into public.flight_instances (
  flight_number, origin_code, destination_code, departure_date, departure_at, arrival_at,
  duration_minutes, status, is_demo, source_label, source_updated_at
)
select
  flight_number, origin_code, destination_code, departure_date, departure_at, arrival_at,
  duration_minutes, 'scheduled', true, 'Demo inventory; not live or ticketable', now()
from scheduled
on conflict (flight_number, departure_at) do update set
  status = 'scheduled',
  is_demo = true,
  source_label = 'Demo inventory; not live or ticketable',
  source_updated_at = now();

with source as (
  select
    f.*,
    class_fare.cabin_class,
    class_fare.seats_total,
    case class_fare.cabin_class
      when 'economy' then 'ECONOMY'
      when 'premium-economy' then 'PREMIUM_ECONOMY'
      when 'business' then 'BUSINESS'
      else 'FIRST'
    end as amadeus_cabin,
    round(
      (case
        when f.origin_code in ('DEL', 'BOM') and f.destination_code in ('DEL', 'BOM') then 455000
        when f.origin_code in ('DEL', 'BLR') or f.destination_code in ('DEL', 'BLR') then 605000
        when f.origin_code in ('DEL', 'MAA') or f.destination_code in ('DEL', 'MAA') then 565000
        else 505000
      end * class_fare.multiplier)
    )::integer as fare_minor,
    'DEMO-' || replace(f.id::text, '-', '') || '-' || upper(replace(class_fare.cabin_class, '-', '_')) as demo_offer_id
  from public.flight_instances f
  cross join lateral (values
    ('economy', 180, 1.0),
    ('premium-economy', 36, 1.65),
    ('business', 24, 3.4),
    ('first', 8, 6.0)
  ) as class_fare(cabin_class, seats_total, multiplier)
  where f.is_demo and f.status = 'scheduled'
), payloads as (
  select
    s.*,
    jsonb_build_object(
      'type', 'flight-offer',
      'id', s.demo_offer_id,
      'source', 'DEMO',
      'instantTicketingRequired', false,
      'nonHomogeneous', false,
      'oneWay', true,
      'lastTicketingDate', s.departure_date::text,
      'numberOfBookableSeats', least(s.seats_total, 9),
      'itineraries', jsonb_build_array(jsonb_build_object(
        'duration', 'PT' || floor(s.duration_minutes / 60)::integer::text || 'H' || (s.duration_minutes % 60)::text || 'M',
        'segments', jsonb_build_array(jsonb_build_object(
          'id', '1',
          'departure', jsonb_build_object('iataCode', s.origin_code, 'at', s.departure_at),
          'arrival', jsonb_build_object('iataCode', s.destination_code, 'at', s.arrival_at),
          'carrierCode', 'AI',
          'number', split_part(s.flight_number, ' ', 2),
          'aircraft', jsonb_build_object('code', '320'),
          'duration', 'PT' || floor(s.duration_minutes / 60)::integer::text || 'H' || (s.duration_minutes % 60)::text || 'M',
          'numberOfStops', 0
        ))
      )),
      'price', jsonb_build_object(
        'currency', 'INR',
        'total', to_char(s.fare_minor / 100.0, 'FM99999990.00'),
        'base', to_char(s.fare_minor / 100.0, 'FM99999990.00'),
        'grandTotal', to_char(s.fare_minor / 100.0, 'FM99999990.00')
      ),
      'pricingOptions', jsonb_build_object('fareType', jsonb_build_array('PUBLISHED'), 'includedCheckedBagsOnly', false),
      'validatingAirlineCodes', jsonb_build_array('AI'),
      'travelerPricings', jsonb_build_array(jsonb_build_object(
        'travelerId', '1',
        'fareOption', 'STANDARD',
        'travelerType', 'ADULT',
        'price', jsonb_build_object(
          'currency', 'INR',
          'total', to_char(s.fare_minor / 100.0, 'FM99999990.00'),
          'base', to_char(s.fare_minor / 100.0, 'FM99999990.00')
        ),
        'fareDetailsBySegment', jsonb_build_array(jsonb_build_object(
          'segmentId', '1',
          'cabin', s.amadeus_cabin,
          'class', case s.cabin_class when 'economy' then 'Y' when 'business' then 'J' when 'first' then 'F' else 'W' end,
          'includedCheckedBags', jsonb_build_object('quantity', case s.cabin_class when 'economy' then 1 when 'business' then 2 when 'first' then 2 else 2 end)
        ))
      )),
      'isDemo', true,
      'sourceLabel', 'Demo offer; not live or ticketable'
    ) as offer_payload
  from source s
)
insert into public.flight_inventory (
  offer_id, flight_instance_id, cabin_class, seats_total, seats_available, fare_minor, currency, offer_payload
)
select demo_offer_id, id, cabin_class, seats_total, seats_total, fare_minor, 'INR', offer_payload
from payloads
on conflict (flight_instance_id, cabin_class) do update set
  seats_total = excluded.seats_total,
  seats_available = least(public.flight_inventory.seats_available, excluded.seats_total),
  fare_minor = excluded.fare_minor,
  currency = excluded.currency,
  offer_id = excluded.offer_id,
  offer_payload = jsonb_set(
    excluded.offer_payload,
    '{numberOfBookableSeats}',
    to_jsonb(least(public.flight_inventory.seats_available, excluded.seats_total, 9)),
    true
  ),
  updated_at = now();

insert into public.flight_status_snapshots (
  flight_instance_id, provider, flight_date, flight_status, status_payload
)
select
  f.id,
  'aviationstack-demo',
  f.departure_date,
  'scheduled',
  jsonb_build_object(
    'flight_date', f.departure_date,
    'flight_status', 'scheduled',
    'departure', jsonb_build_object(
      'airport', origin.name,
      'timezone', origin.time_zone,
      'iata', origin.code,
      'icao', origin.icao,
      'terminal', null,
      'gate', null,
      'delay', null,
      'scheduled', f.departure_at,
      'estimated', null,
      'actual', null
    ),
    'arrival', jsonb_build_object(
      'airport', destination.name,
      'timezone', destination.time_zone,
      'iata', destination.code,
      'icao', destination.icao,
      'terminal', null,
      'gate', null,
      'delay', null,
      'scheduled', f.arrival_at,
      'estimated', null,
      'actual', null
    ),
    'airline', jsonb_build_object('name', 'Air India', 'iata', 'AI', 'icao', 'AIC'),
    'flight', jsonb_build_object(
      'number', split_part(f.flight_number, ' ', 2),
      'iata', replace(f.flight_number, ' ', ''),
      'icao', 'AIC' || split_part(f.flight_number, ' ', 2),
      'codeshared', null
    ),
    'aircraft', jsonb_build_object('registration', null, 'iata', '320', 'icao', 'A320', 'icao24', null),
    'live', null,
    'isDemo', true
  )
from public.flight_instances f
join public.airports origin on origin.code = f.origin_code
join public.airports destination on destination.code = f.destination_code
where f.is_demo
on conflict (flight_instance_id, provider) do update set
  flight_date = excluded.flight_date,
  flight_status = excluded.flight_status,
  status_payload = excluded.status_payload,
  fetched_at = now();
