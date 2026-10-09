-- Rate-limit support for the public /agende form (fiatt-session-emails edge function)
alter table public.fiatt_client_records add column if not exists ip_hash text;
create index if not exists fiatt_client_records_ip_hash_created_idx on public.fiatt_client_records (ip_hash, created_at);
create index if not exists fiatt_client_records_person_created_idx on public.fiatt_client_records (person_id, created_at);
comment on column public.fiatt_client_records.ip_hash is 'Truncated SHA-256 of submitter IP, used only for rate limiting public form submissions.';
