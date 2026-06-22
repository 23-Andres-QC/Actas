create table if not exists acta_documento (
  acta_id uuid primary key references acta(id) on delete cascade,
  path text not null,
  version text not null,
  updated_at timestamptz not null default now()
);
