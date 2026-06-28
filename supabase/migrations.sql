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
