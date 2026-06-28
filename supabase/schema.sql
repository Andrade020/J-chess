-- ============================================================
-- J-Chess — schema completo
-- Execute no SQL Editor do Supabase (em ordem)
-- ============================================================

-- ── Extensões ────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Tabelas ──────────────────────────────────────────────────

-- Perfil público (1:1 com auth.users)
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  username    text        unique not null,
  rating      integer     not null default 1500,
  games_played integer    not null default 0,
  games_won   integer     not null default 0,
  games_drawn integer     not null default 0,
  is_guest    boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- Partida (online ou vs IA arquivada)
create table public.games (
  id                uuid        primary key default gen_random_uuid(),
  light_id          uuid        references public.profiles(id),
  dark_id           uuid        references public.profiles(id),
  state_json        jsonb       not null,
  notation_json     jsonb       not null default '[]',
  last_move_json    jsonb,
  status            text        not null default 'active'
                                check (status in ('active','finished','abandoned')),
  winner            text        check (winner in ('l','d')),
  win_reason        text        check (win_reason in ('checkmate','timeout','resign','abandon')),
  -- relógio: ms restantes no momento do último lance + timestamp desse lance
  -- o cliente deduz o tempo real: clock_X_ms - (now - last_move_at)
  time_control_secs integer,
  time_control_inc  integer     not null default 0,
  clock_light_ms    integer,
  clock_dark_ms     integer,
  last_move_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Desafios abertos (lobby)
create table public.lobby (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles(id) on delete cascade,
  time_control_secs integer,
  time_control_inc  integer     not null default 0,
  rating_min        integer,
  rating_max        integer,
  created_at        timestamptz not null default now()
);

-- Desafios diretos (user → user)
create table public.challenges (
  id                uuid        primary key default gen_random_uuid(),
  from_id           uuid        not null references public.profiles(id) on delete cascade,
  to_id             uuid        not null references public.profiles(id) on delete cascade,
  time_control_secs integer,
  time_control_inc  integer     not null default 0,
  status            text        not null default 'pending'
                                check (status in ('pending','accepted','declined','expired')),
  created_at        timestamptz not null default now()
);

-- ── Triggers ─────────────────────────────────────────────────

-- Cria perfil automaticamente ao registrar usuário
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, is_guest)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'convidado#' || floor(random() * 9000 + 1000)::text
    ),
    coalesce((new.raw_user_meta_data->>'is_guest')::boolean, false)
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Atualiza updated_at em games a cada UPDATE
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_updated_at
  before update on public.games
  for each row execute procedure public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────
alter table public.profiles  enable row level security;
alter table public.games     enable row level security;
alter table public.lobby     enable row level security;
alter table public.challenges enable row level security;

-- profiles: leitura pública; só o dono atualiza
create policy "profiles_select"
  on public.profiles for select using (true);

create policy "profiles_update"
  on public.profiles for update using (auth.uid() = id);

-- games: participantes lêem e atualizam; partidas finalizadas são públicas
create policy "games_select"
  on public.games for select
  using (auth.uid() = light_id or auth.uid() = dark_id or status = 'finished');

create policy "games_insert"
  on public.games for insert
  with check (auth.uid() = light_id or auth.uid() = dark_id);

create policy "games_update"
  on public.games for update
  using (auth.uid() = light_id or auth.uid() = dark_id);

-- lobby: leitura pública; usuário gerencia própria entrada
create policy "lobby_select"  on public.lobby for select using (true);
create policy "lobby_insert"  on public.lobby for insert with check (auth.uid() = user_id);
create policy "lobby_delete"  on public.lobby for delete using (auth.uid() = user_id);

-- challenges: remetente e destinatário lêem; remetente cria; destinatário atualiza
create policy "challenges_select"
  on public.challenges for select
  using (auth.uid() = from_id or auth.uid() = to_id);

create policy "challenges_insert"
  on public.challenges for insert with check (auth.uid() = from_id);

create policy "challenges_update"
  on public.challenges for update using (auth.uid() = to_id);

-- ── Grants ────────────────────────────────────────────────────
-- Sem estes grants os roles recebem 403 mesmo com políticas RLS corretas
grant usage on schema public to anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant insert on public.profiles to authenticated;
grant update on public.profiles to authenticated;

grant select on public.games to anon, authenticated;
grant insert on public.games to authenticated;
grant update on public.games to authenticated;

grant select on public.lobby to anon, authenticated;
grant insert on public.lobby to authenticated;
grant update on public.lobby to authenticated;
grant delete on public.lobby to authenticated;

grant select on public.challenges to authenticated;
grant insert on public.challenges to authenticated;
grant update on public.challenges to authenticated;
grant delete on public.challenges to authenticated;

-- ── Realtime ─────────────────────────────────────────────────
-- Habilita mudanças em tempo real nas tabelas relevantes
alter publication supabase_realtime add table public.games;
alter publication supabase_realtime add table public.lobby;
alter publication supabase_realtime add table public.challenges;
