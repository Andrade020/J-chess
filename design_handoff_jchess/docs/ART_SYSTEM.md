# Sistema de Arte das Peças

Cada peça é um **`<symbol>` SVG** definido uma vez em `game/index.html` (bloco `<svg ...><defs>…</defs></svg>`) e instanciado com `<use href="#id">`. Existem **dois sets** completos. As silhuetas foram desenhadas à mão (paths) num viewBox base de `90 × ~100/104`.

## Dois sets

| Set | Prefixo do id | Estilo | Cores (claro / escuro) |
|---|---|---|---|
| **Clássico / ilustrado** | `c-` | Contorno grosso, volume (gradiente), sombra de contato; tom madeira | creme `#f4ede1`-ish (gradiente `#fcf7ee→#e7dcc7`) / cinza (gradiente `#9c9384→#6d6456`) |
| **Minimalista** | `p-` | Silhueta chapada, contorno fino, P&B | `#f4efe6` / `#26231f` |

Ambos cobrem as **14 figuras** (8 base + 6 promovidas).

## IDs dos símbolos (sufixos)

Prefixe com `c-` (clássico) ou `p-` (minimal):

| Peça | sufixo | Peça promovida | sufixo |
|---|---|---|---|
| Rei | `king` | — | — |
| Torre | `rook` | Rei Dragão (+R) | `dragonking` |
| Bispo | `bishop` | Cavalo Dragão (+B) | `dragonhorse` |
| Marechal (ouro) | `marshal` | — | — |
| Vanguarda (prata) | `vanguard` | Vanguarda+ | `vanguard-plus` |
| Cavaleiro | `knight` | Cavaleiro+ | `knight-plus` |
| Lanceiro | `lancer` | Lanceiro+ | `lancer-plus` |
| Soldado | `pawn` | Tokin (soldado+) | `pawn-plus` |

Ex.: `#c-king`, `#p-pawn`, `#c-dragonking`, `#p-vanguard-plus`.

Auxiliares no `<defs>`: `#star` (estrela, usada como selo de promoção e nas pontas), e — só no set clássico — os gradientes `#fillL`, `#fillD` e `#dropsh` (sombra radial).

## Linguagem visual das promoções

- As **4 menores** (Soldado, Lanceiro, Cavaleiro, Vanguarda) ganham uma **estrela ★** (o "selo do Marechal") → indicam que passam a andar como o general de ouro.
- **Torre** e **Bispo** viram **Dragões** → ganham **asas** (e a Torre/Rei Dragão também leva a estrela).
- Generais: **Marechal** = corpo de oficial coroado por **estrela** (insígnia de general). **Vanguarda** = mesmo corpo coroado por **chevron/seta para cima** (ponta-de-lança que avança).

## ⭐ Como as cores são aplicadas (LEIA — evita um bug clássico)

As formas dentro de cada símbolo **não fixam cor**: elas **herdam** `fill`, `stroke` e `color` do `<svg>` que faz o `<use>`. O dono e o set são definidos por **classes** no `<svg>`:

```html
<!-- exemplo: rei claro, set clássico -->
<svg class="pc set-cls own-light" viewBox="5 19 80 80"><use href="#c-king"/></svg>
<!-- soldado escuro, set minimal -->
<svg class="pc set-min own-dark"  viewBox="5 19 80 80"><use href="#p-pawn"/></svg>
```

CSS (em `index.html`):

```css
/* clássico */
.set-cls.own-light{ fill:url(#fillL); stroke:#2c2820; color:#2c2820; }
.set-cls.own-dark { fill:url(#fillD); stroke:#1a1712; color:#f1ead9; }
.set-cls .cbody{ stroke-width:3.4; paint-order:stroke; }      /* contorno por trás do preenchimento */
.set-cls .det { fill:none; stroke-width:1.8; }                /* linhas de detalhe */
.set-cls .mark{ fill:currentColor; }                          /* selo/estrela = cor de contraste */

/* minimal */
.set-min.own-light{ fill:#f4efe6; stroke:#23211c; color:#23211c; }
.set-min.own-dark { fill:#26231f; stroke:#0f0e0b; color:#efe9dc; }
.set-min .body{ stroke-width:1.6; }
.set-min .mark, .set-min .cut{ fill:currentColor; }
```

**Por que herança e não variáveis CSS?** Tentamos usar `var(--cor)` atravessando `<use>` e descobrimos que **vários rasterizadores (html-to-image, e a rasterização SVG via `<img>`) NÃO resolvem custom properties dentro do shadow do `<use>`** → a peça sai **preta**. Propriedades **herdadas padrão** (`fill`/`stroke`/`color` + `currentColor`) funcionam em todo lugar. **Mantenha esse esquema** ao portar.

> Consequência prática: **screenshots de html-to-image mostram as peças pretas** (bug da ferramenta). No navegador real está certo. Para conferir cor por script, rasterize via `<img src="data:image/svg+xml,...">` passando `fill`/`stroke`/`color` como **atributos** num `<g>` em volta do `<use>` (atributo funciona; classe/var não), desenhe num canvas e leia o pixel — ou use `getComputedStyle(svgDaPeça).fill`.

## viewBox de exibição

No app usamos `viewBox="5 19 80 80"` (quadrado, **centrado na peça**) para a peça ocupar bem a casa quadrada **sem distorcer nem descentralizar**. O viewBox "nativo" do símbolo é maior (`0 0 90 ~104`), com margens; o recorte quadrado só enquadra melhor. Se mudar, mantenha **quadrado e centrado em x=45** para não entortar.

## Renderizar em outra stack (React/Vue/etc.)

1. Mantenha **um** bloco de `<defs>` com todos os `<symbol>` no documento (ou inline o SVG de cada peça).
2. Para cada peça renderize `<svg class="pc set-… own-…"><use href="#…"/></svg>` e deixe o CSS de herança colorir.
3. Não fixe cor nas formas; não use `var()` atravessando `<use>`.
4. O **mapa tipo→sufixo** está acima; para promovidas use o sufixo `*-plus`/`dragon*`.

## Referências visuais (documentação, não precisa para rodar)

- `references/pecas-classico.html` — set clássico + **diagramas de movimento** de cada peça + seção de promoções + legenda do sistema.
- `references/pecas-minimalista.html` — set minimal P&B + diagramas de movimento.

Essas folhas são ótimas para entender a intenção de design e os movimentos de forma visual.
