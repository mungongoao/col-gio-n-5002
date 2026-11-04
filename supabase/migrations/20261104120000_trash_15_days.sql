-- Arquivo de alunos e utilizadores: restauro durante 15 dias.
alter table public.students add column if not exists deleted_at timestamptz;
alter table public.profiles add column if not exists deleted_at timestamptz;

create index if not exists students_deleted_at_idx on public.students (deleted_at) where deleted_at is not null;
create index if not exists profiles_deleted_at_idx on public.profiles (deleted_at) where deleted_at is not null;

-- Contas arquivadas perdem imediatamente as permissões, mesmo antes da purga.
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $
  select exists (
    select 1 from public.user_roles r
    join public.profiles p on p.id = r.user_id
    where r.user_id = _user_id and r.role = _role
      and p.status = 'APROVADO' and p.deleted_at is null
  )
$;

create or replace function public.is_approved(_user_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $
  select exists (
    select 1 from public.profiles
    where id = _user_id and status = 'APROVADO' and deleted_at is null
  )
$;

-- Alunos arquivados deixam de aparecer para professores e encarregados;
-- o pessoal autorizado continua a poder consultá-los na página Lixo.
drop policy if exists "authorised read students" on public.students;
create policy "authorised read active students" on public.students
  for select to authenticated
  using (
    deleted_at is null and (
      public.is_staff(auth.uid())
      or public.is_coordinator(auth.uid())
      or public.has_role(auth.uid(), 'professor')
      or public.is_guardian_of(auth.uid(), id)
    )
  );
create policy "staff read archived students" on public.students
  for select to authenticated
  using (deleted_at is not null and public.is_staff(auth.uid()));

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
