create table if not exists asistencia (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  usuario_id uuid not null references usuario(id),
  metodo text not null check (metodo in ('qr', 'firma_facial')),
  fecha_hora timestamptz not null default now(),
  firma_url text,
  constraint asistencia_acta_usuario_unique unique (acta_id, usuario_id)
);

create index if not exists idx_asistencia_acta on asistencia(acta_id);
