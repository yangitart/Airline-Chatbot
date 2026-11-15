-- Supabase Cron runs independently of page visits and app deployments.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule(
  'expire-unstarted-demo-bookings',
  '* * * * *',
  'select public.expire_unstarted_demo_bookings();'
);
