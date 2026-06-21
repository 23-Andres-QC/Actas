-- Evita asistencias duplicadas (ej. escanear el QR dos veces para la misma reunión).
-- Primero se eliminan duplicados existentes, conservando por (acta_id, usuario_id)
-- el registro con firma_url, y si hay varios, el más reciente.
delete from asistencia
where id in (
  select id from (
    select id,
           row_number() over (
             partition by acta_id, usuario_id
             order by (firma_url is not null) desc, fecha_hora desc, id desc
           ) as rn
    from asistencia
  ) ranked
  where rn > 1
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'asistencia_acta_usuario_unique'
  ) then
    alter table asistencia add constraint asistencia_acta_usuario_unique unique (acta_id, usuario_id);
  end if;
end $$;
