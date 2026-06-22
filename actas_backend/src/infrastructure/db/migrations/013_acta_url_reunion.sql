alter table acta add column if not exists url_reunion text;
alter table acta add column if not exists qr_token text not null default gen_random_uuid()::text;
create unique index if not exists idx_acta_qr_token on acta(qr_token);
