create table if not exists acuerdo (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  responsable_id uuid not null references usuario(id),
  descripcion text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  estado_semaforo text not null default 'verde' check (estado_semaforo in ('verde', 'amarillo', 'rojo')),
  porcentaje_avance numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_acuerdo_acta on acuerdo(acta_id);
create index if not exists idx_acuerdo_responsable on acuerdo(responsable_id);
