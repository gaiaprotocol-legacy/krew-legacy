## Init
```
supabase link --project-ref XXX
supabase secrets set --env-file ./supabase/.env
supabase functions deploy
supabase db dump -f supabase/seed.sql
```