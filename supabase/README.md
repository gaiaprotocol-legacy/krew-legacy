## Init
```
supabase link --project-ref XXX
supabase secrets set --env-file ./supabase/.env
supabase functions deploy
supabase db dump -f supabase/seed.sql
```

```sql
select * from cron.job;
```

```sql
select * from cron.job_run_details;
```

```sql
select
  cron.schedule(
    'track-krew-personal-events-every-10-minutes',
    '*/10 * * * *',
    $$
    select net.http_get(
        'https://nvpcdfjnookurpbeixkt.supabase.co/functions/v1/track-krew-personal-events',
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cGNkZmpub29rdXJwYmVpeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE5NTkyNTUsImV4cCI6MjAxNzUzNTI1NX0.55I5dRBCvMR1DoZ94Nf0PASTyLRURHWcP8-uGP1zlns"}'::JSONB
    ) AS request_id;
    $$
  );

select
  cron.schedule(
    'track-krew-communal-events-every-10-minutes',
    '1,11,21,31,41,51 * * * *',
    $$
    select net.http_get(
        'https://nvpcdfjnookurpbeixkt.supabase.co/functions/v1/track-krew-communal-events',
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cGNkZmpub29rdXJwYmVpeGt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDE5NTkyNTUsImV4cCI6MjAxNzUzNTI1NX0.55I5dRBCvMR1DoZ94Nf0PASTyLRURHWcP8-uGP1zlns"}'::JSONB
    ) AS request_id;
    $$
  );
```
