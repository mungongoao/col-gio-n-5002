CREATE TABLE public.faltas_alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id bigint NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  trimestre integer NOT NULL,
  faltas integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, trimestre)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faltas_alunos TO authenticated;
GRANT ALL ON public.faltas_alunos TO service_role;
ALTER TABLE public.faltas_alunos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authorised read faltas" ON public.faltas_alunos FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) OR public.is_coordinator(auth.uid()) OR public.has_role(auth.uid(),'professor') OR public.is_guardian_of(auth.uid(), student_id));
CREATE POLICY "adm coord write faltas" ON public.faltas_alunos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_coordinator(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_coordinator(auth.uid()));