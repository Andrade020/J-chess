/* ===================================================================
   J-Chess — UI do jogo (hot-seat, 2 jogadores no mesmo dispositivo)
   Depende de engine.js (window.JS)
   =================================================================== */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const boardEl = $('#board'), handDarkEl = $('#handDark'), handLightEl = $('#handLight');
  const statusEl = $('#status'), bannerEl = $('#banner'), promoModal = $('#promoModal');

  const GKEY = 'jchess.v1.game', SKEY = 'jchess.v1.settings';
  const SUF = { K:'king', R:'rook', B:'bishop', G:'marshal', S:'vanguard', N:'knight', L:'lancer', P:'pawn' };
  const PSUF = { P:'pawn-plus', L:'lancer-plus', N:'knight-plus', S:'vanguard-plus', R:'dragonking', B:'dragonhorse' };
  const NAME = { l:'Claro', d:'Escuro' };

  let settings = { set:'cls', alt:true };
  let state, history = [], notation = [], lastMove = null, sel = null, over = false;

  /* ---------- persistence ---------- */
  function loadSettings(){ try{ const s=JSON.parse(localStorage.getItem(SKEY)); if(s){ settings={...settings,...s}; } }catch(e){} }
  function saveSettings(){ try{ localStorage.setItem(SKEY, JSON.stringify(settings)); }catch(e){} }
  function saveGame(){ try{ localStorage.setItem(GKEY, JSON.stringify({ state, history, notation, lastMove })); }catch(e){} }
  function loadGame(){
    try{ const d=JSON.parse(localStorage.getItem(GKEY));
      if(d && d.state && d.state.board && d.state.board.length===9){ state=d.state; history=d.history||[]; notation=d.notation||[]; lastMove=d.lastMove||null; return true; }
    }catch(e){}
    return false;
  }

  /* ---------- svg helpers ---------- */
  function symId(cell){ const base = cell.p ? (PSUF[cell.t]||SUF[cell.t]) : SUF[cell.t]; return (settings.set==='cls'?'c-':'p-')+base; }
  function pieceSVG(cell){
    const vb = '5 19 80 80';
    const setc = settings.set==='cls' ? 'set-cls' : 'set-min';
    const own = cell.o==='l' ? 'own-light' : 'own-dark';
    return `<svg class="pc ${setc} ${own}" viewBox="${vb}"><use href="#${symId(cell)}"></use></svg>`;
  }

  /* ---------- render ---------- */
  function render(){
    over = JS.gameStatus(state).over;
    renderBoard(); renderHand(handDarkEl,'d'); renderHand(handLightEl,'l'); renderStatus(); renderControls(); renderHistory();
    saveGame();
  }

  function coord(r,c){ return 'ABCDEFGHI'[c] + (9 - r); }
  function renderHistory(){
    const el = document.getElementById('history'); if(!el) return;
    if(!notation.length){ el.innerHTML = '<span class="hist-empty">Os lances aparecem aqui — ícone da peça + casas.</span>'; return; }
    el.innerHTML = notation.map((m,i)=>`<span class="mv"><span class="n">${i+1}</span><span class="mi">${pieceSVG(m.cell)}</span>${m.text}</span>`).join('');
    el.scrollTop = el.scrollHeight;
  }
  function buildLabels(){
    const rk=document.getElementById('ranks'), fl=document.getElementById('files');
    if(rk) rk.innerHTML = Array.from({length:9},(_,r)=>`<span>${9-r}</span>`).join('');
    if(fl) fl.innerHTML = 'ABCDEFGHI'.split('').map(l=>`<span>${l}</span>`).join('');
  }

  function targetAt(r,c){ return sel ? sel.targets.find(t=>t.r===r&&t.c===c) : null; }

  function renderBoard(){
    boardEl.classList.toggle('alt', settings.alt);
    const chkKing = (JS.gameStatus(state).check) ? JS.kingPos(state, state.turn) : null;
    let html='';
    for(let r=0;r<9;r++) for(let c=0;c<9;c++){
      const cell = state.board[r][c];
      const cls=['sq', ((r+c)%2 ? 'lt':'dk')];
      if(sel && sel.kind==='board' && sel.r===r && sel.c===c) cls.push('sel');
      const t = targetAt(r,c);
      if(t){ if(sel.kind==='hand') cls.push('drop'); else cls.push(t.capture?'cap':'tgt'); }
      if(lastMove){ const f=lastMove.from, to=lastMove.to;
        if(to && to.r===r && to.c===c) cls.push('last');
        if(f && f.r===r && f.c===c) cls.push('last'); }
      if(chkKing && chkKing.r===r && chkKing.c===c) cls.push('check');
      html += `<div class="${cls.join(' ')}" data-r="${r}" data-c="${c}">${cell?pieceSVG(cell):''}</div>`;
    }
    boardEl.innerHTML = html;
  }

  function renderHand(el, owner){
    el.classList.toggle('active', owner===state.turn && !over);
    const counts = state.hands[owner];
    const chips = JS.TYPES.filter(t=>counts[t]>0).map(t=>{
      const s = (sel&&sel.kind==='hand'&&sel.owner===owner&&sel.type===t)?' sel':'';
      return `<div class="handchip${s}" data-hand="${owner}" data-type="${t}">${pieceSVG({t,o:owner,p:false})}<span class="cnt">${counts[t]}</span></div>`;
    }).join('');
    const label = `<div class="hlabel"><span class="d2 ${owner}"></span>${NAME[owner]}</div>`;
    el.innerHTML = label + `<div class="chips">${chips || '<span class="empty">mão vazia</span>'}</div>`;
  }

  function renderStatus(){
    const st = JS.gameStatus(state);
    let txt = `Vez: <b>${NAME[state.turn]}</b>`;
    if(st.check && !st.over) txt += ' · <span class="chk">Xeque!</span>';
    statusEl.innerHTML = `<span class="turn-dot ${state.turn}"></span><span class="txt">${txt}</span>`;
    if(st.over) showBanner(st.winner, st.mate);
  }

  function renderControls(){
    $('#btnSet').textContent = settings.set==='cls' ? 'Set: Clássico' : 'Set: Minimal';
    $('#btnBoard').textContent = settings.alt ? 'Casas: Alternadas' : 'Casas: Lisas';
    $('#btnUndo').disabled = history.length===0;
    $('#btnUndo').style.opacity = history.length===0 ? .4 : 1;
  }

  /* ---------- interaction ---------- */
  function selectBoard(r,c){
    const targets = JS.legalTargetsFrom(state, r, c);
    sel = { kind:'board', r, c, targets }; render();
  }
  function selectHand(owner,type){
    if(sel && sel.kind==='hand' && sel.type===type){ sel=null; render(); return; }
    const targets = JS.legalDrops(state, type);
    sel = { kind:'hand', owner, type, targets }; render();
  }

  async function onSquare(r,c){
    if(over) return;
    if(sel){
      const t = targetAt(r,c);
      if(t){
        if(sel.kind==='board') await doMove(sel.r, sel.c, r, c);
        else doDrop(sel.type, r, c);
        return;
      }
    }
    const cell = state.board[r][c];
    if(cell && cell.o===state.turn) selectBoard(r,c);
    else { sel=null; render(); }
  }

  async function doMove(fr,fc,tr,tc){
    const cell = state.board[fr][fc];
    let promote=false;
    if(JS.mustPromote(cell, tr)) promote=true;
    else if(JS.canPromote(cell, fr, tr)) promote = await askPromo(cell);
    const cap = !!state.board[tr][tc];
    const glyph = { t:cell.t, o:cell.o, p: cell.p || promote };
    history.push(JS.clone(state));
    state = JS.apply(state, { from:{r:fr,c:fc}, to:{r:tr,c:tc}, promote });
    lastMove = { from:{r:fr,c:fc}, to:{r:tr,c:tc} };
    notation.push({ cell:glyph, text: coord(fr,fc)+(cap?'×':'–')+coord(tr,tc)+(promote?'+':'') });
    sel=null; render();
  }
  function doDrop(type,r,c){
    const owner = state.turn;
    history.push(JS.clone(state));
    state = JS.apply(state, { drop:type, to:{r,c} });
    lastMove = { to:{r,c} };
    notation.push({ cell:{t:type,o:owner,p:false}, text:'✦'+coord(r,c) });
    sel=null; render();
  }

  /* ---------- promotion modal ---------- */
  let promoResolve=null;
  function askPromo(cell){
    return new Promise(res=>{
      promoResolve=res;
      $('#optPromote').innerHTML = pieceSVG({t:cell.t,o:cell.o,p:true}) + '<span>Promover</span>';
      $('#optKeep').innerHTML = pieceSVG({t:cell.t,o:cell.o,p:false}) + '<span>Manter</span>';
      promoModal.hidden=false;
    });
  }
  function resolvePromo(v){ promoModal.hidden=true; if(promoResolve){ const r=promoResolve; promoResolve=null; r(v); } }

  /* ---------- banner ---------- */
  function showBanner(winner, mate){
    $('#bannerTitle').textContent = mate ? 'Xeque-mate' : 'Fim de jogo';
    $('#bannerWho').textContent = NAME[winner] + ' venceu';
    bannerEl.hidden=false;
  }
  function hideBanner(){ bannerEl.hidden=true; }

  /* ---------- controls ---------- */
  function newGame(){ state=JS.newGame(); history=[]; notation=[]; lastMove=null; sel=null; over=false; hideBanner(); render(); }
  function undo(){ if(!history.length) return; state=history.pop(); notation.pop(); lastMove=null; sel=null; over=false; hideBanner(); render(); }

  document.querySelector('.controls').addEventListener('click', e=>{
    const b=e.target.closest('button'); if(!b) return;
    const act=b.dataset.act;
    if(act==='set'){ settings.set = settings.set==='cls'?'min':'cls'; saveSettings(); render(); }
    else if(act==='board'){ settings.alt = !settings.alt; saveSettings(); render(); }
    else if(act==='undo'){ undo(); }
    else if(act==='new'){ if(confirm('Começar um novo jogo?')) newGame(); }
  });
  boardEl.addEventListener('click', e=>{ const sq=e.target.closest('.sq'); if(!sq) return; onSquare(+sq.dataset.r, +sq.dataset.c); });
  function handClick(e){ const ch=e.target.closest('.handchip'); if(!ch) return; const owner=ch.dataset.hand; if(owner!==state.turn||over) return; selectHand(owner, ch.dataset.type); }
  handDarkEl.addEventListener('click', handClick);
  handLightEl.addEventListener('click', handClick);
  $('#optPromote').addEventListener('click', ()=>resolvePromo(true));
  $('#optKeep').addEventListener('click', ()=>resolvePromo(false));
  $('#bannerBtn').addEventListener('click', ()=>{ if(confirm('Começar um novo jogo?')) newGame(); else hideBanner(); });

  /* ---------- boot ---------- */
  loadSettings();
  if(!loadGame()) state = JS.newGame();
  buildLabels();
  render();
})();
