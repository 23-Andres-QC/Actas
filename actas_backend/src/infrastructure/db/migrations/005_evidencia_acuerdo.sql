create table if not exists evidencia_acuerdo (
  id uuid primary key default gen_random_uuid(),
  acuerdo_id uuid not null references acuerdo(id) on delete cascade,
  url_archivo text not null,
  tipo text not null default 'archivo' check (tipo in ('archivo', 'link')),
  fecha_subida timestamptz not null default now()
);
