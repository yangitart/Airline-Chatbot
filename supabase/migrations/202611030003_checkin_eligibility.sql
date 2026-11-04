create or replace function public.check_in_demo_booking(p_booking_id uuid)
returns public.bookings language plpgsql security definer set search_path = '' as $$
declare v_user_id uuid := (select auth.uid()); v_booking public.bookings%rowtype; v_departure timestamptz;
begin
  if v_user_id is null then raise exception using errcode = '28000', message = 'authentication_required'; end if;
  select * into v_booking from public.bookings where id = p_booking_id and user_id = v_user_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'booking_not_found'; end if;
  if not v_booking.is_demo or v_booking.payment_status <> 'paid' then
    raise exception using errcode = '22023', message = 'payment_required';
  end if;
  if v_booking.status not in ('confirmed', 'checked_in') then
    raise exception using errcode = '22023', message = 'booking_not_eligible';
  end if;
  if v_booking.checked_in_at is not null then return v_booking; end if;
  select departure_at into v_departure from public.flight_instances where id = v_booking.flight_instance_id;
  if now() < v_departure - interval '48 hours' or now() > v_departure - interval '60 minutes' then
    raise exception using errcode = '22023', message = 'checkin_window_closed';
  end if;
  update public.bookings set status = 'checked_in', checked_in_at = now(),
    demo_seat = (1 + floor(random() * 30))::int::text || 'A',
    demo_boarding_pass_reference = 'DEMO-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  where id = p_booking_id returning * into v_booking;
  return v_booking;
end;
$$;
revoke all on function public.check_in_demo_booking(uuid) from public, anon;
grant execute on function public.check_in_demo_booking(uuid) to authenticated;
