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
  IF NOT public.has_role(auth.uid(), 'admin') AND NOT public.is_coordinator(auth.uid())
     AND TG_OP = 'UPDATE' AND NEW.faltas IS DISTINCT FROM OLD.faltas THEN
    RAISE EXCEPTION 'Apenas o ADM e os Coordenadores podem alterar faltas';
  END IF;
  IF NOT public.has_role(auth.uid(), 'admin') AND NOT public.is_coordinator(auth.uid())
     AND TG_OP = 'INSERT' AND NEW.faltas <> 0 THEN
    RAISE EXCEPTION 'Apenas o ADM e os Coordenadores podem alterar faltas';
  END IF;
  RETURN NEW;
END
$$;