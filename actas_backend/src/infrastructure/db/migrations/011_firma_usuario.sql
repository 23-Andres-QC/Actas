create table if not exists firma_usuario (
  usuario_id uuid primary key references usuario(id) on delete cascade,
  firma_url text not null,
  actualizado_en timestamptz not null default now()
);
