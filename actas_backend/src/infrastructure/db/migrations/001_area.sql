-- Extensión necesaria para generar identificadores UUID.
create extension if not exists "pgcrypto";

create table if not exists area (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique
);
