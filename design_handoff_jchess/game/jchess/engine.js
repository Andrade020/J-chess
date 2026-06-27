/* ===================================================================
   J-Chess — motor de regras (shogi ocidentalizado)
   Sem DOM. Estado imutável (clone em cada jogada).
   Tipos: K R B G S N L P  ·  promovido = flag p
   Dono: 'l' (claro, embaixo, avança p/ cima) | 'd' (escuro, em cima)
   =================================================================== */
(function (global) {
  'use strict';

  const TYPES = ['P', 'L', 'N', 'S', 'G', 'B', 'R']; // capturáveis p/ mão (sem K)

  function clone(s) {
    return {
      board: s.board.map(row => row.map(c => (c ? { t: c.t, o: c.o, p: c.p } : null))),
      hands: { l: { ...s.hands.l }, d: { ...s.hands.d } },
      turn: s.turn
    };
  }

  function newGame() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(null));
    const back = ['L', 'N', 'S', 'G', 'K', 'G', 'S', 'N', 'L'];
    for (let c = 0; c < 9; c++) {
      board[0][c] = { t: back[c], o: 'd', p: false };
      board[8][c] = { t: back[c], o: 'l', p: false };
    }
    // 2ª fileira: torre/bispo (simetria 180°)
    board[1][1] = { t: 'R', o: 'd', p: false };
    board[1][7] = { t: 'B', o: 'd', p: false };
    board[7][1] = { t: 'B', o: 'l', p: false };
    board[7][7] = { t: 'R', o: 'l', p: false };
    for (let c = 0; c < 9; c++) {
      board[2][c] = { t: 'P', o: 'd', p: false };
      board[6][c] = { t: 'P', o: 'l', p: false };
    }
    const emptyHand = { P: 0, L: 0, N: 0, S: 0, G: 0, B: 0, R: 0 };
    return { board, hands: { l: { ...emptyHand }, d: { ...emptyHand } }, turn: 'l' };
  }

  function opp(o) { return o === 'l' ? 'd' : 'l'; }

  /* tipo efetivo de movimento (considera promoção) */
  function effType(cell) {
    if (!cell.p) return cell.t;
    if (cell.t === 'R') return 'DR'; // dragão
    if (cell.t === 'B') return 'HO'; // cavalo dragão (horse)
    return 'G'; // P,L,N,S promovidos andam como ouro
  }

  function moveSpec(cell) {
    const f = cell.o === 'l' ? -1 : 1; // delta de linha "para frente"
    switch (effType(cell)) {
      case 'K': return { steps: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]] };
      case 'G': return { steps: [[f,0],[f,-1],[f,1],[0,-1],[0,1],[-f,0]] };
      case 'S': return { steps: [[f,0],[f,-1],[f,1],[-f,-1],[-f,1]] };
      case 'N': return { jumps: [[2*f,-1],[2*f,1]] };
      case 'L': return { slides: [[f,0]] };
      case 'P': return { steps: [[f,0]] };
      case 'B': return { slides: [[-1,-1],[-1,1],[1,-1],[1,1]] };
      case 'R': return { slides: [[-1,0],[1,0],[0,-1],[0,1]] };
      case 'HO': return { slides: [[-1,-1],[-1,1],[1,-1],[1,1]], steps: [[-1,0],[1,0],[0,-1],[0,1]] };
      case 'DR': return { slides: [[-1,0],[1,0],[0,-1],[0,1]], steps: [[-1,-1],[-1,1],[1,-1],[1,1]] };
    }
    return {};
  }

  /* movimentos pseudo-legais (ignora xeque próprio) */
  function genMoves(state, r, c) {
    const cell = state.board[r][c];
    if (!cell) return [];
    const sp = moveSpec(cell), out = [];
    const onb = (rr, cc) => rr >= 0 && rr < 9 && cc >= 0 && cc < 9;
    (sp.steps || []).forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc; if (!onb(rr, cc)) return;
      const t = state.board[rr][cc];
      if (!t || t.o !== cell.o) out.push({ r: rr, c: cc, capture: !!t });
    });
    (sp.jumps || []).forEach(([dr, dc]) => {
      const rr = r + dr, cc = c + dc; if (!onb(rr, cc)) return;
      const t = state.board[rr][cc];
      if (!t || t.o !== cell.o) out.push({ r: rr, c: cc, capture: !!t });
    });
    (sp.slides || []).forEach(([dr, dc]) => {
      let rr = r + dr, cc = c + dc;
      while (onb(rr, cc)) {
        const t = state.board[rr][cc];
        if (!t) { out.push({ r: rr, c: cc, capture: false }); }
        else { if (t.o !== cell.o) out.push({ r: rr, c: cc, capture: true }); break; }
        rr += dr; cc += dc;
      }
    });
    return out;
  }

  function kingPos(state, owner) {
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
      const cl = state.board[i][j];
      if (cl && cl.o === owner && cl.t === 'K') return { r: i, c: j };
    }
    return null;
  }

  function isAttacked(state, r, c, by) {
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
      const cl = state.board[i][j];
      if (cl && cl.o === by) {
        const mv = genMoves(state, i, j);
        for (let k = 0; k < mv.length; k++) if (mv[k].r === r && mv[k].c === c) return true;
      }
    }
    return false;
  }

  function inCheck(state, owner) {
    const k = kingPos(state, owner);
    if (!k) return false;
    return isAttacked(state, k.r, k.c, opp(owner));
  }

  /* aplica jogada -> novo estado (alterna turno) */
  function apply(state, mv) {
    const ns = clone(state), b = ns.board, who = state.turn;
    if (mv.drop) {
      b[mv.to.r][mv.to.c] = { t: mv.drop, o: who, p: false };
      ns.hands[who][mv.drop]--;
    } else {
      const pc = b[mv.from.r][mv.from.c];
      const cap = b[mv.to.r][mv.to.c];
      if (cap && cap.t !== 'K') ns.hands[who][cap.t] = (ns.hands[who][cap.t] || 0) + 1;
      b[mv.to.r][mv.to.c] = { t: pc.t, o: pc.o, p: pc.p || !!mv.promote };
      b[mv.from.r][mv.from.c] = null;
    }
    ns.turn = opp(who);
    return ns;
  }

  /* alvos legais de uma peça (filtra xeque próprio) */
  function legalTargetsFrom(state, r, c) {
    const cell = state.board[r][c];
    if (!cell || cell.o !== state.turn) return [];
    return genMoves(state, r, c).filter(t => {
      const ns = apply(state, { from: { r, c }, to: { r: t.r, c: t.c } });
      return !inCheck(ns, cell.o);
    });
  }

  /* zona de promoção (3 fileiras do fundo inimigo) */
  function inZone(owner, r) { return owner === 'l' ? r <= 2 : r >= 6; }
  function mustPromote(cell, toR) {
    if (cell.p) return false;
    if (cell.t === 'P' || cell.t === 'L') return cell.o === 'l' ? toR === 0 : toR === 8;
    if (cell.t === 'N') return cell.o === 'l' ? toR <= 1 : toR >= 7;
    return false;
  }
  function canPromote(cell, fromR, toR) {
    if (cell.p) return false;
    if (!['P', 'L', 'N', 'S', 'R', 'B'].includes(cell.t)) return false;
    return inZone(cell.o, fromR) || inZone(cell.o, toR);
  }

  /* drops */
  function dropAllowedSquare(state, type, owner, r, c) {
    if (state.board[r][c]) return false;
    if (type === 'P' || type === 'L') { if (owner === 'l' && r === 0) return false; if (owner === 'd' && r === 8) return false; }
    if (type === 'N') { if (owner === 'l' && r <= 1) return false; if (owner === 'd' && r >= 7) return false; }
    if (type === 'P') { // nifu: sem 2 peões próprios não-promovidos na coluna
      for (let i = 0; i < 9; i++) { const cl = state.board[i][c]; if (cl && cl.o === owner && cl.t === 'P' && !cl.p) return false; }
    }
    return true;
  }
  function legalDropsLite(state, type) {
    const owner = state.turn, res = [];
    if ((state.hands[owner][type] || 0) < 1) return res;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      if (!dropAllowedSquare(state, type, owner, r, c)) continue;
      const ns = apply(state, { drop: type, to: { r, c } });
      if (inCheck(ns, owner)) continue;
      res.push({ r, c });
    }
    return res;
  }
  function legalDrops(state, type) {
    const owner = state.turn;
    let res = legalDropsLite(state, type);
    if (type === 'P') { // uchifuzume: peão não pode dar xeque-mate ao cair
      res = res.filter(({ r, c }) => {
        const ns = apply(state, { drop: 'P', to: { r, c } });
        if (inCheck(ns, opp(owner)) && !hasAnyLegal(ns)) return false;
        return true;
      });
    }
    return res;
  }

  function hasAnyLegal(state) {
    for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) {
      const cl = state.board[r][c];
      if (cl && cl.o === state.turn && legalTargetsFrom(state, r, c).length) return true;
    }
    for (const t of TYPES) if ((state.hands[state.turn][t] || 0) > 0 && legalDropsLite(state, t).length) return true;
    return false;
  }

  function gameStatus(state) {
    const chk = inCheck(state, state.turn);
    if (hasAnyLegal(state)) return { over: false, check: chk };
    return { over: true, check: chk, mate: chk, winner: opp(state.turn) };
  }

  global.JS = {
    TYPES, clone, newGame, opp, genMoves, apply,
    legalTargetsFrom, legalDrops, legalDropsLite, hasAnyLegal,
    inCheck, isAttacked, kingPos, gameStatus,
    mustPromote, canPromote, inZone, effType
  };
})(window);
