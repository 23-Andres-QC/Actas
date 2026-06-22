ALTER TABLE acuerdo ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
ALTER TABLE accion ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE acuerdo a SET sort_order = sub.rn FROM (
  SELECT id, (ROW_NUMBER() OVER (PARTITION BY acta_id ORDER BY created_at) - 1)::integer AS rn FROM acuerdo
) sub WHERE a.id = sub.id;

UPDATE accion a SET sort_order = sub.rn FROM (
  SELECT id, (ROW_NUMBER() OVER (PARTITION BY acuerdo_id ORDER BY created_at) - 1)::integer AS rn FROM accion
) sub WHERE a.id = sub.id;
