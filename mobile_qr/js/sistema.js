document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.getElementById("map-viewport");
  const content = document.getElementById("map-content");

  if (!viewport || !content) return;

  // Variáveis de estado do mapa
  let scale = 1;
  let pointX = 0;
  let pointY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  // Limites de Zoom
  const MIN_SCALE = 0.5;
  const MAX_SCALE = 4.0;

  // Função para atualizar a posição e zoom visualmente
  function updateTransform() {
    content.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  // --- CONTROLE DE ARRASTAR (PAN) ---
  viewport.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    // Calcula o deslocamento inicial do clique em relação à posição atual do mapa
    startX = e.clientX - pointX;
    startY = e.clientY - pointY;
    viewport.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      viewport.style.cursor = "grab";
    }
  });

  viewport.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    // Atualiza a posição baseada no movimento do mouse
    pointX = e.clientX - startX;
    pointY = e.clientY - startY;
    updateTransform();
  });

  // --- CONTROLE DE ZOOM COM SCROLL (FOCADO NO MOUSE) ---
  viewport.addEventListener("wheel", (e) => {
    e.preventDefault(); // Evita que a página inteira role

    // Pega as coordenadas do mouse relativas ao contêiner viewport
    const rect = viewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Guarda a posição do mouse em relação ao conteúdo interno antes do zoom
    const targetX = (mouseX - pointX) / scale;
    const targetY = (mouseY - pointY) / scale;

    // Define a direção do zoom (Scroll para cima = Zoom In, Scroll para baixo = Zoom Out)
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      scale *= zoomFactor;
    } else {
      scale /= zoomFactor;
    }

    // Aplica os limites mínimos e máximos de zoom
    scale = Math.min(Math.max(MIN_SCALE, scale), MAX_SCALE);

    // Ajusta a posição (X, Y) para que o ponto abaixo do mouse permaneça no mesmo lugar
    pointX = mouseX - targetX * scale;
    pointY = mouseY - targetY * scale;

    updateTransform();
  }, { passive: false });
});

/* ══════════════════════════════════════════════
   BANCO DE DADOS MOCK — separado por empresa
   Cada token tem máquinas, ordens e estoque
   próprios. Em produção isso viria do Firebase
   filtrado por empresaId.
   ══════════════════════════════════════════════ */

const EMPRESA_DATA = {

  /* ── ARL-DIAD-7F3K9 · Plastik Diadema Ltda. ─────────────────
     Segmento: Plástico e Borracha
     Planta:   Injeção (4) · Acabamento (2) · Montagem (2) · Expedição (1)
     OEE atual: 74% · Turno A
  ───────────────────────────────────────────────────────────── */
  'ARL-DIAD-7F3K9': {
    kpi: { oee:74, ordens:8, producao:'14k', maqAtivas:'6/9', oeeDir:'up', oeeD:'+3,2%', prodDir:'up', prodD:'+8%', maqDir:'down' },
    barChart: [82,75,91,68,84,77,74],
    maquinas: [
      {id:'INJ-01',nome:'Injetora 01',setor:'injecao',  status:'operando',ordem:'OP-2847',produto:'Corpo Válvula A3',prog:78,tipo:'Injetora 320T',op:'José S.'},
      {id:'INJ-02',nome:'Injetora 02',setor:'injecao',  status:'operando',ordem:'OP-2849',produto:'Tampa CR-12',     prog:45,tipo:'Injetora 250T',op:'Maria L.'},
      {id:'INJ-03',nome:'Injetora 03',setor:'injecao',  status:'parada',  ordem:'—',      produto:'—',               prog:0, tipo:'Injetora 180T',op:'—'},
      {id:'INJ-04',nome:'Injetora 04',setor:'injecao',  status:'setup',   ordem:'OP-2851',produto:'Conector X7',     prog:0, tipo:'Injetora 400T',op:'Paulo R.'},
      {id:'ACB-01',nome:'Acabamento 01',setor:'acabamento',status:'operando',ordem:'OP-2843',produto:'Corpo Válvula A3',prog:92,tipo:'Rebarbação',op:'Ana K.'},
      {id:'ACB-02',nome:'Acabamento 02',setor:'acabamento',status:'operando',ordem:'OP-2844',produto:'Tampa CR-12',prog:60,tipo:'Tampografia',op:'Carlos M.'},
      {id:'MON-01',nome:'Montagem 01',setor:'montagem', status:'operando',ordem:'OP-2840',produto:'Kit Válvula',    prog:88,tipo:'Bancada manual',op:'Fernanda T.'},
      {id:'MON-02',nome:'Montagem 02',setor:'montagem', status:'setup',   ordem:'OP-2852',produto:'Kit Conector',  prog:0, tipo:'Bancada semi-auto',op:'Ricardo B.'},
      {id:'EXP-01',nome:'Expedição',  setor:'expedicao',status:'operando',ordem:'OP-2838',produto:'Mix paletes',   prog:100,tipo:'Doca de saída',op:'Marcos V.'},
    ],
    ordens: [
      {id:'OP-2847',prod:'Corpo Válvula A3',          status:'andamento',prog:78, maq:'INJ-01',qty:'5.000 un', turno:'A'},
      {id:'OP-2849',prod:'Tampa CR-12',               status:'andamento',prog:45, maq:'INJ-02',qty:'12.000 un',turno:'A'},
      {id:'OP-2851',prod:'Conector X7',               status:'setup',    prog:0,  maq:'INJ-04',qty:'3.500 un', turno:'B'},
      {id:'OP-2843',prod:'Válvula A3 — Acabamento',   status:'andamento',prog:92, maq:'ACB-01',qty:'4.800 un', turno:'A'},
      {id:'OP-2844',prod:'Tampa CR-12 — Tampografia', status:'andamento',prog:60, maq:'ACB-02',qty:'11.500 un',turno:'A'},
      {id:'OP-2840',prod:'Kit Válvula Completo',       status:'andamento',prog:88, maq:'MON-01',qty:'2.200 un', turno:'A'},
      {id:'OP-2852',prod:'Kit Conector X7',            status:'setup',    prog:0,  maq:'MON-02',qty:'1.800 un', turno:'B'},
      {id:'OP-2838',prod:'Mix paletes — Expedição',    status:'concluido',prog:100,maq:'EXP-01',qty:'8.400 un', turno:'A'},
    ],
    estoque: [
      {mat:'Resina PP Natural',    cod:'MP-0041',qtd:4200, min:1000,un:'kg'},
      {mat:'Resina ABS Preto',     cod:'MP-0042',qtd:780,  min:800, un:'kg'},
      {mat:'Pigmento Azul',        cod:'MP-0089',qtd:45,   min:50,  un:'kg'},
      {mat:'Insert Metálico M6',   cod:'MP-0120',qtd:12500,min:2000,un:'un'},
      {mat:'Embalagem Caixa P',    cod:'MP-0200',qtd:3200, min:500, un:'un'},
      {mat:'Etiqueta Rastreio',    cod:'MP-0201',qtd:890,  min:1000,un:'un'},
      {mat:'Aditivo Desmoldante',  cod:'MP-0055',qtd:22,   min:30,  un:'L'},
    ],
  },

  /* ── ARL-SBC-2M8QR · MetalParts S. Bernardo ─────────────────
     Segmento: Metal-mecânica
     Planta:   Usinagem (3) · Solda (2) · Pintura (2) · Expedição (1)
     OEE atual: 81% · Turno B
  ───────────────────────────────────────────────────────────── */
  'ARL-SBC-2M8QR': {
    kpi: { oee:81, ordens:6, producao:'8,3k', maqAtivas:'7/8', oeeDir:'up', oeeD:'+1,8%', prodDir:'up', prodD:'+12%', maqDir:'up' },
    barChart: [70,78,82,80,85,79,81],
    maquinas: [
      {id:'USI-01',nome:'Centro Usinage 01',setor:'injecao',  status:'operando',ordem:'MP-1102',produto:'Flange DN80',      prog:65,tipo:'CNC Mazak 5x',    op:'Rodrigo A.'},
      {id:'USI-02',nome:'Centro Usinage 02',setor:'injecao',  status:'operando',ordem:'MP-1104',produto:'Eixo Transmissão', prog:42,tipo:'CNC Romi D600',   op:'Claudia B.'},
      {id:'USI-03',nome:'Torno CNC',        setor:'injecao',  status:'setup',   ordem:'MP-1108',produto:'Pino Guia 12mm',  prog:0, tipo:'Torno Romi i30',   op:'Leandro F.'},
      {id:'SOL-01',nome:'Célula Solda 01',  setor:'acabamento',status:'operando',ordem:'MP-1103',produto:'Estrutura Base', prog:88,tipo:'Solda MIG robótica',op:'Tatiane M.'},
      {id:'SOL-02',nome:'Célula Solda 02',  setor:'acabamento',status:'operando',ordem:'MP-1105',produto:'Suporte L-40',   prog:55,tipo:'Solda TIG manual',  op:'Fábio N.'},
      {id:'PIN-01',nome:'Cabine Pintura 01',setor:'montagem', status:'operando',ordem:'MP-1103',produto:'Estrutura Base',  prog:72,tipo:'Pintura epóxi auto', op:'Sandra K.'},
      {id:'PIN-02',nome:'Cabine Pintura 02',setor:'montagem', status:'parada',  ordem:'—',      produto:'—',               prog:0, tipo:'Pintura líquida',   op:'—'},
      {id:'EXP-01',nome:'Expedição',        setor:'expedicao',status:'operando',ordem:'MP-1100',produto:'Lote fora',       prog:100,tipo:'Doca B',           op:'Gilson P.'},
    ],
    ordens: [
      {id:'MP-1102',prod:'Flange DN80',       status:'andamento',prog:65, maq:'USI-01',qty:'320 un', turno:'B'},
      {id:'MP-1103',prod:'Estrutura Base',    status:'andamento',prog:88, maq:'SOL-01',qty:'80 un',  turno:'B'},
      {id:'MP-1104',prod:'Eixo Transmissão',  status:'andamento',prog:42, maq:'USI-02',qty:'150 un', turno:'B'},
      {id:'MP-1105',prod:'Suporte L-40',      status:'andamento',prog:55, maq:'SOL-02',qty:'240 un', turno:'B'},
      {id:'MP-1108',prod:'Pino Guia 12mm',    status:'setup',    prog:0,  maq:'USI-03',qty:'500 un', turno:'B'},
      {id:'MP-1100',prod:'Lote fora — Exp.',  status:'concluido',prog:100,maq:'EXP-01',qty:'1.200 un',turno:'A'},
    ],
    estoque: [
      {mat:'Barra Aço 1020 Ø50',  cod:'MP-3010',qtd:680,  min:200, un:'m'},
      {mat:'Barra Aço Inox 316',   cod:'MP-3011',qtd:95,   min:100, un:'m'},
      {mat:'Chapa SAE 1020 3mm',   cod:'MP-3020',qtd:2400, min:500, un:'kg'},
      {mat:'Arame Solda MIG',      cod:'MP-3050',qtd:42,   min:20,  un:'kg'},
      {mat:'Gás Argônio',          cod:'MP-3051',qtd:3,    min:5,   un:'cil'},
      {mat:'Tinta Epóxi Industrial',cod:'MP-3060',qtd:180, min:50,  un:'L'},
      {mat:'Parafuso M10x30',      cod:'MP-3090',qtd:8200, min:1000,un:'un'},
    ],
  },

  /* ── ARL-MAUA-5P1XZ · AlimFlex Mauá ─────────────────────────
     Segmento: Alimentos e Bebidas
     Planta:   Mistura (2) · Envase (3) · Rotulagem (2) · Expedição (1)
     OEE atual: 68% · Turno A — alerta de eficiência
  ───────────────────────────────────────────────────────────── */
  'ARL-MAUA-5P1XZ': {
    kpi: { oee:68, ordens:7, producao:'22k', maqAtivas:'5/8', oeeDir:'down', oeeD:'-2,1%', prodDir:'down', prodD:'-5%', maqDir:'down' },
    barChart: [74,71,80,65,70,62,68],
    maquinas: [
      {id:'MIS-01',nome:'Misturador A',  setor:'injecao',   status:'operando',ordem:'AF-0391',produto:'Mix Granola Premium',prog:55,tipo:'Misturador 800L',   op:'Beatriz C.'},
      {id:'MIS-02',nome:'Misturador B',  setor:'injecao',   status:'parada',  ordem:'—',      produto:'—',                  prog:0, tipo:'Misturador 400L',   op:'—'},
      {id:'ENV-01',nome:'Envasadora 01', setor:'acabamento',status:'operando',ordem:'AF-0392',produto:'Iogurte Natural 1kg', prog:80,tipo:'Envasadora assép.', op:'Thiago M.'},
      {id:'ENV-02',nome:'Envasadora 02', setor:'acabamento',status:'operando',ordem:'AF-0393',produto:'Suco Uva 1L',         prog:33,tipo:'Envasadora PET',    op:'Camila R.'},
      {id:'ENV-03',nome:'Envasadora 03', setor:'acabamento',status:'setup',   ordem:'AF-0395',produto:'Molho Tomate 500g',  prog:0, tipo:'Envasadora vidro',  op:'Denis O.'},
      {id:'ROT-01',nome:'Rotulagem 01',  setor:'montagem',  status:'operando',ordem:'AF-0392',produto:'Iogurte Natural 1kg', prog:76,tipo:'Rotuladora auto',   op:'Priscila V.'},
      {id:'ROT-02',nome:'Rotulagem 02',  setor:'montagem',  status:'parada',  ordem:'—',      produto:'—',                  prog:0, tipo:'Rotuladora semi',    op:'—'},
      {id:'EXP-01',nome:'Expedição / Frio',setor:'expedicao',status:'operando',ordem:'AF-0388',produto:'Lote câmara fria',  prog:100,tipo:'Câmara + doca',     op:'Wagner L.'},
    ],
    ordens: [
      {id:'AF-0391',prod:'Mix Granola Premium',   status:'andamento',prog:55, maq:'MIS-01',qty:'4.800 kg', turno:'A'},
      {id:'AF-0392',prod:'Iogurte Natural 1kg',   status:'andamento',prog:80, maq:'ENV-01',qty:'18.000 un',turno:'A'},
      {id:'AF-0393',prod:'Suco Uva 1L',           status:'andamento',prog:33, maq:'ENV-02',qty:'9.600 un', turno:'A'},
      {id:'AF-0395',prod:'Molho Tomate 500g',      status:'setup',    prog:0,  maq:'ENV-03',qty:'12.000 un',turno:'B'},
      {id:'AF-0396',prod:'Molho Tomate — Rotul.', status:'setup',    prog:0,  maq:'ROT-02',qty:'12.000 un',turno:'B'},
      {id:'AF-0392',prod:'Iogurte — Rotulagem',   status:'andamento',prog:76, maq:'ROT-01',qty:'17.500 un',turno:'A'},
      {id:'AF-0388',prod:'Lote câmara fria',       status:'concluido',prog:100,maq:'EXP-01',qty:'22.400 un',turno:'A'},
    ],
    estoque: [
      {mat:'Aveia em Flocos',     cod:'AL-1001',qtd:3200, min:800, un:'kg'},
      {mat:'Mel Natural',          cod:'AL-1002',qtd:180,  min:200, un:'kg'},
      {mat:'Leite UHT',            cod:'AL-1010',qtd:12000,min:3000,un:'L'},
      {mat:'Suco Uva Concentrado', cod:'AL-1020',qtd:420,  min:500, un:'L'},
      {mat:'Embalagem PET 1L',     cod:'AL-2001',qtd:8500, min:2000,un:'un'},
      {mat:'Tampa Rosca 28mm',     cod:'AL-2002',qtd:7800, min:2000,un:'un'},
      {mat:'Rótulo Iogurte 1kg',   cod:'AL-2010',qtd:15000,min:5000,un:'un'},
    ],
  },
};

/* dados ativos — preenchidos em mostrarApp() conforme o token */
let MAQUINAS = [];
let ORDENS   = [];
let ESTOQUE  = [];
let APONTAMENTOS = [];
let EXPEDICOES = [];

const SETOR_CORES = {injecao:'#3B8FEA',acabamento:'#1FAE72',montagem:'#C99A1A',expedicao:'#7B52C4'};
const STATUS_COR  = {operando:'#1FAE72',setup:'#C99A1A',parada:'#C03030',livre:'#5A8070'};

const SETOR_AREAS = [
  {id:'injecao',   label:'INJEÇÃO',    rx:0.03,ry:0.06,rw:0.44,rh:0.58},
  {id:'acabamento',label:'ACABAMENTO', rx:0.51,ry:0.06,rw:0.44,rh:0.36},
  {id:'montagem',  label:'MONTAGEM',   rx:0.51,ry:0.46,rw:0.26,rh:0.48},
  {id:'expedicao', label:'EXPEDIÇÃO',  rx:0.81,ry:0.46,rw:0.14,rh:0.48},
];

const MAQUINA_POS = {
  'INJ-01':{rx:0.08,ry:0.18},'INJ-02':{rx:0.26,ry:0.18},
  'INJ-03':{rx:0.08,ry:0.52},'INJ-04':{rx:0.26,ry:0.52},
  'ACB-01':{rx:0.60,ry:0.18},'ACB-02':{rx:0.76,ry:0.18},
  'MON-01':{rx:0.60,ry:0.58},'MON-02':{rx:0.60,ry:0.80},
  'EXP-01':{rx:0.88,ry:0.62},
};

function getSetorArea(setor){
  return SETOR_AREAS.find(a=>a.id===setor) || SETOR_AREAS[0];
}

function getMaquinasDoSetor(setor){
  return MAQUINAS.filter(m=>(m.setor || 'injecao') === setor);
}

function autoMaquinaPos(m){
  if(Number.isFinite(Number(m.rx)) && Number.isFinite(Number(m.ry))) return {rx:Number(m.rx), ry:Number(m.ry)};
  if(m.posicao && Number.isFinite(Number(m.posicao.rx)) && Number.isFinite(Number(m.posicao.ry))) {
    return {rx:Number(m.posicao.rx), ry:Number(m.posicao.ry)};
  }
  if(MAQUINA_POS[m.id]) return MAQUINA_POS[m.id];

  const setor = m.setor || 'injecao';
  const area = getSetorArea(setor);
  const maquinasSetor = getMaquinasDoSetor(setor);
  const idx = Math.max(0, maquinasSetor.findIndex(item=>item.id===m.id));
  const total = Math.max(1, maquinasSetor.length);
  const cols = Math.max(1, Math.ceil(Math.sqrt(total * (area.rw / Math.max(area.rh, 0.1)))));
  const rows = Math.max(1, Math.ceil(total / cols));
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const padX = Math.min(0.06, area.rw * 0.18);
  const padY = Math.min(0.08, area.rh * 0.20);
  const rx = area.rx + padX + ((col + 0.5) * Math.max(0.02, area.rw - padX*2) / cols);
  const ry = area.ry + padY + ((row + 0.5) * Math.max(0.02, area.rh - padY*2) / rows);
  return {rx, ry};
}

function getMaquinaPos(m){
  return autoMaquinaPos(m);
}

/* ── STATE ── */
let currentUser  = null;
let currentUserName = '-';
let empresaData  = null;
let empresaToken = null;
let firebaseSalvarOP = null;
let firebaseSalvarApontamento = null;
let firebaseEncerrarOP = null;
let firebaseSalvarSolicitacaoCompra = null;
let userCargo = null;
let userPodeGerir = false;
let userPodeApontar = false;
let mapScale     = 1;
let mapOffsetX   = 0;
let mapOffsetY   = 0;
let mapDragging  = false;
let mapDragStartX = 0;
let mapDragStartY = 0;
let mapDragOffsetX = 0;
let mapDragOffsetY = 0;
let filtroSetor  = 'all';
let ordensFiltro = 'todos';
let estoqueFiltro = 'todos';
let materialDetalheAtual = null;
let ctx, mapW, mapH;

/* ── THEME ── */
const html = document.documentElement;
const themeBtn  = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(t){
  html.setAttribute('data-theme', t);
  localStorage.setItem('ari-theme', t);
  themeIcon.className = t === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
  if(ctx) drawMapa();
}

const savedTheme = localStorage.getItem('ari-theme') || 'dark';
applyTheme(savedTheme);

themeBtn.addEventListener('click', ()=>{
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ── CLOCK ── */
function tick(){
  const now = new Date();
  document.getElementById('reloj').textContent =
    now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
setInterval(tick,1000); tick();

/* ── NAV ── */
function showView(v, el){
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.view').forEach(d=>d.classList.remove('active'));
  const target = document.getElementById('view-'+v);
  if(target) target.classList.add('active');
  if(v==='mapa') setTimeout(()=>{ initCanvas(); drawMapa(); },30);
  if(v==='expedicao') renderMobileExpedicao();
}

/* ── SETOR FILTER ── */
function filterSetor(s, el){
  filtroSetor = s;
  document.querySelectorAll('.setor-chip').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  if(ctx) drawMapa();
}

/* ── CANVAS MAP ── */
function initCanvas(){
  const canvas = document.getElementById('plantaCanvas');
  const wrap   = canvas.parentElement;
  mapW = wrap.clientWidth;
  mapH = wrap.clientHeight;
  canvas.width  = mapW * devicePixelRatio;
  canvas.height = mapH * devicePixelRatio;
  canvas.style.width  = mapW+'px';
  canvas.style.height = mapH+'px';
  ctx = canvas.getContext('2d');
  ctx.scale(devicePixelRatio, devicePixelRatio);

  canvas.oncontextmenu = e=>e.preventDefault();
  canvas.onmousedown = onMapMouseDown;
  canvas.onmousemove = onMapMouseMove;
  canvas.onmouseup = onMapMouseUp;
  canvas.onwheel = onMapWheel;
  canvas.onclick = onMapClick;
  canvas.onmouseleave = ()=>{ document.getElementById('tooltip').style.display='none'; };
  window.onmouseup = onMapMouseUp;
}

function getCSSVar(v){ return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

function drawMapa(){
  if(!ctx) return;
  ctx.clearRect(0,0,mapW,mapH);
  ctx.save();
  ctx.translate(mapOffsetX,mapOffsetY);
  ctx.translate(mapW/2,mapH/2);
  ctx.scale(mapScale,mapScale);
  ctx.translate(-mapW/2,-mapH/2);

  const textPrimary = getCSSVar('--text');
  const textMuted   = getCSSVar('--text3');

  /* setor areas */
  SETOR_AREAS.forEach(a=>{
    const dim = filtroSetor!=='all' && a.id!==filtroSetor;
    const cor = SETOR_CORES[a.id];
    const x=a.rx*mapW, y=a.ry*mapH, w=a.rw*mapW, h=a.rh*mapH;

    ctx.globalAlpha = dim ? 0.15 : 1;
    ctx.fillStyle = cor+'12';
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle = cor+'30';
    ctx.lineWidth = 1;
    ctx.strokeRect(x,y,w,h);

    if(a.label){
      ctx.font = '700 9px "Barlow",system-ui';
      ctx.fillStyle = cor+'60';
      ctx.globalAlpha = dim ? 0.1 : 0.7;
      ctx.fillText(a.label, x+8, y+14);
    }
    ctx.globalAlpha = 1;
  });

  /* machines */
  MAQUINAS.forEach(m=>{
    const pos = getMaquinaPos(m);
    const dim = filtroSetor!=='all' && m.setor!==filtroSetor;
    ctx.globalAlpha = dim ? 0.12 : 1;

    const x=pos.rx*mapW, y=pos.ry*mapH;
    const bw=94, bh=54;
    const cor = STATUS_COR[m.status] || '#444';
    const cardBg = getCSSVar('--card-bg');

    /* card shadow */
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x-bw/2+2, y-bh/2+2, bw, bh);

    /* card bg */
    ctx.fillStyle = cardBg;
    ctx.fillRect(x-bw/2, y-bh/2, bw, bh);

    /* accent left border */
    ctx.fillStyle = cor;
    ctx.fillRect(x-bw/2, y-bh/2, 3, bh);

    /* card border */
    ctx.strokeStyle = cor+'50';
    ctx.lineWidth = 1;
    ctx.strokeRect(x-bw/2, y-bh/2, bw, bh);

    /* status dot top right */
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(x+bw/2-8, y-bh/2+8, 3.5, 0, Math.PI*2);
    ctx.fill();

    /* machine id */
    ctx.font = '800 10px "Barlow Condensed","Barlow",system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = textPrimary;
    ctx.fillText(m.id, x, y-13);

    /* product truncated */
    ctx.font = '400 9px "Barlow",system-ui';
    ctx.fillStyle = textMuted;
    const pt = m.produto.length>16 ? m.produto.slice(0,15)+'…' : m.produto;
    ctx.fillText(pt, x, y+1);

    /* progress bar */
    if(m.status==='operando' && m.prog>0){
      const bx=x-36, by=y+12, blen=72;
      ctx.fillStyle = cor+'20';
      ctx.fillRect(bx, by, blen, 2.5);
      ctx.fillStyle = cor;
      ctx.fillRect(bx, by, blen*(m.prog/100), 2.5);
      ctx.font='700 8px "Barlow",system-ui';
      ctx.fillStyle=cor;
      ctx.fillText(m.prog+'%', x, y+26);
    } else if(m.status!=='operando'){
      ctx.font='700 8px "Barlow",system-ui';
      ctx.fillStyle=cor;
      ctx.fillText(({parada:'PARADA',setup:'SETUP',livre:'LIVRE'}[m.status] || String(m.status).toUpperCase()), x, y+22);
    }

    ctx.globalAlpha=1;
    ctx.textAlign='left';
  });

  ctx.restore();
}

function screenToMap(mx,my){
  return {
    x: ((mx - mapOffsetX - mapW/2) / mapScale) + mapW/2,
    y: ((my - mapOffsetY - mapH/2) / mapScale) + mapH/2,
  };
}

function getMaquinaAt(mx,my){
  const p = screenToMap(mx,my);
  for(const m of MAQUINAS){
    const pos=getMaquinaPos(m);
    const x=pos.rx*mapW, y=pos.ry*mapH;
    if(p.x>=x-47&&p.x<=x+47&&p.y>=y-27&&p.y<=y+27) return m;
  }
  return null;
}

function zoomMapAt(mx,my,f){
  const before = screenToMap(mx,my);
  const nextScale = Math.min(3, Math.max(0.4, mapScale*f));
  mapScale = nextScale;
  mapOffsetX = mx - (mapW/2 + (before.x - mapW/2) * mapScale);
  mapOffsetY = my - (mapH/2 + (before.y - mapH/2) * mapScale);
  drawMapa();
}

function onMapMouseDown(e){
  if(e.button !== 2) return;
  e.preventDefault();
  mapDragging = true;
  mapDragStartX = e.clientX;
  mapDragStartY = e.clientY;
  mapDragOffsetX = mapOffsetX;
  mapDragOffsetY = mapOffsetY;
  e.currentTarget.style.cursor = 'grabbing';
  document.getElementById('tooltip').style.display='none';
}

function onMapMouseUp(){
  mapDragging = false;
  const canvas = document.getElementById('plantaCanvas');
  if(canvas) canvas.style.cursor = 'default';
}

function onMapWheel(e){
  e.preventDefault();
  const r=e.currentTarget.getBoundingClientRect();
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  zoomMapAt(mx,my,e.deltaY<0 ? 1.12 : 0.88);
}

function onMapMouseMove(e){
  const r=e.target.getBoundingClientRect();
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  if(mapDragging){
    mapOffsetX = mapDragOffsetX + (e.clientX - mapDragStartX);
    mapOffsetY = mapDragOffsetY + (e.clientY - mapDragStartY);
    drawMapa();
    e.target.style.cursor='grabbing';
    return;
  }
  const m=getMaquinaAt(mx,my);
  const tip=document.getElementById('tooltip');
  if(m){
    e.target.style.cursor='pointer';
    const cor=STATUS_COR[m.status]||'#888';
    const slbl={operando:'Operando',setup:'Em setup',parada:'Parada'}[m.status]||m.status;
    const pbar = m.prog>0
      ? `<div class="tip-progress">
          <div class="tip-row"><span class="tip-k">Progresso</span><span class="tip-v" style="color:${cor}">${m.prog}%</span></div>
          <div class="tip-prog-bar"><div class="tip-prog-fill" style="width:${m.prog}%;background:${cor}"></div></div>
         </div>` : '';
    tip.innerHTML=`
      <div class="tip-hd">
        <div class="tip-dot" style="background:${cor}"></div>
        <div class="tip-name">${m.nome}</div>
      </div>
      <div class="tip-row"><span class="tip-k">Tipo</span><span class="tip-v">${m.tipo}</span></div>
      <div class="tip-row"><span class="tip-k">Status</span><span class="tip-v" style="color:${cor}">${slbl}</span></div>
      <div class="tip-sep"></div>
      <div class="tip-row"><span class="tip-k">Ordem</span><span class="tip-v">${m.ordem}</span></div>
      <div class="tip-row"><span class="tip-k">Produto</span><span class="tip-v">${m.produto}</span></div>
      ${m.status==='parada' && m.motivoParada ? `<div class="tip-row"><span class="tip-k">Motivo</span><span class="tip-v">${m.motivoParada}</span></div>` : ''}
      ${pbar}
      <div class="tip-sep"></div>
      <div class="tip-row"><span class="tip-k">Operador</span><span class="tip-v">${m.op}</span></div>
    `;
    let tx=mx+14, ty=my-10;
    if(tx+220>mapW) tx=mx-234;
    if(ty+230>mapH) ty=mapH-235;
    tip.style.left=tx+'px'; tip.style.top=Math.max(4,ty)+'px';
    tip.style.display='block';
  } else {
    e.target.style.cursor='default';
    tip.style.display='none';
  }
}


function onMapClick(e){
  const r=e.target.getBoundingClientRect();
  const mx=e.clientX-r.left, my=e.clientY-r.top;
  const m=getMaquinaAt(mx,my);
  if(m) abrirMaquinaModal(m.id);
}

function zoomMap(f){ zoomMapAt(mapW/2,mapH/2,f); }
function resetZoom(){ mapScale=1; mapOffsetX=0; mapOffsetY=0; drawMapa(); }
window.addEventListener('resize',()=>{ if(ctx){ initCanvas(); drawMapa(); } });

/* ── ORDENS ── */
function ordemStatusFiltro(o){
  return o.status === 'operando' ? 'andamento' : (o.status || 'andamento');
}
function ordensFiltradas(){
  if(ordensFiltro === 'todos') return ORDENS;
  return ORDENS.filter(o=>ordemStatusFiltro(o) === ordensFiltro);
}
function renderOrdens(){
  const sub=document.getElementById('ordens-sub');
  if(empresaData) sub.textContent=`${empresaData.nome} - ${ORDENS.length} ordens ativas`;
  const grid=document.getElementById('ordensGrid');
  if(!grid) return;
  const lista=ordensFiltradas();
  const statusMap={
    andamento:{cls:'s-green',lbl:'Em andamento'},
    setup:    {cls:'s-yellow',lbl:'Setup'},
    concluido:{cls:'s-green',lbl:'Concluido'},
    parada:   {cls:'s-red',lbl:'Parada'},
    operando: {cls:'s-green',lbl:'Em andamento'},
  };
  if(!lista.length){
    grid.innerHTML='<div class="ordens-empty">Nenhuma ordem encontrada neste filtro.</div>';
    return;
  }
  grid.innerHTML=lista.map(o=>{
    const s=statusMap[o.status]||{cls:'',lbl:o.status};
    return `<div class="ordem-card">
      <div class="ordem-top">
        <div class="ordem-id">${o.id}</div>
        <span class="status-pill ${s.cls}">${s.lbl}</span>
      </div>
      <div class="ordem-prod">${o.prod}</div>
      <div class="ordem-meta">Turno ${o.turno}</div>
      <div class="prog-label"><span>Progresso</span><span>${o.prog}%</span></div>
      <div class="prog-track"><div class="prog-fill" style="width:${o.prog}%"></div></div>
      <div class="ordem-footer">
        <span class="ordem-maquina">${o.maq}</span>
        <span class="ordem-qty">${o.qty}</span>
      </div>
      <div class="ordem-actions">
        <button class="btn-sm" onclick="abrirTimeline('${o.id}')"><i class="ph ph-clock-counter-clockwise"></i> Timeline</button>
        ${userPodeApontar ? `<button class="btn-sm operator" onclick="abrirApontModal('${o.maq}')"><i class="ph ph-warning"></i> Apontar</button>` : ''}
        ${userPodeGerir ? `<button class="btn-sm primary" onclick="encerrarOP('${o.id}','${o.maq}')"><i class="ph ph-check"></i> Encerrar</button>` : ''}
      </div>
    </div>`;
  }).join('');
}

function aplicarFiltroOrdens(filtro, btn){
  ordensFiltro=filtro || 'todos';
  document.querySelectorAll('[data-ordens-filter]').forEach(el=>{
    const ativo = el === btn || el.dataset.ordensFilter === ordensFiltro;
    el.classList.toggle('active', ativo);
    el.setAttribute('aria-checked', ativo ? 'true' : 'false');
  });
  renderOrdens();
}

const ordensFilterBtn=document.getElementById('ordensFilterBtn');
const ordensFilterMenu=document.getElementById('ordensFilterMenu');
function fecharMenuFiltroOrdens(){
  ordensFilterMenu?.classList.remove('open');
  ordensFilterBtn?.setAttribute('aria-expanded','false');
}
ordensFilterBtn?.addEventListener('click', e=>{
  e.stopPropagation();
  const aberto=ordensFilterMenu?.classList.toggle('open');
  ordensFilterBtn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
});
ordensFilterMenu?.addEventListener('click', e=>{
  const btn=e.target.closest('[data-ordens-filter]');
  if(!btn) return;
  aplicarFiltroOrdens(btn.dataset.ordensFilter, btn);
  fecharMenuFiltroOrdens();
});
document.addEventListener('click', e=>{
  if(!e.target.closest('.ordens-filter-wrap')) fecharMenuFiltroOrdens();
});

/* ── ESTOQUE ── */
function escapeHtml(value){
  return String(value ?? '').replace(/[&<>'"]/g, ch=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[ch]));
}
function estoqueNivel(e){
  const qtd=Number(e.qtd || 0);
  const min=Number(e.min || 0);
  if(qtd <= 0) return 'critico';
  if(min > 0 && qtd < min * 0.5) return 'critico';
  if(min > 0 && qtd < min) return 'baixo';
  if(min > 0 && qtd < min * 1.3) return 'atencao';
  return 'ok';
}
function estoqueStatusInfo(e){
  const nivel=estoqueNivel(e);
  const mapa={
    ok:{texto:'OK', classe:'s-green', cor:'var(--green)'},
    atencao:{texto:'Atencao', classe:'s-yellow', cor:'var(--yellow)'},
    baixo:{texto:'Abaixo do minimo', classe:'s-red', cor:'var(--red)'},
    critico:{texto:'Critico', classe:'s-red', cor:'var(--red)'},
  };
  return mapa[nivel] || mapa.ok;
}
function estoqueReposicaoSugerida(e){
  const qtd=Number(e.qtd || 0);
  const min=Number(e.min || 0);
  return Math.max(Math.ceil((min * 2) - qtd), min || 1, 1);
}
function estoqueFiltrado(){
  if(estoqueFiltro === 'todos') return ESTOQUE;
  return ESTOQUE.filter(e=>estoqueNivel(e) === estoqueFiltro);
}
function renderEstoque(){
  const body=document.getElementById('estoqueBody');
  if(!body) return;
  const lista=estoqueFiltrado();
  if(!lista.length){
    body.innerHTML='<tr><td class="estoque-empty" colspan="6">Nenhum material encontrado neste filtro.</td></tr>';
    return;
  }
  body.innerHTML=lista.map(e=>{
    const qtd=Number(e.qtd || 0);
    const min=Number(e.min || 0);
    const pct=Math.round((qtd/Math.max(qtd,min*2,1))*100);
    const info=estoqueStatusInfo(e);
    const alerta=estoqueNivel(e)==='baixo' || estoqueNivel(e)==='critico';
    return `<tr data-material-cod="${escapeHtml(e.cod)}" title="Ver detalhes do material">
      <td>${escapeHtml(e.mat)}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:11px">${escapeHtml(e.cod)}</td>
      <td class="${alerta?'estoque-alerta':''}">${qtd.toLocaleString('pt-BR')} ${escapeHtml(e.un)}</td>
      <td style="color:var(--text3)">${min.toLocaleString('pt-BR')} ${escapeHtml(e.un)}</td>
      <td><div class="stock-bar-wrap"><div class="stock-bar"><div class="stock-fill" style="width:${Math.min(pct,100)}%;background:${info.cor}"></div></div></div></td>
      <td><span class="status-pill ${info.classe}">${info.texto}</span></td>
    </tr>`;
  }).join('');
  body.querySelectorAll('tr[data-material-cod]').forEach(row=>{
    row.addEventListener('click',()=>abrirMaterialModal(row.dataset.materialCod));
  });
}

function aplicarFiltroEstoque(filtro, btn){
  estoqueFiltro=filtro || 'todos';
  document.querySelectorAll('[data-estoque-filter]').forEach(el=>{
    const ativo = el === btn || el.dataset.estoqueFilter === estoqueFiltro;
    el.classList.toggle('active', ativo);
    el.setAttribute('aria-checked', ativo ? 'true' : 'false');
  });
  renderEstoque();
}

const estoqueFilterBtn=document.getElementById('estoqueFilterBtn');
const estoqueFilterMenu=document.getElementById('estoqueFilterMenu');
function fecharMenuFiltroEstoque(){
  estoqueFilterMenu?.classList.remove('open');
  estoqueFilterBtn?.setAttribute('aria-expanded','false');
}
estoqueFilterBtn?.addEventListener('click', e=>{
  e.stopPropagation();
  const aberto=estoqueFilterMenu?.classList.toggle('open');
  estoqueFilterBtn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
});
estoqueFilterMenu?.addEventListener('click', e=>{
  const btn=e.target.closest('[data-estoque-filter]');
  if(!btn) return;
  aplicarFiltroEstoque(btn.dataset.estoqueFilter, btn);
  fecharMenuFiltroEstoque();
});
document.addEventListener('click', e=>{
  if(!e.target.closest('.estoque-filter-wrap')) fecharMenuFiltroEstoque();
});
/* ── BAR CHART DASHBOARD ── */
function mobileExpStatusLabel(status){
  return {
    pendente:'Pendente',
    separacao:'Separação',
    conferencia:'Conferência',
    pronto:'Pronto',
    enviado:'Enviado',
    cancelado:'Cancelado',
  }[status] || 'Pendente';
}

function mobileExpStatusClass(status){
  return {
    pendente:'s-yellow',
    separacao:'s-blue',
    conferencia:'s-purple',
    pronto:'s-green',
    enviado:'s-green',
    cancelado:'s-red',
  }[status] || 's-yellow';
}

function renderMobileExpedicao(){
  const grid=document.getElementById('mobileExpedicoesGrid');
  if(!grid) return;
  const pendentes=EXPEDICOES.filter(e=>(e.status || 'pendente') === 'pendente').length;
  const separacao=EXPEDICOES.filter(e=>['separacao','conferencia'].includes(e.status)).length;
  const prontos=EXPEDICOES.filter(e=>e.status === 'pronto').length;
  const set=(id,value)=>{ const el=document.getElementById(id); if(el) el.textContent=value; };
  set('mobileExpPendentes', pendentes);
  set('mobileExpSeparacao', separacao);
  set('mobileExpProntos', prontos);

  const lista=EXPEDICOES.filter(e=>!['enviado','cancelado'].includes(e.status || 'pendente'));
  if(!lista.length){
    grid.innerHTML='<div class="mobile-expedicao-empty">Nenhum pedido de saída ativo.</div>';
    return;
  }
  grid.innerHTML=lista.map(e=>`<article class="mobile-expedicao-card">
    <div class="mobile-expedicao-top">
      <strong>${escapeHtml(e.codigo || e.id)}</strong>
      <span class="status-pill ${mobileExpStatusClass(e.status)}">${mobileExpStatusLabel(e.status)}</span>
    </div>
    <div class="mobile-expedicao-prod">${escapeHtml(e.produto || '-')}</div>
    <div class="mobile-expedicao-dest">${escapeHtml(e.destino || '-')}</div>
    <div class="mobile-expedicao-meta">${Number(e.quantidade || 0).toLocaleString('pt-BR')} ${escapeHtml(e.unidade || '')} · ${escapeHtml(e.transportadora || 'Transportadora não definida')}</div>
    <div class="mobile-expedicao-conferencia ${Number.isFinite(Number(e.quantidadeConferida)) && Number(e.quantidadeConferida) !== Number(e.quantidade || 0) ? 'divergente' : ''}">Conferido: ${Number.isFinite(Number(e.quantidadeConferida)) ? `${Number(e.quantidadeConferida).toLocaleString('pt-BR')} ${escapeHtml(e.unidade || '')}` : 'Aguardando conferencia'}</div>
    <div class="mobile-expedicao-ref">${escapeHtml(e.opRef || 'Sem OP/lote vinculado')}</div>
  </article>`).join('');
}

function renderBarChart(vals){
  vals = vals || [80,75,85,70,82,77,74];
  const days=['Seg','Ter','Qua','Qui','Sex','Sáb','Hoj'];
  const chart=document.getElementById('barChart');
  if(!chart) return;
  const max=Math.max(...vals);
  chart.innerHTML=vals.map((v,i)=>{
    const h=Math.round((v/max)*90);
    const isToday=i===vals.length-1;
    return `<div class="bar-col">
      <div class="bar-fill" style="height:${h}px;opacity:${isToday?'1':'0.55'}"></div>
      <div class="bar-lbl">${days[i]}</div>
    </div>`;
  }).join('');
}

/* ── SAIR ── */


function cargoLabel(cargo){
  return {gestores:'Gestor', supervisores:'Supervisor', operadores:'Operador'}[cargo] || cargo || '-';
}

function aplicarPermissoes(){
  userPodeGerir = userCargo === 'gestores' || userCargo === 'supervisores';
  userPodeApontar = userCargo === 'operadores' || userCargo === 'supervisores';
  novaOrdemBtn?.classList.toggle('hidden-by-role', !userPodeGerir);
  atualizarUserMenu();
}

function atualizarUserMenu(){
  const setText = (id, value)=>{ const el=document.getElementById(id); if(el) el.textContent = value || '-'; };
  const cargo = cargoLabel(userCargo);
  const nome = currentUserName || '-';
  setText('userMenuName', nome);
  setText('userMenuRole', cargo);
  setText('userMenuNomeDetalhe', nome);
  setText('userMenuCargoDetalhe', cargo);
  setText('userMenuEmpresa', empresaData?.nome || document.getElementById('empNome')?.textContent || '-');
  setText('userMenuToken', empresaToken || document.getElementById('empToken')?.textContent || '-');
}

function toggleUserMenu(force){
  const menu=document.getElementById('userMenu');
  const btn=document.getElementById('userMenuBtn');
  if(!menu || !btn) return;
  const open = typeof force === 'boolean' ? force : !menu.classList.contains('open');
  menu.classList.toggle('open', open);
  btn.setAttribute('aria-expanded', String(open));
}

function abrirPerfil(){
  toggleUserMenu(false);
  alert('Perfil em desenvolvimento.');
}

function abrirDownload(){
  toggleUserMenu(false);
  alert('Download temporariamente inativo. Use o AriLine pelo navegador enquanto o instalador desktop está indisponível.');
}

const userMenuBtn = document.getElementById('userMenuBtn');
userMenuBtn?.addEventListener('click', e=>{ e.stopPropagation(); toggleUserMenu(); });
document.addEventListener('click', e=>{
  const wrap=document.querySelector('.user-menu-wrap');
  if(wrap && !wrap.contains(e.target)) toggleUserMenu(false);
});


function gerarAlertas(){
  const estoqueBaixo = ESTOQUE.filter(e=>Number(e.qtd) < Number(e.min));
  const maquinasParadas = MAQUINAS.filter(m=>m.status === 'parada');
  const opsParadas = ORDENS.filter(o=>o.status === 'parada');
  const alertas = [];
  if(userPodeGerir){
    estoqueBaixo.forEach(e=>alertas.push({tipo:'Estoque minimo', texto:e.mat, sub:`${e.qtd} ${e.un} em estoque - minimo ${e.min}`, nivel:'critico'}));
  }
  maquinasParadas.forEach(m=>alertas.push({tipo:'Maquina parada', texto:`${m.id} - ${m.nome}`, sub:m.motivoParada || 'Sem motivo informado', nivel:'critico'}));
  opsParadas.forEach(o=>alertas.push({tipo:'OP parada', texto:o.id, sub:o.prod || o.produto, nivel:'critico'}));
  return alertas;
}

function renderAlertas(){
  const wrap=document.getElementById('alertasResumo');
  if(!wrap) return;
  const alertas = gerarAlertas();
  if(!alertas.length){
    wrap.innerHTML = `<div class="alert-item ok"><div class="alert-title">Central de alertas</div><div class="alert-text">Nenhum alerta critico agora</div><div class="alert-sub">A fabrica esta sem pendencias principais.</div></div>`;
    return;
  }
  wrap.innerHTML = alertas.slice(0,6).map(a=>`<div class="alert-item ${a.nivel}"><div class="alert-title">${a.tipo}</div><div class="alert-text">${a.texto}</div><div class="alert-sub">${a.sub || ''}</div></div>`).join('');
}

const maquinaModal=document.getElementById('maquinaModal');
const fecharMaquinaModal=document.getElementById('fecharMaquinaModal');
let maquinaDetalheAtual=null;
function statusLabel(status){ return {operando:'Operando',setup:'Setup',parada:'Parada',livre:'Livre'}[status] || status || '-'; }
function abrirMaquinaModal(maquinaId){
  const maq=MAQUINAS.find(m=>m.id===maquinaId); if(!maq || !maquinaModal) return;
  maquinaDetalheAtual=maq;
  const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v||'-';};
  set('maqDetailNome',`${maq.id} - ${maq.nome}`); set('maqDetailStatus',statusLabel(maq.status)); set('maqDetailOP',maq.ordem); set('maqDetailProduto',maq.produto); set('maqDetailOperador',maq.op); set('maqDetailParada',maq.motivoParada || '-');
  document.getElementById('maqApontarBtn')?.classList.toggle('hidden-by-role', !userPodeApontar);
  document.getElementById('maqEncerrarBtn')?.classList.toggle('hidden-by-role', !userPodeGerir || !maq.ordem || maq.ordem==='-');
  document.getElementById('maqTimelineBtn')?.classList.toggle('hidden-by-role', !maq.ordem || maq.ordem==='-');
  maquinaModal.classList.add('active'); maquinaModal.setAttribute('aria-hidden','false');
}
function fecharModalMaquina(){ maquinaModal?.classList.remove('active'); maquinaModal?.setAttribute('aria-hidden','true'); }
fecharMaquinaModal?.addEventListener('click', fecharModalMaquina);
maquinaModal?.addEventListener('click', e=>{ if(e.target===maquinaModal) fecharModalMaquina(); });
document.getElementById('maqApontarBtn')?.addEventListener('click',()=>{ if(maquinaDetalheAtual){ fecharModalMaquina(); abrirApontModal(maquinaDetalheAtual.id); }});
document.getElementById('maqTimelineBtn')?.addEventListener('click',()=>{ if(maquinaDetalheAtual?.ordem) abrirTimeline(maquinaDetalheAtual.ordem); });
document.getElementById('maqEncerrarBtn')?.addEventListener('click',()=>{ if(maquinaDetalheAtual?.ordem) encerrarOP(maquinaDetalheAtual.ordem, maquinaDetalheAtual.id); });

const timelineModal=document.getElementById('timelineModal');
function abrirTimeline(opId){
  const list=document.getElementById('timelineList'); if(!list || !timelineModal) return;
  const op=ORDENS.find(o=>o.id===opId) || {id:opId, prod:'OP'};
  const eventos=APONTAMENTOS.filter(a=>a.ordem===opId).sort((a,b)=>String(a.criadoEm||'').localeCompare(String(b.criadoEm||'')));
  const itens=[`<div class="timeline-item"><div class="timeline-title">OP ${opId} criada / em acompanhamento</div><div class="timeline-meta">${op.prod || op.produto || ''}</div></div>`].concat(eventos.map(e=>`<div class="timeline-item"><div class="timeline-title">${statusLabel(e.status)} ${e.motivo ? '- '+e.motivo : ''}</div><div class="timeline-meta">${e.criadoEm || ''} ${e.produzido ? ' - Produzido: '+e.produzido : ''} ${e.refugo ? ' - Refugo: '+e.refugo : ''} ${e.observacao ? ' - '+e.observacao : ''}</div></div>`));
  list.innerHTML=itens.join(''); timelineModal.classList.add('active'); timelineModal.setAttribute('aria-hidden','false');
}
function fecharTimeline(){ timelineModal?.classList.remove('active'); timelineModal?.setAttribute('aria-hidden','true'); }
document.getElementById('fecharTimelineModal')?.addEventListener('click', fecharTimeline);
timelineModal?.addEventListener('click', e=>{ if(e.target===timelineModal) fecharTimeline(); });

async function encerrarOP(opId, maquinaId){
  if(!userPodeGerir || typeof firebaseEncerrarOP !== 'function') return;
  if(!confirm(`Encerrar a OP ${opId}?`)) return;
  await firebaseEncerrarOP(opId, maquinaId);
}

/* NOVA OP */
const opModal = document.getElementById('opModal');
const opForm = document.getElementById('opForm');
const opFormMsg = document.getElementById('opFormMsg');
const novaOrdemBtn = document.getElementById('novaOrdemBtn');
const fecharOpModal = document.getElementById('fecharOpModal');
const cancelarOp = document.getElementById('cancelarOp');
const opMaquina = document.getElementById('opMaquina');

function gerarOpId(){
  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) + String(d.getMonth()+1).padStart(2,'0') + String(d.getDate()).padStart(2,'0') + '-' + String(d.getHours()).padStart(2,'0') + String(d.getMinutes()).padStart(2,'0') + String(d.getSeconds()).padStart(2,'0');
  return 'OP-' + stamp;
}

function preencherMaquinasOP(){
  if(!opMaquina) return;
  opMaquina.innerHTML = MAQUINAS.map(m => `<option value="${m.id}">${m.id} - ${m.nome}</option>`).join('');
}

function abrirOpModal(){
  if(!userPodeGerir || !opModal) return;
  opForm.reset();
  document.getElementById('opId').value = gerarOpId();
  document.getElementById('opProg').value = '0';
  preencherMaquinasOP();
  opFormMsg.textContent = '';
  opFormMsg.className = 'form-msg';
  opModal.classList.add('active');
  opModal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('opProduto').focus(), 30);
}

function fecharModalOP(){
  if(!opModal) return;
  opModal.classList.remove('active');
  opModal.setAttribute('aria-hidden','true');
}

novaOrdemBtn?.addEventListener('click', abrirOpModal);
fecharOpModal?.addEventListener('click', fecharModalOP);
cancelarOp?.addEventListener('click', fecharModalOP);
opModal?.addEventListener('click', e=>{ if(e.target === opModal) fecharModalOP(); });

opForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  if(typeof firebaseSalvarOP !== 'function'){
    opFormMsg.textContent = 'Firebase ainda nao esta pronto para salvar.';
    opFormMsg.className = 'form-msg error';
    return;
  }

  const form = new FormData(opForm);
  const prog = Math.max(0, Math.min(100, Number(form.get('prog') || 0)));
  const op = {
    id: String(form.get('opId') || gerarOpId()).trim().toUpperCase(),
    produto: String(form.get('produto') || '').trim(),
    maquina: String(form.get('maquina') || '').trim(),
    qty: String(form.get('qty') || '').trim(),
    turno: String(form.get('turno') || 'A'),
    status: String(form.get('status') || 'andamento'),
    prog,
  };

  if(!op.id || !op.produto || !op.maquina || !op.qty){
    opFormMsg.textContent = 'Preencha os campos obrigatorios.';
    opFormMsg.className = 'form-msg error';
    return;
  }

  try {
    opFormMsg.textContent = 'Salvando OP...';
    opFormMsg.className = 'form-msg';
    await firebaseSalvarOP(op);
    fecharModalOP();
    showView('ordens', document.querySelector('[data-view="ordens"]'));
  } catch(err) {
    console.error(err);
    opFormMsg.textContent = 'Nao foi possivel criar a OP. Verifique as permissoes do Firebase.';
    opFormMsg.className = 'form-msg error';
  }
});


/* APONTAMENTO DE OPERADOR */
const apontModal = document.getElementById('apontModal');
const apontForm = document.getElementById('apontForm');
const apontFormMsg = document.getElementById('apontFormMsg');
const fecharApontModal = document.getElementById('fecharApontModal');
const cancelarApont = document.getElementById('cancelarApont');
const apontStatus = document.getElementById('apontStatus');
const apontMotivo = document.getElementById('apontMotivo');

function abrirApontModal(maquinaId){
  if(!userPodeApontar || !apontModal) return;
  const maq = MAQUINAS.find(m=>m.id===maquinaId);
  if(!maq) return;
  apontForm.reset();
  document.getElementById('apontMaquinaId').value = maq.id;
  document.getElementById('apontOrdemId').value = maq.ordem || '';
  document.getElementById('apontMaquinaNome').value = `${maq.id} - ${maq.nome}`;
  document.getElementById('apontOrdemLabel').value = maq.ordem && maq.ordem !== '-' ? `${maq.ordem} - ${maq.produto}` : 'Sem OP vinculada';
  document.getElementById('apontStatus').value = 'parada';
  apontFormMsg.textContent = '';
  apontFormMsg.className = 'form-msg';
  apontModal.classList.add('active');
  apontModal.setAttribute('aria-hidden','false');
}

function fecharModalApont(){
  if(!apontModal) return;
  apontModal.classList.remove('active');
  apontModal.setAttribute('aria-hidden','true');
}

function atualizarMotivoParada(){
  const parado = apontStatus?.value === 'parada';
  if(apontMotivo) apontMotivo.disabled = !parado;
}

fecharApontModal?.addEventListener('click', fecharModalApont);
cancelarApont?.addEventListener('click', fecharModalApont);
apontModal?.addEventListener('click', e=>{ if(e.target === apontModal) fecharModalApont(); });
apontStatus?.addEventListener('change', atualizarMotivoParada);

apontForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  if(typeof firebaseSalvarApontamento !== 'function'){
    apontFormMsg.textContent = 'Firebase ainda nao esta pronto para apontamentos.';
    apontFormMsg.className = 'form-msg error';
    return;
  }

  const form = new FormData(apontForm);
  const status = String(form.get('status') || 'parada');
  const motivo = status === 'parada' ? String(form.get('motivo') || '').trim() : '';
  const apontamento = {
    maquina: String(form.get('maquina') || ''),
    ordem: String(form.get('ordem') || ''),
    status,
    motivo,
    observacao: String(form.get('observacao') || '').trim(),
    produzido: Number(form.get('produzido') || 0),
    refugo: Number(form.get('refugo') || 0),
  };

  if(status === 'parada' && !motivo){
    apontFormMsg.textContent = 'Informe o motivo da parada.';
    apontFormMsg.className = 'form-msg error';
    return;
  }

  try {
    apontFormMsg.textContent = 'Salvando apontamento...';
    apontFormMsg.className = 'form-msg';
    await firebaseSalvarApontamento(apontamento);
    fecharModalApont();
  } catch(err) {
    console.error(err);
    apontFormMsg.textContent = 'Nao foi possivel salvar o apontamento.';
    apontFormMsg.className = 'form-msg error';
  }
});

/* DETALHE DO MATERIAL E COMPRA */
const materialModal = document.getElementById('materialModal');
const fecharMaterialModal = document.getElementById('fecharMaterialModal');
const cancelarMaterial = document.getElementById('cancelarMaterial');
const materialCompraForm = document.getElementById('materialCompraForm');
const materialFormMsg = document.getElementById('materialFormMsg');
const compraPanel = document.getElementById('compraPanel');
const abrirCompraBtn = document.getElementById('abrirCompraBtn');
const salvarCompraBtn = document.getElementById('salvarCompraBtn');

function preencherMaterialDetalhe(mat){
  const info=estoqueStatusInfo(mat);
  const sugestao=estoqueReposicaoSugerida(mat);
  document.getElementById('matDetailNome').textContent = mat.mat || '-';
  document.getElementById('matDetailCod').textContent = mat.cod || '-';
  document.getElementById('matDetailQtd').textContent = `${Number(mat.qtd || 0).toLocaleString('pt-BR')} ${mat.un || ''}`;
  document.getElementById('matDetailMin').textContent = `${Number(mat.min || 0).toLocaleString('pt-BR')} ${mat.un || ''}`;
  document.getElementById('matDetailStatus').textContent = info.texto;
  document.getElementById('matDetailSugestao').textContent = `${sugestao.toLocaleString('pt-BR')} ${mat.un || ''}`;
  document.getElementById('compraMaterialCod').value = mat.cod || '';
  document.getElementById('compraQtd').value = sugestao;
  document.getElementById('compraPrioridade').value = estoqueNivel(mat)==='critico' || estoqueNivel(mat)==='baixo' ? 'Alta' : 'Media';
  document.getElementById('compraObs').value = estoqueNivel(mat)==='ok' ? '' : 'Material com estoque abaixo do nivel recomendado.';
  if(abrirCompraBtn) abrirCompraBtn.style.display = userPodeGerir ? '' : 'none';
  if(materialFormMsg){
    materialFormMsg.textContent = userPodeGerir ? 'Revise os dados antes de solicitar compra.' : 'Somente gestores podem solicitar compra.';
    materialFormMsg.className = 'form-msg';
  }
}

function abrirMaterialModal(cod){
  const mat=ESTOQUE.find(e=>String(e.cod)===String(cod));
  if(!mat || !materialModal) return;
  materialDetalheAtual=mat;
  materialCompraForm?.reset();
  compraPanel?.classList.remove('active');
  if(salvarCompraBtn) salvarCompraBtn.style.display='none';
  preencherMaterialDetalhe(mat);
  materialModal.classList.add('active');
  materialModal.setAttribute('aria-hidden','false');
}

function fecharModalMaterial(){
  if(!materialModal) return;
  materialModal.classList.remove('active');
  materialModal.setAttribute('aria-hidden','true');
  materialDetalheAtual=null;
}

abrirCompraBtn?.addEventListener('click',()=>{
  if(!userPodeGerir || !materialDetalheAtual) return;
  compraPanel?.classList.add('active');
  if(salvarCompraBtn) salvarCompraBtn.style.display='';
  if(materialFormMsg) materialFormMsg.textContent='Preencha a quantidade e envie a solicitacao para compras.';
  setTimeout(()=>document.getElementById('compraQtd')?.focus(),30);
});
fecharMaterialModal?.addEventListener('click', fecharModalMaterial);
cancelarMaterial?.addEventListener('click', fecharModalMaterial);
materialModal?.addEventListener('click', e=>{ if(e.target === materialModal) fecharModalMaterial(); });

materialCompraForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  if(!userPodeGerir || !materialDetalheAtual) return;
  if(typeof firebaseSalvarSolicitacaoCompra !== 'function'){
    materialFormMsg.textContent='Firebase ainda nao esta pronto para solicitacoes de compra.';
    materialFormMsg.className='form-msg error';
    return;
  }
  const form=new FormData(materialCompraForm);
  const quantidade=Number(form.get('quantidade') || 0);
  if(!quantidade || quantidade <= 0){
    materialFormMsg.textContent='Informe uma quantidade valida.';
    materialFormMsg.className='form-msg error';
    return;
  }
  const solicitacao={
    material: materialDetalheAtual.mat || '',
    cod: materialDetalheAtual.cod || '',
    unidade: materialDetalheAtual.un || '',
    quantidade,
    prioridade: String(form.get('prioridade') || 'Media'),
    observacao: String(form.get('observacao') || '').trim(),
    estoqueAtual: Number(materialDetalheAtual.qtd || 0),
    estoqueMinimo: Number(materialDetalheAtual.min || 0),
    status: 'pendente'
  };
  try{
    materialFormMsg.textContent='Enviando solicitacao...';
    materialFormMsg.className='form-msg';
    await firebaseSalvarSolicitacaoCompra(solicitacao);
    materialFormMsg.textContent='Solicitacao de compra enviada.';
    compraPanel?.classList.remove('active');
    if(salvarCompraBtn) salvarCompraBtn.style.display='none';
  }catch(err){
    console.error(err);
    materialFormMsg.textContent='Nao foi possivel enviar a solicitacao.';
    materialFormMsg.className='form-msg error';
  }
});

function sair(){
  sessionStorage.clear();
  window.location.href='login.html';
}

/* ── FIREBASE AUTH ── */
