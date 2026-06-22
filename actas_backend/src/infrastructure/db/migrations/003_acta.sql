create table if not exists acta (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references area(id),
  convocador_id uuid not null references usuario(id),
  titulo text not null,
  fecha timestamptz not null,
  formato text not null default 'estandar' check (formato in ('estandar', 'ai')),
  tipo_reunion text check (tipo_reunion in ('interna', 'externa')),
  proceso text check (proceso in ('estrategico', 'operativo', 'soporte')),
  lugar text,
  hora_inicio time,
  hora_fin time,
  objetivo text,
  agenda text,
  url_grabacion text,
  url_acta_fisica text,
  url_reunion text,
  qr_token text not null default gen_random_uuid()::text,
  porcentaje_avance numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_acta_area on acta(area_id);
create unique index if not exists idx_acta_qr_token on acta(qr_token);

-- Invitados fijados al crear la acta (no se recalculan si el área cambia después).
create table if not exists acta_invitado (
  acta_id uuid not null references acta(id) on delete cascade,
  usuario_id uuid not null references usuario(id) on delete cascade,
  primary key (acta_id, usuario_id)
);
