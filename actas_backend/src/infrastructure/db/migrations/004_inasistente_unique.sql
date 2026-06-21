-- Permite upsert de evidencia de inasistencia por (acta, usuario).
-- Postgres no soporta "ADD CONSTRAINT IF NOT EXISTS", por eso el chequeo manual.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'inasistente_acta_usuario_unique'
  ) then
    alter table inasistente add constraint inasistente_acta_usuario_unique unique (acta_id, usuario_id);
  end if;
end $$;
