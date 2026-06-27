# Regras — J-Chess (shogi ocidentalizado)

Implementação fiel ao shogi padrão. Esta versão troca a **orientação** das peças por **cor** (claro × escuro) e usa silhuetas ocidentais; as regras de movimento são as do shogi.

## Tabuleiro e coordenadas

- Tabuleiro **9×9**.
- Internamente (no `engine.js`): `board[r][c]`, com `r` = 0..8 de **cima para baixo** e `c` = 0..8 da **esquerda para a direita**.
- **Claro** (`'l'`) fica embaixo e avança para **cima** (linha `r` diminui). **Escuro** (`'d'`) fica em cima e avança para **baixo** (`r` aumenta). Claro joga primeiro.
- **Notação exibida** (estilo xadrez): coluna = letra `A`..`I` (c = 0..8); linha = número `1`..`9` com `rank = 9 - r`.
  - `A1` = `(r=8, c=0)` = canto inferior-esquerdo (casa **escura**).
  - `I9` = `(r=0, c=8)` = canto superior-direito.
  - Conversão: `coord(r,c) = "ABCDEFGHI"[c] + (9 - r)`.

## Representação de uma peça

`{ t, o, p }` — `t` = tipo (`K R B G S N L P`), `o` = dono (`'l'`/`'d'`), `p` = promovida (bool).

## Movimentos (o "para frente" depende do dono)

Seja `f` o passo de linha "para frente" (`-1` para Claro, `+1` para Escuro).

| Peça | Tipo | Movimento |
|---|---|---|
| Rei | `K` | 1 casa nas 8 direções |
| Torre | `R` | desliza nas 4 ortogonais |
| Bispo | `B` | desliza nas 4 diagonais |
| Marechal (ouro) | `G` | passos: frente, 2 diagonais da frente, lados, e 1 atrás reto (6 casas) |
| Vanguarda (prata) | `S` | passos: frente + as 4 diagonais (5 casas) |
| Cavaleiro | `N` | **salta** para `(2f, ±1)` — só as 2 casas dianteiras; pula peças |
| Lanceiro | `L` | desliza para frente `(f,0)`, qualquer distância |
| Soldado | `P` | 1 casa para frente `(f,0)` |

### Peças promovidas

- **Soldado / Lanceiro / Cavaleiro / Vanguarda** promovidos andam **exatamente como o Marechal** (ouro).
- **Torre → Rei Dragão (`+R`)**: movimento de torre **+** 1 passo em cada diagonal (como o rei).
- **Bispo → Cavalo Dragão (`+B`)**: movimento de bispo **+** 1 passo em cada ortogonal (como o rei).
- **Rei** e **Marechal** nunca promovem.

(No código isso é o `effType(cell)`: peça promovida `P/L/N/S` → `'G'`; `R` → `'DR'`; `B` → `'HO'`.)

## Captura

Captura = mover para casa ocupada por peça inimiga (mesma direção do movimento). A peça capturada vai para a **mão** do capturador, **rebaixada** (perde promoção) e com o **dono trocado** (passa a ser do capturador). O Rei não é capturado (o xeque-mate encerra antes).

## Promoção

- **Zona de promoção** = as 3 fileiras do fundo inimigo. Para Claro: `r ∈ {0,1,2}`. Para Escuro: `r ∈ {6,7,8}`.
- Uma peça promovível (`P L N S R B`, não promovida) **pode** promover quando o lance **sai de**, **entra em** ou **anda dentro** da zona. Promoção é **opcional** (a UI abre um modal "Promover? / Manter").
- **Obrigatória** quando, sem promover, a peça não teria mais lance legal:
  - Soldado e Lanceiro ao chegar na **última** fileira.
  - Cavaleiro ao chegar nas **duas últimas** fileiras.
- (No código: `canPromote(cell, fromR, toR)` e `mustPromote(cell, toR)`.)

## Drops (recolocar peça da mão)

Na sua vez, em vez de mover, você pode **soltar** uma peça da sua mão numa casa **vazia**. Restrições:

1. **Sem lance morto**: não pode soltar Soldado/Lanceiro na última fileira, nem Cavaleiro nas duas últimas (a peça precisa ter ao menos um movimento futuro).
2. **Nifu (二歩)**: não pode soltar um Soldado numa coluna onde você já tem um Soldado **seu não-promovido**.
3. **Uchifuzume (打ち歩詰め)**: não pode soltar um Soldado se isso resultar em **xeque-mate imediato**. (Dar xeque com o drop é permitido; dar *mate* com peão dropado, não.)
4. Peça dropada entra sempre **não-promovida** e do dono que dropou.
5. Não pode deixar o **próprio rei em xeque** (vale para qualquer lance).

(No código: `legalDrops(state, type)` aplica tudo; `legalDropsLite` aplica tudo menos uchifuzume — usado internamente para detecção de mate sem recursão infinita.)

## Xeque e fim de jogo

- **Xeque**: o rei do jogador da vez está atacado (`inCheck`).
- Um lance é **ilegal** se deixar o próprio rei em xeque (filtrado em `legalTargetsFrom` e nos drops).
- **Xeque-mate / fim**: o jogador da vez **não tem nenhum lance legal** (`hasAnyLegal === false`). Se estava em xeque, é xeque-mate; vence o adversário. (No shogi praticamente não há afogamento por causa dos drops; o código trata "sem lance legal" como derrota de quem está na vez.)
- **Não implementado ainda**: empate por repetição quádrupla (*sennichite*) e a regra de xeque perpétuo. Ver ROADMAP.

## Notação dos lances (usada no histórico)

Formato compacto exibido no painel de histórico:

- Movimento simples: `C3–C4`
- Captura: `C3×D4` (usa `×`)
- Com promoção: `B7–B8+` (sufixo `+`)
- Drop: `✦E5` (peça da mão solta em E5)

O ícone da peça (mini-arte) acompanha cada lance, no set escolhido.

## Posição inicial (para referência)

```
  A  B  C  D  E  F  G  H  I
9 L  N  S  G  K  G  S  N  L   ← Escuro (topo, r=0)
8 .  R  .  .  .  .  .  B  .
7 P  P  P  P  P  P  P  P  P
6 .  .  .  .  .  .  .  .  .
5 .  .  .  .  .  .  .  .  .
4 .  .  .  .  .  .  .  .  .
3 P  P  P  P  P  P  P  P  P
2 .  B  .  .  .  .  .  R  .
1 L  N  S  G  K  G  S  N  L   ← Claro (base, r=8)
```

(Torre/Bispo na 2ª fileira espelhados por simetria de 180°, como no shogi. Ambos os Reis na coluna central E.)
