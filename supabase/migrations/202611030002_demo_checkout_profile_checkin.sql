alter table public.bookings
  add column if not exists payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'checkout_pending', 'paid', 'failed')),
  add column if not exists stripe_checkout_session_id text unique,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists checked_in_at timestamptz,
  add column if not exists demo_seat text,
  add column if not exists demo_boarding_pass_reference text unique;

alter table public.bookings drop constraint if exists bookings_status_check;
alter table public.bookings add constraint bookings_status_check
  check (status in ('demo_saved', 'pending_payment', 'confirmed', 'failed', 'expired', 'cancelled', 'checked_in'));

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 100),
  phone text not null default '' check (char_length(phone) <= 40),
  preferred_language text not null default 'en' check (preferred_language in ('en', 'es')),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
drop policy if exists "Travelers manage their own profile" on public.profiles;
create policy "Travelers manage their own profile" on public.profiles
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
grant select, insert, update on public.profiles to authenticated;

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
alter table public.stripe_webhook_events enable row level security;
revoke all on public.stripe_webhook_events from anon, authenticated;

create or replace function public.apply_demo_checkout_event(
  p_event_id text, p_event_type text, p_session_id text, p_payment_intent_id text, p_payment_status text
) returns boolean language plpgsql security definer set search_path = '' as $$
declare v_booking_id uuid;
begin
  insert into public.stripe_webhook_events(event_id, event_type)
    values (p_event_id, p_event_type) on conflict do nothing;
  if not found then return false; end if;
  update public.bookings set
    payment_status = case when p_payment_status = 'paid' then 'paid' else 'failed' end,
    status = case when p_payment_status = 'paid' then 'confirmed' else 'failed' end,
    stripe_payment_intent_id = p_payment_intent_id
  where stripe_checkout_session_id = p_session_id and is_demo and payment_status <> 'paid'
  returning id into v_booking_id;
  return v_booking_id is not null;
end;
$$;
revoke all on function public.apply_demo_checkout_event(text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.apply_demo_checkout_event(text,text,text,text,text) to service_role;

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
