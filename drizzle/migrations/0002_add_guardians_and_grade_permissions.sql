ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'encarregado';

CREATE TABLE public.guardian_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guardian_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardian_students TO authenticated;
GRANT ALL ON public.guardian_students TO service_role;
ALTER TABLE public.guardian_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guardians read own links" ON public.guardian_students
  FOR SELECT TO authenticated
  USING (guardian_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "staff manage guardian links" ON public.guardian_students
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.is_coordinator(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'coordenador')
$$;

CREATE OR REPLACE FUNCTION public.is_guardian_of(_user_id uuid, _student_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.guardian_students
    WHERE guardian_id = _user_id AND student_id = _student_id
  )
$$;

CREATE OR REPLACE FUNCTION public.can_view_subject(_user_id uuid, _subject uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_staff(_user_id)
    OR public.is_coordinator(_user_id)
    OR (
      public.has_role(_user_id, 'professor')
      AND EXISTS (
        SELECT 1
        FROM public.subjects requested
        JOIN public.subjects assigned
          ON CASE
            WHEN requested.classe = 'INIC' THEN 'pre'
            WHEN requested.classe::integer <= 6 THEN 'primario'
            ELSE 'secundario'
          END = CASE
            WHEN assigned.classe = 'INIC' THEN 'pre'
            WHEN assigned.classe::integer <= 6 THEN 'primario'
            ELSE 'secundario'
          END
        JOIN public.teacher_assignments ta ON ta.subject_id = assigned.id
        WHERE requested.id = _subject AND ta.user_id = _user_id
      )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_edit_grade(_user_id uuid, _subject uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.can_grade(_user_id, _subject) OR public.is_coordinator(_user_id)
$$;

CREATE OR REPLACE FUNCTION public.protect_grade_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_coordinator(auth.uid()) AND NOT public.can_grade(auth.uid(), NEW.subject_id) THEN
    IF TG_OP = 'INSERT' THEN
      IF NEW.mac IS NOT NULL OR NEW.npt IS NOT NULL OR NEW.qualitativo IS NOT NULL
         OR NEW.exame_escrito IS NOT NULL OR NEW.exame_oral IS NOT NULL THEN
        RAISE EXCEPTION 'O Coordenador só pode alterar faltas';
      END IF;
    ELSE
      IF NEW.student_id IS DISTINCT FROM OLD.student_id
         OR NEW.subject_id IS DISTINCT FROM OLD.subject_id
         OR NEW.trimestre IS DISTINCT FROM OLD.trimestre
         OR NEW.mac IS DISTINCT FROM OLD.mac
         OR NEW.npt IS DISTINCT FROM OLD.npt
         OR NEW.qualitativo IS DISTINCT FROM OLD.qualitativo
         OR NEW.exame_escrito IS DISTINCT FROM OLD.exame_escrito
         OR NEW.exame_oral IS DISTINCT FROM OLD.exame_oral THEN
        RAISE EXCEPTION 'O Coordenador só pode alterar faltas';
      END IF;
    END IF;
  END IF;
  IF NOT public.is_staff(auth.uid()) AND NOT public.is_coordinator(auth.uid())
     AND TG_OP = 'UPDATE' AND NEW.faltas IS DISTINCT FROM OLD.faltas THEN
    RAISE EXCEPTION 'Apenas o ADM e os Coordenadores podem alterar faltas';
  END IF;
  IF NOT public.is_staff(auth.uid()) AND NOT public.is_coordinator(auth.uid())
     AND TG_OP = 'INSERT' AND NEW.faltas <> 0 THEN
    RAISE EXCEPTION 'Apenas o ADM e os Coordenadores podem alterar faltas';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER protect_grade_fields_before_write
BEFORE INSERT OR UPDATE ON public.grades
FOR EACH ROW EXECUTE FUNCTION public.protect_grade_fields();

DROP POLICY IF EXISTS "approved read students" ON public.students;
CREATE POLICY "authorised read students" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.is_staff(auth.uid())
    OR public.is_coordinator(auth.uid())
    OR public.has_role(auth.uid(), 'professor')
    OR public.is_guardian_of(auth.uid(), id)
  );

DROP POLICY IF EXISTS "approved read grades" ON public.grades;
CREATE POLICY "authorised read grades" ON public.grades
  FOR SELECT TO authenticated
  USING (
    public.can_view_subject(auth.uid(), subject_id)
    OR public.is_guardian_of(auth.uid(), student_id)
  );

DROP POLICY IF EXISTS "graders insert" ON public.grades;
DROP POLICY IF EXISTS "graders update" ON public.grades;
DROP POLICY IF EXISTS "graders delete" ON public.grades;
CREATE POLICY "grade editors insert" ON public.grades
  FOR INSERT TO authenticated
  WITH CHECK (public.can_edit_grade(auth.uid(), subject_id));
CREATE POLICY "grade editors update" ON public.grades
  FOR UPDATE TO authenticated
  USING (public.can_edit_grade(auth.uid(), subject_id))
  WITH CHECK (public.can_edit_grade(auth.uid(), subject_id));
CREATE POLICY "graders delete" ON public.grades
  FOR DELETE TO authenticated
  USING (public.can_grade(auth.uid(), subject_id));

GRANT EXECUTE ON FUNCTION public.is_coordinator(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_guardian_of(uuid, bigint) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_view_subject(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_edit_grade(uuid, uuid) TO authenticated, service_role;