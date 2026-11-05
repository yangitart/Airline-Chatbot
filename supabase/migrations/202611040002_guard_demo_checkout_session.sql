create or replace function public.save_demo_checkout_session(p_booking_id uuid, p_session_id text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_session_id is null or p_session_id !~ '^cs_test_[A-Za-z0-9]+$' then
    raise exception using errcode = '22023', message = 'invalid_checkout_session';
  end if;

  update public.bookings
  set payment_status = 'checkout_pending',
      status = 'pending_payment',
      stripe_checkout_session_id = p_session_id
  where id = p_booking_id
    and user_id = v_user_id
    and is_demo
    and (
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

revoke all on function public.save_demo_checkout_session(uuid,text) from public, anon;
grant execute on function public.save_demo_checkout_session(uuid,text) to authenticated;
