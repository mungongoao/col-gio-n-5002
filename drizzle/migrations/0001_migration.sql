DROP POLICY "own update name" ON public.profiles;
REVOKE UPDATE ON public.profiles FROM authenticated;