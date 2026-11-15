create index if not exists flight_instances_featured_date_idx
  on public.flight_instances (departure_date)
  where status = 'scheduled';

create index if not exists flight_status_snapshots_date_latest_idx
  on public.flight_status_snapshots (flight_date, fetched_at desc, id);
