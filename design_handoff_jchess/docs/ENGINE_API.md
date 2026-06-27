# API do Motor (`game/jchess/engine.js`)

Motor de regras **puro** (sem DOM). Exposto globalmente como `window.JS`. Pode ser convertido em módulo ES (`export`) sem mudanças de lógica e rodar **no servidor** (Node) para validar lances em multiplayer/IA.

## Estado (`state`)

```js
{
  board: Array(9) of Array(9) of (Cell | null),   // board[r][c]
  hands: { l: Hand, d: Hand },                     // peças capturadas em mão
  turn:  'l' | 'd'                                 // de quem é a vez
}

// Cell
{ t: 'K'|'R'|'B'|'G'|'S'|'N'|'L'|'P', o: 'l'|'d', p: boolean }   // p = promovida

// Hand (contagem por tipo; sem Rei)
{ P: n, L: n, N: n, S: n, G: n, B: n, R: n }
```

- `r` 0..8 cima→baixo, `c` 0..8 esquerda→direita. Claro (`'l'`) embaixo avança `r--`; Escuro (`'d'`) em cima avança `r++`.
- O estado é **serializável** (JSON puro) → fácil de persistir, enviar pela rede ou guardar no banco.

## Objeto de lance (`move`)

```js
// movimento de peça no tabuleiro:
{ from: {r, c}, to: {r, c}, promote: boolean }
// drop (soltar peça da mão):
{ drop: 'P'|'L'|'N'|'S'|'G'|'B'|'R', to: {r, c} }
```

## Funções (todas em `window.JS`)

| Função | Retorno | Descrição |
|---|---|---|
| `newGame()` | `state` | posição inicial padrão, vez = `'l'`. |
| `clone(state)` | `state` | cópia profunda (board + hands). |
| `apply(state, move)` | `state` (novo) | aplica o lance e **alterna a vez**. Não muta o original. Trata captura→mão (rebaixa + troca dono) e promoção. |
| `genMoves(state, r, c)` | `[{r,c,capture}]` | movimentos **pseudo-legais** da peça em (r,c) (respeita bloqueio de sliders; ignora xeque próprio). |
| `legalTargetsFrom(state, r, c)` | `[{r,c,capture}]` | alvos **legais** (filtra os que deixam o próprio rei em xeque). Só funciona para peça do jogador da vez. |
| `legalDrops(state, type)` | `[{r,c}]` | casas onde dá pra soltar `type` (aplica sem-lance-morto, **nifu**, **uchifuzume**, e não-deixar-em-xeque). |
| `legalDropsLite(state, type)` | `[{r,c}]` | igual, **sem** uchifuzume (uso interno p/ evitar recursão). |
| `inCheck(state, owner)` | `bool` | rei de `owner` está atacado? |
| `isAttacked(state, r, c, by)` | `bool` | a casa (r,c) é atacada por alguma peça de `by`? |
| `kingPos(state, owner)` | `{r,c}\|null` | posição do rei. |
| `hasAnyLegal(state)` | `bool` | o jogador da vez tem **algum** lance legal (mover ou dropar)? |
| `gameStatus(state)` | `{over, check, mate?, winner?}` | situação: `over` (fim), `check` (vez em xeque), `mate` (era xeque), `winner` (`'l'`/`'d'`). |
| `canPromote(cell, fromR, toR)` | `bool` | a peça pode promover neste lance? |
| `mustPromote(cell, toR)` | `bool` | a promoção é obrigatória? |
| `inZone(owner, r)` | `bool` | a linha `r` está na zona de promoção de `owner`? |
| `effType(cell)` | string | tipo **efetivo** de movimento (promovidas: `P/L/N/S`→`'G'`, `R`→`'DR'`, `B`→`'HO'`). |
| `opp(o)` | `'l'\|'d'` | adversário. |
| `TYPES` | array | `['P','L','N','S','G','B','R']` (tipos que vão para a mão). |

## Exemplos

```js
// nova partida
let s = JS.newGame();

// lances legais de uma peça (peão claro em C3 = r6,c2):
const alvos = JS.legalTargetsFrom(s, 6, 2);   // ex.: [{r:5,c:2,capture:false}]

// aplicar um lance:
s = JS.apply(s, { from:{r:6,c:2}, to:{r:5,c:2}, promote:false });
// agora s.turn === 'd'

// promoção opcional?
const cell = s.board[/*...*/];
if (JS.mustPromote(cell, toR)) { /* força promote:true */ }
else if (JS.canPromote(cell, fromR, toR)) { /* perguntar ao jogador */ }

// drops do jogador da vez (peão em mão):
s.hands[s.turn].P = 1;
const onde = JS.legalDrops(s, 'P');           // respeita nifu/uchifuzume
s = JS.apply(s, { drop:'P', to:{r:5,c:4} });

// fim de jogo?
const st = JS.gameStatus(s);
if (st.over) console.log('Venceu:', st.winner, 'mate?', st.mate);
```

## Notas de validação (já testado)

- `newGame()` → 40 peças; `inCheck` falso.
- Soma dos `legalTargetsFrom` do Claro na abertura = **30** (número canônico do shogi).
- Cavaleiros iniciais sem lance (bloqueados pelos próprios peões) — correto.
- Nifu: na posição inicial todo arquivo já tem um peão, então nenhum drop de peão é legal — correto.

## Para servidor / multiplayer / IA

- **Servidor autoritativo**: rode `apply` + valide com `legalTargetsFrom`/`legalDrops` no backend; nunca confie no cliente.
- **Protocolo de lance** sugerido (compacto): `{type:'move', from:[r,c], to:[r,c], promote} | {type:'drop', piece, to:[r,c]}`. Ou use a notação `A1–A2` / `✦E5` de `RULES.md`.
- **IA simples**: como `legalTargetsFrom`/`legalDrops` já dão os lances legais, dá pra fazer minimax/alfa-beta com uma função de avaliação material + posição. O `clone`+`apply` imutáveis facilitam a busca. (Cuidado com custo: `hasAnyLegal`/checagem de xeque clonam estado; para IA profunda, otimize depois.)
