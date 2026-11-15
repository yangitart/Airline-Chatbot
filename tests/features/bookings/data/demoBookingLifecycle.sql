-- Run with psql -v ON_ERROR_STOP=1 against a disposable database containing
-- the booking migrations and Supabase auth roles. Everything rolls back.
begin;
insert into auth.users(id) values ('10000000-0000-4000-8000-000000000001');
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
insert into public.airports(code,icao,name,city,country,time_zone) values
  ('TSA','XTSA','Test A','Test A','Test','UTC'), ('TSB','XTSB','Test B','Test B','Test','UTC');
insert into public.flight_instances(id,flight_number,origin_code,destination_code,departure_date,departure_at,arrival_at,duration_minutes)
values
  ('20000000-0000-4000-8000-000000000001','TEST1','TSA','TSB',current_date,now()+interval '4 hours',now()+interval '5 hours',60),
  ('20000000-0000-4000-8000-000000000002','TEST2','TSB','TSA',current_date,now()+interval '8 hours',now()+interval '9 hours',60),
  ('20000000-0000-4000-8000-000000000003','TEST3','TSA','TSB',current_date,now()-interval '2 hours',now()-interval '1 hour',60);
insert into public.flight_inventory(offer_id,flight_instance_id,cabin_class,seats_total,seats_available,fare_minor,currency,offer_payload)
select id::text,id,'economy',20,20,100,'USD','{"numberOfBookableSeats":9}'::jsonb
from public.flight_instances where flight_number like 'TEST%';

do $$
declare
  b public.bookings;
  linked public.bookings;
  paid public.bookings;
  v_seats integer;
begin
  -- A stale scheduled row is insufficient: the departure must still be future.
  begin
    perform public.create_demo_booking('20000000-0000-4000-8000-000000000003',null,'economy',1,100,null,gen_random_uuid());
    raise exception 'TEST: departed flight was accepted';
  exception when sqlstate 'P0002' then null;
  end;
  select seats_available into v_seats from public.flight_inventory where offer_id = '20000000-0000-4000-8000-000000000003';
  assert v_seats = 20, 'Rejected flight changed inventory';

  b := public.create_demo_booking('20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','economy',2,100,100,gen_random_uuid());
  assert b.hold_expires_at <= clock_timestamp() + interval '30 minutes', 'Hold has no deadline';
  assert public.expire_unstarted_demo_bookings() = 0, 'Fresh hold expired';
  update public.bookings set hold_expires_at = now()-interval '1 minute' where id = b.id;
  begin
    perform public.attach_demo_checkout_session(b.id,b.user_id,'cs_test_ExpiredHold');
    raise exception 'TEST: expired hold accepted Checkout';
  exception when sqlstate 'P0002' then null;
  end;
  assert public.expire_unstarted_demo_bookings() = 1, 'Expired hold not released';
  assert public.expire_unstarted_demo_bookings() = 0, 'Hold released twice';
  assert (select status = 'expired' from public.bookings where id = b.id), 'Wrong booking status';
  assert not exists (select 1 from public.flight_inventory where flight_instance_id in (b.flight_instance_id,b.return_flight_instance_id) and seats_available <> 20), 'Round-trip seats not restored';
  assert not exists (select 1 from public.flight_inventory where flight_instance_id in (b.flight_instance_id,b.return_flight_instance_id) and (offer_payload->>'numberOfBookableSeats')::int <> 9), 'Offer availability not restored';

  linked := public.create_demo_booking('20000000-0000-4000-8000-000000000001',null,'economy',1,100,null,gen_random_uuid());
  perform public.attach_demo_checkout_session(linked.id,linked.user_id,'cs_test_LinkedHold');
  paid := public.create_demo_booking('20000000-0000-4000-8000-000000000001',null,'economy',1,100,null,gen_random_uuid());
  update public.bookings set status='confirmed',payment_status='paid' where id=paid.id;
  update public.bookings set hold_expires_at=now()-interval '1 minute' where id in (linked.id,paid.id);
  assert public.expire_unstarted_demo_bookings() = 0, 'Linked or paid reservation expired';
  assert (select seats_available = 18 from public.flight_inventory where flight_instance_id=linked.flight_instance_id), 'Protected seats were released';
  assert public.apply_verified_demo_checkout_event('evt_expiry_test','checkout.session.expired','cs_test_LinkedHold',linked.id,100,'USD',null), 'Linked hold did not expire via webhook';
  assert not public.apply_verified_demo_checkout_event('evt_expiry_test','checkout.session.expired','cs_test_LinkedHold',linked.id,100,'USD',null), 'Webhook released twice';
  assert (select seats_available = 19 from public.flight_inventory where flight_instance_id=linked.flight_instance_id), 'Webhook inventory mismatch';

  update public.flight_instances set departure_at=now()+interval '10 minutes'
    where id='20000000-0000-4000-8000-000000000001';
  b := public.create_demo_booking('20000000-0000-4000-8000-000000000001',null,'economy',1,100,null,gen_random_uuid());
  assert b.hold_expires_at = (select departure_at from public.flight_instances where id=b.flight_instance_id), 'Hold extends beyond departure';
  update public.flight_instances set departure_at=now()-interval '1 minute' where id=b.flight_instance_id;
  begin
    perform public.attach_demo_checkout_session(b.id,b.user_id,'cs_test_DepartedFlight');
    raise exception 'TEST: departed flight accepted Checkout';
  exception when sqlstate 'P0002' then null;
  end;

  assert not has_function_privilege('anon','public.expire_unstarted_demo_bookings()','EXECUTE'), 'Anonymous sweep access';
  assert not has_function_privilege('authenticated','public.expire_unstarted_demo_bookings()','EXECUTE'), 'Traveler sweep access';
end;
$$;
rollback;
