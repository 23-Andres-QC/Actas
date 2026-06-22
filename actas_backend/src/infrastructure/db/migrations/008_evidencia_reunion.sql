create table if not exists evidencia_reunion (
  id uuid primary key default gen_random_uuid(),
  acta_id uuid not null references acta(id) on delete cascade,
  tipo text not null check (tipo in ('foto', 'video', 'url_grabacion')),
  url text not null
);
