-- Reprice demo offers at a fixed sample ratio of 85 INR per USD. Existing
-- bookings and their Stripe sessions retain the original price and currency.
with repriced as (
  select i.offer_id, greatest(1, round(i.fare_minor / 85.0)::integer) as fare_minor
  from public.flight_inventory i
  join public.flight_instances f on f.id = i.flight_instance_id
  where f.is_demo and i.currency = 'INR'
), formatted as (
  select *, to_char(fare_minor / 100.0, 'FM99999990.00') as price
  from repriced
)
update public.flight_inventory i
set fare_minor = f.fare_minor,
    currency = 'USD',
    offer_payload = i.offer_payload || jsonb_build_object(
      'price', coalesce(i.offer_payload->'price', '{}'::jsonb) || jsonb_build_object(
        'currency', 'USD', 'total', f.price, 'base', f.price, 'grandTotal', f.price
      ),
      'travelerPricings', coalesce((
        select jsonb_agg(
          traveler || jsonb_build_object(
            'price', coalesce(traveler->'price', '{}'::jsonb) || jsonb_build_object(
              'currency', 'USD', 'total', f.price, 'base', f.price
            )
          ) order by position
        )
        from jsonb_array_elements(
          case when jsonb_typeof(i.offer_payload->'travelerPricings') = 'array'
            then i.offer_payload->'travelerPricings' else '[]'::jsonb end
        ) with ordinality as pricing(traveler, position)
      ), '[]'::jsonb)
    ),
    updated_at = now()
from formatted f
where i.offer_id = f.offer_id;
