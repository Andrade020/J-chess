-- ============================================================
-- J-Chess — migrações incrementais (rode após schema.sql)
-- ============================================================

/* Sinaliza ao criador do lobby que alguém aceitou seu desafio */
alter table public.lobby add column if not exists game_id uuid references public.games(id);

/* Permite que a função SECURITY DEFINER atualize o lobby entry */
create policy "lobby_update_system"
  on public.lobby for update using (true);

/* ── RPC: aceitar desafio aberto do lobby ─────────────────── */
create or replace function public.accept_lobby_challenge(
  p_lobby_id    uuid,
  p_initial_state jsonb
) returns uuid language plpgsql security definer as $$
declare
  v_lobby public.lobby%rowtype;
  v_game_id uuid;
  v_is_light boolean;
begin
  select * into v_lobby from public.lobby where id = p_lobby_id for update;
  if not found then raise exception 'Desafio não encontrado'; end if;
  if v_lobby.user_id = auth.uid() then raise exception 'Não pode aceitar próprio desafio'; end if;
  if v_lobby.game_id is not null then raise exception 'Desafio já aceito'; end if;

  v_is_light := (random() > 0.5);

  insert into public.games (
    light_id, dark_id, state_json, notation_json,
    time_control_secs, time_control_inc,
    clock_light_ms, clock_dark_ms, last_move_at
  ) values (
    case when v_is_light then auth.uid()       else v_lobby.user_id end,
    case when v_is_light then v_lobby.user_id  else auth.uid()      end,
    p_initial_state, '[]'::jsonb,
    v_lobby.time_control_secs, v_lobby.time_control_inc,
    case when v_lobby.time_control_secs is not null
         then v_lobby.time_control_secs * 1000 else null end,
    case when v_lobby.time_control_secs is not null
         then v_lobby.time_control_secs * 1000 else null end,
    case when v_lobby.time_control_secs is not null then now() else null end
  ) returning id into v_game_id;

  /* sinaliza o criador do lobby: game_id foi preenchido */
  update public.lobby set game_id = v_game_id where id = p_lobby_id;

  return v_game_id;
end;
$$;

/* ── RPC: aceitar desafio direto ──────────────────────────── */
create or replace function public.accept_direct_challenge(
  p_challenge_id  uuid,
  p_initial_state jsonb
) returns uuid language plpgsql security definer as $$
declare
  v_ch      public.challenges%rowtype;
  v_game_id uuid;
  v_is_light boolean;
begin
  select * into v_ch from public.challenges where id = p_challenge_id for update;
  if not found then raise exception 'Desafio não encontrado'; end if;
  if v_ch.to_id != auth.uid() then raise exception 'Não é seu desafio'; end if;
  if v_ch.status != 'pending' then raise exception 'Desafio não está pendente'; end if;

  v_is_light := (random() > 0.5);

  insert into public.games (
    light_id, dark_id, state_json, notation_json,
    time_control_secs, time_control_inc,
    clock_light_ms, clock_dark_ms, last_move_at
  ) values (
    case when v_is_light then auth.uid()   else v_ch.from_id end,
    case when v_is_light then v_ch.from_id else auth.uid()   end,
    p_initial_state, '[]'::jsonb,
    v_ch.time_control_secs, v_ch.time_control_inc,
    case when v_ch.time_control_secs is not null
         then v_ch.time_control_secs * 1000 else null end,
    case when v_ch.time_control_secs is not null
         then v_ch.time_control_secs * 1000 else null end,
    case when v_ch.time_control_secs is not null then now() else null end
  ) returning id into v_game_id;

  update public.challenges set status = 'accepted' where id = p_challenge_id;

  return v_game_id;
end;
$$;

/* ── RPC: aplicar resultado ELO (chamado pela Edge Function) ─ */
create or replace function public.apply_game_result(
  p_player_id    uuid,
  p_rating_delta integer,
  p_won          boolean
) returns void language sql security definer as $$
  update public.profiles set
    rating       = rating + p_rating_delta,
    games_played = games_played + 1,
    games_won    = games_won + case when p_won then 1 else 0 end
  where id = p_player_id;
$$;

/* Permissões */
grant execute on function public.accept_lobby_challenge   to authenticated;
grant execute on function public.accept_direct_challenge  to authenticated;
grant execute on function public.apply_game_result        to service_role;

/* ── RPC: accept_direct_challenge com game_id ──────────────── */
-- (garante que challenges.game_id é preenchido)
alter table public.challenges add column if not exists game_id uuid references public.games(id);

create or replace function public.accept_direct_challenge(
  p_challenge_id  uuid,
  p_initial_state jsonb
) returns uuid language plpgsql security definer as $$
declare
  v_ch      public.challenges%rowtype;
  v_game_id uuid;
  v_is_light boolean;
begin
  select * into v_ch from public.challenges where id = p_challenge_id for update;
  if not found then raise exception 'Desafio não encontrado'; end if;
  if v_ch.to_id != auth.uid() then raise exception 'Não é seu desafio'; end if;
  if v_ch.status != 'pending' then raise exception 'Desafio não está pendente'; end if;

  v_is_light := (random() > 0.5);

  insert into public.games (
    light_id, dark_id, state_json, notation_json,
    time_control_secs, time_control_inc,
    clock_light_ms, clock_dark_ms, last_move_at
  ) values (
    case when v_is_light then auth.uid()   else v_ch.from_id end,
    case when v_is_light then v_ch.from_id else auth.uid()   end,
    p_initial_state, '[]'::jsonb,
    v_ch.time_control_secs, v_ch.time_control_inc,
    case when v_ch.time_control_secs is not null
         then v_ch.time_control_secs * 1000 else null end,
    case when v_ch.time_control_secs is not null
         then v_ch.time_control_secs * 1000 else null end,
    case when v_ch.time_control_secs is not null then now() else null end
  ) returning id into v_game_id;

  update public.challenges set status = 'accepted', game_id = v_game_id where id = p_challenge_id;
  return v_game_id;
end;
$$;

/* ── RPC: claim_timeout — encerra jogo por tempo esgotado ──── */
create or replace function public.claim_timeout(
  p_game_id uuid,
  p_winner  text   -- 'l' ou 'd'
) returns boolean language plpgsql security definer as $$
declare
  v_game       public.games%rowtype;
  v_elapsed_ms bigint;
  v_remaining  bigint;
  v_turn       text;
begin
  select * into v_game from public.games where id = p_game_id for update;
  if not found or v_game.status != 'active' then return false; end if;
  if v_game.clock_light_ms is null or v_game.last_move_at is null then return false; end if;

  v_elapsed_ms := extract(epoch from (now() - v_game.last_move_at)) * 1000;
  v_turn       := v_game.state_json->>'turn';

  if v_turn = 'l' then
    v_remaining := v_game.clock_light_ms - v_elapsed_ms;
  else
    v_remaining := v_game.clock_dark_ms  - v_elapsed_ms;
  end if;

  -- permite 2 segundos de tolerância para latência de rede
  if v_remaining > 2000 then return false; end if;

  -- vencedor deve ser o oposto de quem está no turno
  if (v_turn = 'l' and p_winner != 'd') or
     (v_turn = 'd' and p_winner != 'l') then return false; end if;

  update public.games
    set winner = p_winner, win_reason = 'timeout', status = 'finished'
  where id = p_game_id;

  return true;
end;
$$;

grant execute on function public.claim_timeout to authenticated;

/* ── Trigger: aplica ELO automaticamente quando jogo encerra ─ */
-- Substitui a Edge Function update-ratings que precisava ser deployada.
create or replace function public.on_game_finished()
returns trigger language plpgsql security definer as $$
declare
  v_light  public.profiles%rowtype;
  v_dark   public.profiles%rowtype;
  v_ls     float;
  v_ds     float;
  v_lk     int;
  v_dk     int;
  v_ld     int;
  v_dd     int;
begin
  -- só dispara na transição active → finished com vencedor definido
  if NEW.status != 'finished' or OLD.status = 'finished' then return NEW; end if;
  if NEW.winner is null then return NEW; end if;

  select * into v_light from public.profiles where id = NEW.light_id;
  select * into v_dark  from public.profiles where id = NEW.dark_id;
  if not found then return NEW; end if;
  if v_light.is_guest and v_dark.is_guest then return NEW; end if;

  v_ls := case NEW.winner when 'l' then 1.0 else 0.0 end;
  v_ds := 1.0 - v_ls;

  if not v_light.is_guest then
    v_lk := case when v_light.rating < 2100 then 32 else 16 end;
    v_ld := round(v_lk * (v_ls - 1.0 / (1 + pow(10.0, (v_dark.rating  - v_light.rating) / 400.0))))::int;
    update public.profiles set
      rating       = greatest(100, rating + v_ld),
      games_played = games_played + 1,
      games_won    = games_won    + (case when NEW.winner = 'l' then 1 else 0 end)
    where id = NEW.light_id;
  end if;

  if not v_dark.is_guest then
    v_dk := case when v_dark.rating < 2100 then 32 else 16 end;
    v_dd := round(v_dk * (v_ds - 1.0 / (1 + pow(10.0, (v_light.rating - v_dark.rating) / 400.0))))::int;
    update public.profiles set
      rating       = greatest(100, rating + v_dd),
      games_played = games_played + 1,
      games_won    = games_won    + (case when NEW.winner = 'd' then 1 else 0 end)
    where id = NEW.dark_id;
  end if;

  return NEW;
end;
$$;

drop trigger if exists games_finished_trigger on public.games;
create trigger games_finished_trigger
  after update on public.games
  for each row execute function public.on_game_finished();
