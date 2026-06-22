create table if not exists usuario (
  id uuid primary key, -- Coincide con auth.users.id de Supabase.
  nombre text not null,
  email text not null unique,
  password_hash text not null,
  rol text not null check (rol in ('superadmin', 'admin', 'convocador', 'asistente')),
  area_id uuid references area(id),
  cargo text,
  created_at timestamptz not null default now()
);
