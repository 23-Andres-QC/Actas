create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuario(id),
  entidad text not null,
  entidad_id uuid not null,
  accion text not null,
  fecha_hora timestamptz not null default now()
);
