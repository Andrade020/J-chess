# J-Chess — Pacote de Continuação (Handoff)

> **Shogi "ocidentalizado"**: xadrez japonês jogado com **peças em formato** (silhuetas estilo xadrez ocidental) no lugar dos caracteres japoneses, com **cor** definindo o dono (claro × escuro) em vez da orientação.

Este pacote reúne **tudo** que foi produzido até agora — o jogo funcional, as artes das peças, o manual de regras, a API do motor e o roadmap — de forma que outra IA (ex.: Claude Code) consiga **continuar exatamente daqui**.

---

## ⚠️ Leia primeiro (3 coisas importantes)

1. **O que tem aqui NÃO é só "design de referência" — é código funcional.** `game/` contém um jogo de shogi **jogável e completo** (regras inteiras: movimento, captura, *drops*, promoção, xeque-mate). O motor de regras (`game/jchess/engine.js`) é puro JS, sem DOM, e **deve ser reaproveitado** ao portar para outra stack (React/Vue/servidor/IA). As **folhas de referência** em `references/` são documentação visual das peças (não precisa abri-las para rodar o jogo).

2. **Pegadinha de renderização conhecida (importante!).** As peças são SVG via `<symbol>` + `<use>`, com cores aplicadas por **herança de CSS** (`fill`/`stroke`/`color` + `currentColor`). Ferramentas de *screenshot* baseadas em `html-to-image` **renderizam essas peças erradas (saem pretas)** — isso é limitação da ferramenta, **não** do jogo. Em **navegador real** as cores estão corretas (peça clara = creme, escura = grafite/cinza). Para validar cores via script, **rasterize com o engine nativo do navegador** (Image + data-URL de SVG) e leia pixels, ou use `getComputedStyle` no `<svg>` da peça. **Não** confie em screenshots de html-to-image para julgar cor das peças.

3. **Objetivo do dono do projeto:** construir, aos poucos, o **"Chess.com do J-Chess"** — site onde dá pra jogar com amigos (online) e contra a máquina, usando infra gratuita (ex.: Supabase). O estado atual é o **passo 1**: jogo local 2 jogadores (hot-seat), completo e correto. Veja `docs/ROADMAP.md`.

---

## Como rodar (agora)

É um site estático, sem build. Basta servir a pasta `game/`:

```bash
cd game
python3 -m http.server 8000
# abra http://localhost:8000
```

(ou abra `game/index.html` direto no navegador — funciona, mas servir por HTTP evita qualquer restrição de fetch/localStorage).

- **Fontes**: carregadas do Google Fonts (Space Grotesk, Hanken Grotesk, Space Mono, Noto Serif JP). Offline, cai para fontes do sistema sem quebrar.
- **Persistência**: a partida e as preferências ficam em `localStorage` (chaves `jchess.v1.game` e `jchess.v1.settings`). Atualizar a página mantém o jogo.

---

## Estrutura do pacote

```
design_handoff_jchess/
├── README.md                      ← este arquivo (visão geral + como continuar)
├── game/                          ← O JOGO (funcional, rode isto)
│   ├── index.html                 ← shell: layout, CSS, defs SVG dos 2 sets de peças
│   └── jchess/
│       ├── engine.js              ← MOTOR de regras (puro, sem DOM) — reaproveitar!
│       └── app.js                 ← UI/interação (tabuleiro, mãos, histórico, toggles)
├── references/                    ← Artes das peças (documentação visual)
│   ├── pecas-minimalista.html     ← set P&B minimalista + diagramas de movimento
│   └── pecas-classico.html        ← set clássico/ilustrado (madeira) + promoções
└── docs/
    ├── RULES.md                   ← regras do shogi como implementadas + notação
    ├── ENGINE_API.md              ← API do engine (estado, funções, exemplos)
    ├── ART_SYSTEM.md              ← sistema das peças (símbolos, nomes, cores, 2 sets)
    └── ROADMAP.md                 ← onde estamos e próximos passos (online, IA, etc.)
```

---

## O conceito em 30 segundos

Shogi tem 8 tipos de peça; 6 delas **promovem** ao entrar no campo inimigo. Demos a cada uma uma **silhueta ocidental** e renomeamos as exclusivas do shogi para um tema medieval:

| Shogi (kanji) | Nome no J-Chess | Letra (engine) | Anda como |
|---|---|---|---|
| 玉/王 Ōshō | **Rei** | `K` | rei do xadrez (1 casa, 8 direções) |
| 飛 Hisha | **Torre** | `R` | torre (ortogonal, desliza) |
| 角 Kakugyō | **Bispo** | `B` | bispo (diagonal, desliza) |
| 桂 Keima | **Cavaleiro** | `N` | salto só pra frente (2 casas em "L") |
| 香 Kyōsha | **Lanceiro** | `L` | desliza só pra frente |
| 歩 Fuhyō | **Soldado** | `P` | 1 casa pra frente |
| 金 Kinshō | **Marechal** (general de ouro) | `G` | 6 direções (ortogonais + diagonais da frente) |
| 銀 Ginshō | **Vanguarda** (general de prata) | `S` | frente + 4 diagonais |

**Promoções** (sinalizadas pelo desenho, já que a cor marca o dono):
- Soldado, Lanceiro, Cavaleiro, Vanguarda promovidos → ganham **estrela ★** e passam a andar como o **Marechal** (ouro).
- Torre → **Rei Dragão** (asas); anda como torre + 1 passo diagonal do rei.
- Bispo → **Cavalo Dragão** (asas); anda como bispo + 1 passo ortogonal do rei.

Veja `docs/RULES.md` para regras completas e `docs/ART_SYSTEM.md` para a arte.

---

## Estado atual (o que JÁ funciona)

- ✅ Tabuleiro **9×9** com posição inicial correta (validado: **30 lances de abertura** para o 1º jogador — número canônico do shogi).
- ✅ Regras completas: movimento de cada peça (base + promovidas), captura, **drops** (recolocar peça capturada), **promoção** (opcional via modal, ou obrigatória), **xeque** e **xeque-mate**.
- ✅ Regras finas de drop: **nifu** (proíbe 2 peões próprios não-promovidos na mesma coluna) e **uchifuzume** (peão não pode dar xeque-mate ao cair).
- ✅ 2 jogadores no mesmo dispositivo (hot-seat).
- ✅ **Mãos** (peças capturadas) clicáveis para drop.
- ✅ Destaques: seleção, lances possíveis, captura, último lance, rei em xeque.
- ✅ **Histórico de lances** com **mini-arte** (ícone da peça + notação `A1–A2`, `×` captura, `+` promoção, `✦` drop).
- ✅ Rótulos de coordenadas **A–I / 1–9** na borda (A1 = canto inferior-esquerdo, casa escura).
- ✅ 2 sets de peças trocáveis (**Clássico** ilustrado / **Minimal** P&B) + toggle de **casas alternadas/lisas**.
- ✅ Desfazer, novo jogo, persistência em `localStorage`.

## O que NÃO existe ainda

- ❌ Multiplayer online (jogar com amigos pela rede).
- ❌ Oponente por IA.
- ❌ Rotação do tabuleiro por vez (hot-seat hoje é orientação fixa).
- ❌ Relógio/tempo, contas de usuário, perfis, ranking.
- ❌ Detecção de empate por repetição (*sennichite*) e regras avançadas raras.

Tudo isso está destrinchado em `docs/ROADMAP.md`, com sugestões de como o motor atual já habilita cada passo.

---

## Como a IA deve continuar (orientação)

- **Reaproveite o `engine.js`.** Ele é a fonte da verdade das regras e é serializável/portável. Para multiplayer ou IA, rode a MESMA lógica no servidor para validar lances. Não reescreva regras do zero.
- **Mantенha a separação engine (sem DOM) × app (UI).** Se for portar para React/Vue, o engine vira um módulo puro; a UI consome `legalTargetsFrom`, `legalDrops`, `apply`, `gameStatus`.
- **Coordenadas e notação** estão definidas em `docs/RULES.md` (r,c interno × notação A–I/1–9). Use isso para protocolo de rede.
- **Ao renderizar peças**, siga `docs/ART_SYSTEM.md` (herança de cor; nada de variáveis CSS atravessando `<use>` — isso quebra em alguns rasterizadores).
- Se for criar repositório novo, escolha a stack que fizer sentido (sugestão no ROADMAP), mas trate o `engine.js` como núcleo testável e independente.

---

*Gerado a partir da sessão de design/desenvolvimento do J-Chess. Os documentos em `docs/` são auto-suficientes — quem não participou da conversa consegue continuar só com eles.*
