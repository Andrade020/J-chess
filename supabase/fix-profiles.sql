-- ============================================================
-- J-Chess — patch: profiles INSERT policy + trigger robusto
-- Cole no SQL Editor do Supabase e clique em Run
-- ============================================================

/* 1. Permite que o próprio usuário crie seu perfil (fallback ao trigger) */
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_insert'
  ) then
    execute 'create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id)';
  end if;
end $$;

/* 2. Trigger atualizado: usa ON CONFLICT para não quebrar em username duplicado */
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_username text;
  v_is_guest boolean;
begin
  v_username  := coalesce(new.raw_user_meta_data->>'username', null);
  v_is_guest  := coalesce((new.raw_user_meta_data->>'is_guest')::boolean, new.is_anonymous, false);

  /* gera username único para convidados */
  if v_username is null then
    v_username := 'guest_' || left(replace(new.id::text, '-', ''), 10);
  end if;

  insert into public.profiles (id, username, is_guest)
  values (new.id, v_username, v_is_guest)
  on conflict (id) do nothing;

  return new;
end;
$$;
