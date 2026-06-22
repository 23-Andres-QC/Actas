create table if not exists evidencia_acta (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  url_archivo text not null,
  tipo text not null default 'archivo' check (tipo in ('archivo', 'link')),
  fecha_subida timestamptz not null default now()
);

create index if not exists idx_evidencia_acta_acta on evidencia_acta(acta_id);
