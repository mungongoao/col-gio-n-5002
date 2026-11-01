COMMENT ON COLUMN public.students.bi IS 'DEPRECATED: removed from student registration; kept empty for compatibility';
COMMENT ON COLUMN public.students.telefone IS 'DEPRECATED: removed from student registration; kept empty for compatibility';
COMMENT ON COLUMN public.students.idade IS 'DEPRECATED: removed from student registration; kept null for compatibility';
ALTER TABLE public.teacher_assignments ADD COLUMN turmas text[] NOT NULL DEFAULT '{}';
COMMENT ON COLUMN public.teacher_assignments.turmas IS 'Empty array preserves legacy access to every turma; otherwise only the listed turmas are editable. No limit on subjects.';
CREATE OR REPLACE FUNCTION public.can_grade_student(_uid uuid, _subject uuid, _student bigint)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT public.is_staff(_uid) OR (public.has_role(_uid,'professor') AND EXISTS (
 SELECT 1 FROM public.teacher_assignments ta JOIN public.students s ON s.id = _student JOIN public.subjects d ON d.id = ta.subject_id
 WHERE ta.user_id = _uid AND ta.subject_id = _subject AND s.classe = d.classe AND (cardinality(ta.turmas)=0 OR s.turma = ANY(ta.turmas))));
$$;
GRANT EXECUTE ON FUNCTION public.can_grade_student(uuid,uuid,bigint) TO authenticated;
ALTER POLICY "grade editors insert" ON public.grades WITH CHECK (public.can_grade_student(auth.uid(),subject_id,student_id) OR public.is_coordinator(auth.uid()));
ALTER POLICY "grade editors update" ON public.grades USING (public.can_grade_student(auth.uid(),subject_id,student_id) OR public.is_coordinator(auth.uid())) WITH CHECK (public.can_grade_student(auth.uid(),subject_id,student_id) OR public.is_coordinator(auth.uid()));
ALTER POLICY "graders delete" ON public.grades USING (public.can_grade_student(auth.uid(),subject_id,student_id));