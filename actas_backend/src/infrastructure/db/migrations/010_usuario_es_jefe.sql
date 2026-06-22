alter table usuario add column if not exists es_jefe boolean not null default false;

-- Solo puede haber un jefe por área
create unique index if not exists idx_area_un_jefe on usuario(area_id) where es_jefe = true;
