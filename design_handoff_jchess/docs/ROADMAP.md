# Roadmap — rumo ao "Chess.com do J-Chess"

Objetivo de longo prazo do dono do projeto: um site onde pessoas jogam J-Chess **com amigos (online)** e **contra a máquina**, usando infra gratuita (ex.: Supabase — não obrigatório). O estado atual é o **passo 1** (jogo local completo). Abaixo, a ordem sugerida e como o que já existe habilita cada etapa.

---

## Onde estamos
- ✅ Motor de regras completo e correto (`engine.js`), puro e portável.
- ✅ Jogo local 2 jogadores (hot-seat) com UI completa (`app.js` + `index.html`).
- ✅ 2 sets de arte, histórico com mini-arte, persistência local.

---

## Passo 2 — Polimento do hot-seat (rápido, alto valor)
- **Rotação do tabuleiro por vez** (opcional via toggle): girar 180° para o jogador da vez ficar "embaixo". Hoje a orientação é fixa (Claro embaixo). Cuidado: girar só a **apresentação**, não as coordenadas internas.
- **Notação**: hoje usamos estilo xadrez `A–I / 1–9`. Decidir se mantém ou adota a notação oficial do shogi (arquivos 9–1 da direita p/ esquerda, fileiras 一–九). O histórico já existe e é fácil de re-formatar.
- **Empate por repetição (sennichite)** e xeque perpétuo: regras que faltam. Dá pra detectar guardando hashes de posições no histórico.
- **Acessibilidade/UX**: confirmação de lance opcional, realce de "último lance" já existe; faltam sons, animações de movimento.

## Passo 3 — Oponente por IA (local, sem servidor)
- O `engine.js` já entrega todos os lances legais (`legalTargetsFrom` + `legalDrops`), `apply` imutável e `gameStatus`. Dá pra fazer **minimax + alfa-beta** com avaliação material (valores aproximados: P=1, L/N=3, S=5, G=6, B=8, R=10, promoções +~1–4) + bônus posicionais (peças em mão valem muito no shogi!).
- Rodar a busca num **Web Worker** para não travar a UI.
- Atenção a desempenho: as checagens de xeque clonam estado; para profundidade maior, otimizar (mover incremental, bitboards) depois de um MVP.

## Passo 4 — Multiplayer online (com amigos)
Arquitetura recomendada:
- **Servidor autoritativo**: porte/empacote o `engine.js` como módulo Node e **valide cada lance no backend** (nunca confie no cliente). O estado é JSON serializável — trivial de guardar/transmitir.
- **Tempo real**: WebSocket (ou Realtime do Supabase / canais). Fluxo: cliente envia `{type:'move'|'drop', ...}`; servidor valida com o engine, aplica, persiste e faz broadcast do novo estado (ou só do lance).
- **Salas/partidas**: tabela `games` (id, estado JSON, jogador_claro, jogador_escuro, vez, status, histórico). Link de convite para o amigo entrar.
- **Reconexão**: como o estado completo cabe num registro, reconectar = recarregar o estado atual.

### Por que Supabase encaixa bem (sugestão, não obrigatório)
- **Auth** (contas), **Postgres** (partidas/usuários), **Realtime** (sincronizar lances), tudo no plano free para começar. Alternativas: Firebase, ou um servidozinho Node + Socket.IO.

## Passo 5 — Produto ("Chess.com do J-Chess")
- **Contas/perfil**: cada usuário escolhe o **set de peças** e tema (já temos 2 sets + toggle de casas; a preferência já mora em `localStorage`, migrar para o perfil).
- **Matchmaking / ranking (Elo)**, histórico de partidas, espectador, revisão de lances (o histórico com mini-arte já é a semente disso).
- **Relógio** (incremento/byo-yomi), chat, tabuleiros temáticos.
- **PWA/responsivo**: o layout já é mobile-first (≤560px); dá pra empacotar como PWA.

---

## Decisões em aberto (para o dono decidir)
- Notação: estilo xadrez (atual) **ou** oficial do shogi?
- Stack do site: framework (Next.js/React, SvelteKit, etc.) + backend (Supabase vs. servidor próprio).
- Nomes definitivos das peças novas (hoje: **Marechal** = ouro, **Vanguarda** = prata, **Lanceiro** = lança). Podem mudar.
- Monetização/escopo (fora do escopo técnico atual).

## Princípios para manter
1. **`engine.js` é o núcleo.** Mesma lógica no cliente e no servidor. Não duplicar regras.
2. **Separar engine (sem DOM) da UI.** Facilita testes, IA e servidor.
3. **Cores por herança CSS** nas peças (ver `ART_SYSTEM.md`) — nada de `var()` atravessando `<use>`.
4. **Estado serializável** sempre (JSON) — habilita rede, persistência e undo.
