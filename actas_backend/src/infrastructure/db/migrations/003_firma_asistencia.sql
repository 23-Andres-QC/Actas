-- Soporte para adjuntar la firma (imagen subida o dibujada) al registro de asistencia.
alter table asistencia add column if not exists firma_url text;
