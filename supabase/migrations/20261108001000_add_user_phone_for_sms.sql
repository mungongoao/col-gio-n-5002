-- Guarda o telefone informado no cadastro para permitir contacto por SMS.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telefone text;

-- Copia o telefone dos metadados Auth para o perfil criado pelo trigger existente.
CREATE OR REPLACE FUNCTION public.sync_profile_phone_from_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.profiles
  SET telefone = NULLIF(pg_catalog.btrim(NEW.raw_user_meta_data->>'telefone'), '')
  WHERE id = NEW.id;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS zz_sync_profile_phone_after_auth_insert ON auth.users;
CREATE TRIGGER zz_sync_profile_phone_after_auth_insert
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_phone_from_auth();

REVOKE ALL ON FUNCTION public.sync_profile_phone_from_auth() FROM PUBLIC, anon, authenticated;
