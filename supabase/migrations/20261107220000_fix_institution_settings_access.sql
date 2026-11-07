-- Garante que as definições da instituição têm um registo editável
-- e que apenas o administrador aprovado pode inserir/actualizar esses dados.

INSERT INTO public.institution_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS institution_settings_admin_manage
  ON public.institution_settings;

CREATE POLICY institution_settings_admin_manage
  ON public.institution_settings
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
