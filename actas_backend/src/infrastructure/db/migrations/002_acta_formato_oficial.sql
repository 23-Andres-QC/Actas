-- Alinea la tabla `acta` con el formato físico oficial "ACTA DE REUNIÓN"
-- y agrega el "Cargo" institucional del usuario (distinto del rol del sistema).
alter table acta add column if not exists tipo_reunion text check (tipo_reunion in ('interna', 'externa'));
alter table acta add column if not exists proceso text check (proceso in ('estrategico', 'operativo', 'soporte'));
alter table acta add column if not exists lugar text;
alter table acta add column if not exists hora_inicio time;
alter table acta add column if not exists hora_fin time;
alter table acta add column if not exists objetivo text;
alter table acta add column if not exists agenda text;
alter table acta add column if not exists desarrollo text;

alter table usuario add column if not exists cargo text;
