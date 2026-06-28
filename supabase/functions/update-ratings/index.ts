import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Payload {
  game_id: string
  winner: 'l' | 'd' | 'draw'
}

interface Profile {
  id: string
  rating: number
  is_guest: boolean
}

function kFactor(rating: number) {
  return rating < 2100 ? 32 : 16
}

function eloExpected(rA: number, rB: number) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400))
}

function eloDelta(rA: number, rB: number, score: number) {
  return Math.round(kFactor(rA) * (score - eloExpected(rA, rB)))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const body: Payload = await req.json()
  const { game_id, winner } = body

  /* load game */
  const { data: game } = await admin
    .from('games')
    .select('light_id, dark_id, winner')
    .eq('id', game_id)
    .single()

  if (!game) return new Response('game not found', { status: 404, headers: corsHeaders })

  /* load profiles */
  const { data: players } = await admin
    .from('profiles')
    .select('id, rating, is_guest')
    .in('id', [game.light_id, game.dark_id])

  if (!players || players.length < 2) return new Response('profiles not found', { status: 404, headers: corsHeaders })

  const light = players.find((p: Profile) => p.id === game.light_id) as Profile
  const dark  = players.find((p: Profile) => p.id === game.dark_id)  as Profile

  /* guests don't get ELO */
  if (light.is_guest && dark.is_guest) return new Response('both guests', { status: 200, headers: corsHeaders })

  const lightScore = winner === 'l' ? 1 : winner === 'draw' ? 0.5 : 0
  const darkScore  = 1 - lightScore

  const promises: Promise<unknown>[] = []

  if (!light.is_guest) {
    const delta = eloDelta(light.rating, dark.rating, lightScore)
    promises.push(admin.rpc('apply_game_result', {
      p_player_id: light.id,
      p_rating_delta: delta,
      p_won: winner === 'l',
    }))
  }

  if (!dark.is_guest) {
    const delta = eloDelta(dark.rating, light.rating, darkScore)
    promises.push(admin.rpc('apply_game_result', {
      p_player_id: dark.id,
      p_rating_delta: delta,
      p_won: winner === 'd',
    }))
  }

  await Promise.all(promises)

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
