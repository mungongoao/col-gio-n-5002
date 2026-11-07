-- Bootstrap seguro do primeiro administrador.
-- O registo é reivindicado uma única vez e permanece reservado mesmo que
-- a conta Auth inicial venha a ser eliminada posteriormente.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.bootstrap_admin_claim (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton = true),
  user_id uuid NOT NULL UNIQUE,
  claimed_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON TABLE private.bootstrap_admin_claim FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  _cargo text;
  _claimed_user_id uuid;
  _is_first_user boolean := false;
BEGIN
  -- Serializa cadastros simultâneos para que apenas um possa reivindicar o ADM.
  PERFORM pg_catalog.pg_advisory_xact_lock(424242);

  INSERT INTO private.bootstrap_admin_claim (singleton, user_id)
  VALUES (true, NEW.id)
  ON CONFLICT (singleton) DO NOTHING
  RETURNING user_id INTO _claimed_user_id;

  _is_first_user := (_claimed_user_id = NEW.id);
  _cargo := COALESCE(NULLIF(NEW.raw_user_meta_data->>'cargo', ''), 'professor');

  INSERT INTO public.profiles (id, nome, email, cargo_pretendido, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.email, ''),
    _cargo,
    CASE WHEN _is_first_user THEN 'APROVADO' ELSE 'PENDENTE' END
  );

  IF _is_first_user THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$function$;

-- O trigger executa a função automaticamente em cada novo cadastro Auth.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- A função é executável pelo mecanismo de trigger, não por chamadas directas
-- de utilizadores da aplicação.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
