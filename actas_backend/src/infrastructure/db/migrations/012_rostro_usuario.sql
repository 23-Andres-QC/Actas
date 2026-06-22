create table if not exists rostro_usuario (
  usuario_id uuid primary key references usuario(id) on delete cascade,
  embedding double precision[] not null,
  actualizado_en timestamptz not null default now()
);
