create table if not exists inasistente (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  usuario_id uuid not null references usuario(id),
  evidencia_url text,
  constraint inasistente_acta_usuario_unique unique (acta_id, usuario_id)
);
