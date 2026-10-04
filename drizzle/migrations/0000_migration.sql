
CREATE TYPE public.app_role AS ENUM ('admin','pedagogico','coordenador','professor');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  nome text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  cargo_pretendido text NOT NULL DEFAULT 'professor',
  status text NOT NULL DEFAULT 'PENDENTE',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles r JOIN public.profiles p ON p.id = r.user_id
    WHERE r.user_id = _user_id AND r.role = _role AND p.status = 'APROVADO')
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND status = 'APROVADO')
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'admin') OR public.has_role(_user_id,'pedagogico')
$$;

CREATE POLICY "own or staff read profiles" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "own update name" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND status = (SELECT status FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "own or staff read roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE first_user boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO first_user;
  INSERT INTO public.profiles (id, nome, email, cargo_pretendido, status)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome',''), COALESCE(NEW.email,''),
          COALESCE(NEW.raw_user_meta_data->>'cargo','professor'),
          CASE WHEN first_user THEN 'APROVADO' ELSE 'PENDENTE' END);
  IF first_user THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- credenciar / revogar
CREATE OR REPLACE FUNCTION public.credenciar_usuario(_uid uuid, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF _role = 'admin' AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Só o ADM pode atribuir cargo de ADM'; END IF;
  IF public.has_role(_uid,'admin') AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _uid;
  INSERT INTO public.user_roles (user_id, role) VALUES (_uid, _role);
  UPDATE public.profiles SET status = 'APROVADO' WHERE id = _uid;
END $$;

CREATE OR REPLACE FUNCTION public.revogar_usuario(_uid uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  IF _uid = auth.uid() THEN RAISE EXCEPTION 'Não pode revogar a si próprio'; END IF;
  IF public.has_role(_uid,'admin') AND NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Sem permissão'; END IF;
  UPDATE public.profiles SET status = 'REVOGADO' WHERE id = _uid;
END $$;

-- Instituição (linha única)
CREATE TABLE public.institution_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  republica text NOT NULL DEFAULT 'República de Angola',
  ministerio text NOT NULL DEFAULT 'Ministério da Educação',
  direccao_municipal text NOT NULL DEFAULT '',
  nome_escola text NOT NULL DEFAULT 'Complexo Escolar Privado J. ZYMAR',
  logo_url text,
  pauta_pedagogico text NOT NULL DEFAULT '',
  pauta_direccao text NOT NULL DEFAULT '',
  boletim_coord_tarde text NOT NULL DEFAULT '',
  boletim_coord_manha text NOT NULL DEFAULT '',
  ano_lectivo text NOT NULL DEFAULT '2026/2027'
);
GRANT SELECT ON public.institution_settings TO anon, authenticated;
GRANT UPDATE ON public.institution_settings TO authenticated;
GRANT ALL ON public.institution_settings TO service_role;
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.institution_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin update settings" ON public.institution_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.institution_settings (id) VALUES (1);

-- Disciplinas
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classe text NOT NULL,
  nome text NOT NULL,
  extra boolean NOT NULL DEFAULT false,
  ordem int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (classe, nome)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved read subjects" ON public.subjects FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "staff write subjects" ON public.subjects FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Alunos
CREATE TABLE public.students (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL,
  bi text NOT NULL DEFAULT '',
  telefone text NOT NULL DEFAULT '',
  idade int,
  genero text NOT NULL CHECK (genero IN ('M','F')),
  classe text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved read students" ON public.students FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "staff write students" ON public.students FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Atribuição de disciplinas a professores
CREATE TABLE public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  UNIQUE (user_id, subject_id)
);
GRANT SELECT, INSERT, DELETE ON public.teacher_assignments TO authenticated;
GRANT ALL ON public.teacher_assignments TO service_role;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved read assignments" ON public.teacher_assignments FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "staff write assignments" ON public.teacher_assignments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.can_grade(_uid uuid, _subject uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_staff(_uid) OR (public.has_role(_uid,'professor') AND EXISTS (
    SELECT 1 FROM public.teacher_assignments WHERE user_id = _uid AND subject_id = _subject))
$$;

-- Notas
CREATE TABLE public.grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  trimestre int NOT NULL CHECK (trimestre BETWEEN 1 AND 3),
  mac numeric,
  npt numeric,
  qualitativo text,
  exame_escrito numeric,
  exame_oral numeric,
  faltas int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, subject_id, trimestre)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grades TO authenticated;
GRANT ALL ON public.grades TO service_role;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved read grades" ON public.grades FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "graders insert" ON public.grades FOR INSERT TO authenticated WITH CHECK (public.can_grade(auth.uid(), subject_id));
CREATE POLICY "graders update" ON public.grades FOR UPDATE TO authenticated USING (public.can_grade(auth.uid(), subject_id)) WITH CHECK (public.can_grade(auth.uid(), subject_id));
CREATE POLICY "graders delete" ON public.grades FOR DELETE TO authenticated USING (public.can_grade(auth.uid(), subject_id));
