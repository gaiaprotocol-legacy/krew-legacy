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
        'https://sfwnwiuxgehxbyystchq.supabase.co/functions/v1/track-krew-personal-events',
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmd253aXV4Z2VoeGJ5eXN0Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyMTA5OTYsImV4cCI6MjAxNTc4Njk5Nn0.iQ9aIdYmqKOdeAXonb6LFy9DLSVMlWycxleueEIOZes"}'::JSONB
    ) AS request_id;
    $$
  );

select
  cron.schedule(
    'track-krew-communal-events-every-10-minutes',
    '1,11,21,31,41,51 * * * *',
    $$
    select net.http_get(
        'https://sfwnwiuxgehxbyystchq.supabase.co/functions/v1/track-krew-communal-events',
        headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmd253aXV4Z2VoeGJ5eXN0Y2hxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAyMTA5OTYsImV4cCI6MjAxNTc4Njk5Nn0.iQ9aIdYmqKOdeAXonb6LFy9DLSVMlWycxleueEIOZes"}'::JSONB
    ) AS request_id;
    $$
  );
```
