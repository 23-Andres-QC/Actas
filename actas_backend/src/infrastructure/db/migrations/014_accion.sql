create table if not exists accion (
  id uuid primary key default gen_random_uuid(),
  acuerdo_id uuid not null references acuerdo(id) on delete cascade,
  descripcion text not null,
  fecha_fin date not null,
  completada boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_accion_acuerdo on accion(acuerdo_id);
