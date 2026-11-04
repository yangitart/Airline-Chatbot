create table if not exists public.demo_checkins (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  flight_leg text not null check (flight_leg in ('outbound', 'return')),
  flight_instance_id uuid not null references public.flight_instances(id),
  checked_in_at timestamptz not null default now(),
  demo_seat text not null,
  demo_boarding_pass_reference text not null unique,
  unique (booking_id, flight_leg)
);
alter table public.demo_checkins enable row level security;
drop policy if exists "Travelers read their own demo check-ins" on public.demo_checkins;
create policy "Travelers read their own demo check-ins" on public.demo_checkins
  for select to authenticated using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = (select auth.uid()))
  );
revoke all on public.demo_checkins from anon, authenticated;
grant select on public.demo_checkins to authenticated;

drop function if exists public.check_in_demo_booking(uuid);
create or replace function public.check_in_demo_booking(p_booking_id uuid, p_flight_leg text)
returns public.demo_checkins language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := (select auth.uid());
  v_booking public.bookings%rowtype;
  v_flight_id uuid;
  v_departure timestamptz;
  v_checkin public.demo_checkins%rowtype;
begin
  if v_user_id is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  if p_flight_leg not in ('outbound', 'return') then raise exception using errcode = '22023', message = 'invalid_flight_leg'; end if;
  select * into v_booking from public.bookings where id = p_booking_id and user_id = v_user_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'booking_not_found'; end if;
  if not v_booking.is_demo or v_booking.payment_status <> 'paid' then
    raise exception using errcode = '22023', message = 'payment_required';
  end if;
  if v_booking.status not in ('confirmed', 'checked_in') then
    raise exception using errcode = '22023', message = 'booking_not_eligible';
  end if;
  if p_flight_leg = 'outbound' then v_flight_id := v_booking.flight_instance_id;
  else v_flight_id := v_booking.return_flight_instance_id; end if;
  if v_flight_id is null then raise exception using errcode = '22023', message = 'flight_leg_not_found'; end if;

  select * into v_checkin from public.demo_checkins where booking_id = p_booking_id and flight_leg = p_flight_leg;
  if found then return v_checkin; end if;
  select departure_at into v_departure from public.flight_instances where id = v_flight_id and status = 'scheduled' and is_demo;
  if not found then raise exception using errcode = '22023', message = 'flight_not_checkin_eligible'; end if;
  if now() < v_departure - interval '48 hours' or now() > v_departure - interval '60 minutes' then
    raise exception using errcode = '22023', message = 'checkin_window_closed';
  end if;
  insert into public.demo_checkins(booking_id, flight_leg, flight_instance_id, demo_seat, demo_boarding_pass_reference)
  values (
    p_booking_id, p_flight_leg, v_flight_id,
    (1 + floor(random() * 30))::int::text || chr(65 + floor(random() * 6)::int),
    'DEMO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ) returning * into v_checkin;
  update public.bookings set status = 'checked_in' where id = p_booking_id;
  return v_checkin;
end;
$$;
revoke all on function public.check_in_demo_booking(uuid,text) from public, anon;
grant execute on function public.check_in_demo_booking(uuid,text) to authenticated;
