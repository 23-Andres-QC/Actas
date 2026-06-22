create table if not exists evidencia_accion (
  id uuid primary key default gen_random_uuid(),
  accion_id uuid not null references accion(id) on delete cascade,
  url_archivo text not null,
  tipo text not null default 'archivo' check (tipo in ('archivo', 'link')),
  fecha_subida timestamptz not null default now()
);

create index if not exists idx_evidencia_accion_accion on evidencia_accion(accion_id);
