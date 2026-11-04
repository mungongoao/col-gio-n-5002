-- Arquivo de alunos e utilizadores: restauro durante 15 dias.
alter table public.students add column if not exists deleted_at timestamptz;
alter table public.profiles add column if not exists deleted_at timestamptz;

create index if not exists students_deleted_at_idx on public.students (deleted_at) where deleted_at is not null;
create index if not exists profiles_deleted_at_idx on public.profiles (deleted_at) where deleted_at is not null;

create or replace function public.restaurar_utilizador(_uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.has_role(auth.uid(), 'admin') then
    raise exception 'Apenas o ADM pode restaurar utilizadores.';
  end if;
  update public.profiles set deleted_at = null where id = _uid and deleted_at is not null;
end;
$$;
grant execute on function public.restaurar_utilizador(uuid) to authenticated;

-- Limpeza automática diária dos registos cujo prazo de 15 dias terminou.
create or replace function public.purgar_lixo_expirado()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users
  where id in (select id from public.profiles where deleted_at <= now() - interval '15 days');
  delete from public.teacher_assignments
  where user_id in (select id from public.profiles where deleted_at <= now() - interval '15 days');
  delete from public.guardian_students
  where guardian_id in (select id from public.profiles where deleted_at <= now() - interval '15 days');
  delete from public.user_roles
  where user_id in (select id from public.profiles where deleted_at <= now() - interval '15 days');
  delete from public.profiles where deleted_at <= now() - interval '15 days';
  delete from public.students where deleted_at <= now() - interval '15 days';
end;
$$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    if not exists (select 1 from cron.job where jobname = 'jzymar-purgar-lixo-diario') then
      perform cron.schedule('jzymar-purgar-lixo-diario', '15 2 * * *', 'select public.purgar_lixo_expirado()');
    end if;
  end if;
end;
$$;
