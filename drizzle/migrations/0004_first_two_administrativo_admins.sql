CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _cargo text; _admins int; _auto boolean := false;
BEGIN
  _cargo := COALESCE(NEW.raw_user_meta_data->>'cargo','professor');
  PERFORM pg_advisory_xact_lock(424242);
  IF _cargo = 'administrativo' THEN
    SELECT count(*) INTO _admins FROM public.user_roles WHERE role = 'admin';
    _auto := _admins < 2;
  END IF;
  INSERT INTO public.profiles (id, nome, email, cargo_pretendido, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome',''), COALESCE(NEW.email,''), _cargo,
          CASE WHEN _auto THEN 'APROVADO' ELSE 'PENDENTE' END);
  IF _auto THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $function$;