-- Esquema inicial: identificadores UUID en todas las tablas (ver docs/database.md)
create extension if not exists "pgcrypto";

create table if not exists area (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);

create table if not exists usuario (
  id uuid primary key, -- coincide con auth.users.id de Supabase
  nombre text not null,
  email text not null unique,
  rol text not null check (rol in ('superadmin', 'admin', 'convocador', 'asistente')),
  area_id uuid references area(id),
  created_at timestamptz not null default now()
);

create table if not exists acta (
  id uuid primary key default gen_random_uuid(),
  area_id uuid not null references area(id),
  convocador_id uuid not null references usuario(id),
  titulo text not null,
  fecha timestamptz not null,
  formato text not null check (formato in ('estandar', 'ai')) default 'estandar',
  url_grabacion text,
  url_acta_fisica text,
  porcentaje_avance numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists acuerdo (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  responsable_id uuid not null references usuario(id),
  descripcion text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  estado_semaforo text not null check (estado_semaforo in ('verde', 'amarillo', 'rojo')) default 'verde',
  porcentaje_avance numeric(5,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists evidencia_acuerdo (
  id uuid primary key default gen_random_uuid(),
  acuerdo_id uuid not null references acuerdo(id) on delete cascade,
  url_archivo text not null,
  fecha_subida timestamptz not null default now()
);

create table if not exists asistencia (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  usuario_id uuid not null references usuario(id),
  metodo text not null check (metodo in ('qr', 'firma_facial')),
  fecha_hora timestamptz not null default now(),
);

create table if not exists inasistente (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  usuario_id uuid not null references usuario(id),
  evidencia_url text
);

create table if not exists evidencia_reunion (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  tipo text not null check (tipo in ('foto', 'video', 'url_grabacion')),
  url text not null
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references usuario(id),
  entidad text not null,
  entidad_id uuid not null,
  accion text not null,
  fecha_hora timestamptz not null default now()
);

create index if not exists idx_acta_area on acta(area_id);
create index if not exists idx_acuerdo_acta on acuerdo(acta_id);
create index if not exists idx_acuerdo_responsable on acuerdo(responsable_id);
create index if not exists idx_asistencia_acta on asistencia(acta_id);
