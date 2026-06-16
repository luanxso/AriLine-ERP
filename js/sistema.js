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
      {id:'AF-0394',prod:'Iogurte — Rotulagem',   status:'andamento',prog:76, maq:'ROT-01',qty:'17.500 un',turno:'A'},
      {id:'AF-0395',prod:'Molho Tomate 500g',      status:'setup',    prog:0,  maq:'ENV-03',qty:'12.000 un',turno:'B'},
      {id:'AF-0396',prod:'Molho Tomate — Rotul.', status:'setup',    prog:0,  maq:'ROT-02',qty:'12.000 un',turno:'B'},
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

const STATUS_COR  = {operando:'#1FAE72',setup:'#C99A1A',parada:'#C03030',livre:'#5A8070'};

/* ── LAYOUTS DE PLANTA POR EMPRESA ─────────────────────────────────────────
   Cada token tem seu próprio mapa de setores (áreas + cores + labels)
   e posições fixas de máquinas. Empresas sem token mapeado usam auto-layout.
   ─────────────────────────────────────────────────────────────────────────── */
const EMPRESA_LAYOUTS = {

  /* Plastik Diadema — Plástico e Borracha
     Layout: grande área de Injeção à esq, Acabamento e Montagem à dir, Expedição canto */
  'ARL-DIAD-7F3K9': {
    setores: [
      {id:'injecao',   label:'INJEÇÃO',    cor:'#3B8FEA', rx:0.03,ry:0.05,rw:0.44,rh:0.60},
      {id:'acabamento',label:'ACABAMENTO', cor:'#1FAE72', rx:0.51,ry:0.05,rw:0.30,rh:0.38},
      {id:'montagem',  label:'MONTAGEM',   cor:'#C99A1A', rx:0.51,ry:0.47,rw:0.30,rh:0.46},
      {id:'expedicao', label:'EXPEDIÇÃO',  cor:'#7B52C4', rx:0.85,ry:0.05,rw:0.12,rh:0.88},
    ],
    posicoes: {
      'INJ-01':{rx:0.08,ry:0.18},'INJ-02':{rx:0.26,ry:0.18},
      'INJ-03':{rx:0.08,ry:0.52},'INJ-04':{rx:0.26,ry:0.52},
      'ACB-01':{rx:0.60,ry:0.18},'ACB-02':{rx:0.72,ry:0.18},
      'MON-01':{rx:0.60,ry:0.60},'MON-02':{rx:0.60,ry:0.80},
      'EXP-01':{rx:0.91,ry:0.55},
    },
  },

  /* MetalParts S. Bernardo — Metal-mecânica
     Layout horizontal: Usinagem (maior, esq), Solda (centro-topo),
     Pintura (centro-baixo), Expedição (direita, estreita) */
  'ARL-SBC-2M8QR': {
    setores: [
      {id:'injecao',   label:'USINAGEM',   cor:'#3B8FEA', rx:0.03,ry:0.05,rw:0.35,rh:0.88},
      {id:'acabamento',label:'SOLDA',      cor:'#1FAE72', rx:0.42,ry:0.05,rw:0.28,rh:0.42},
      {id:'montagem',  label:'PINTURA',    cor:'#E07B39', rx:0.42,ry:0.52,rw:0.28,rh:0.41},
      {id:'expedicao', label:'EXPEDIÇÃO',  cor:'#7B52C4', rx:0.74,ry:0.05,rw:0.23,rh:0.88},
    ],
    posicoes: {
      'USI-01':{rx:0.10,ry:0.22},'USI-02':{rx:0.25,ry:0.22},
      'USI-03':{rx:0.17,ry:0.62},
      'SOL-01':{rx:0.50,ry:0.18},'SOL-02':{rx:0.62,ry:0.18},
      'PIN-01':{rx:0.50,ry:0.65},'PIN-02':{rx:0.62,ry:0.65},
      'EXP-01':{rx:0.86,ry:0.50},
    },
  },

  /* AlimFlex Mauá — Alimentos e Bebidas
     Layout em linha de processo: Mistura (topo-esq), Envase (centro, maior),
     Rotulagem (centro-dir), Expedição/Frio (dir) */
  'ARL-MAUA-5P1XZ': {
    setores: [
      {id:'injecao',   label:'MISTURA',    cor:'#C99A1A', rx:0.03,ry:0.05,rw:0.20,rh:0.88},
      {id:'acabamento',label:'ENVASE',     cor:'#1FAE72', rx:0.27,ry:0.05,rw:0.30,rh:0.88},
      {id:'montagem',  label:'ROTULAGEM',  cor:'#3B8FEA', rx:0.61,ry:0.05,rw:0.18,rh:0.88},
      {id:'expedicao', label:'CÂMARA FRIA',cor:'#7B52C4', rx:0.83,ry:0.05,rw:0.14,rh:0.88},
    ],
    posicoes: {
      'MIS-01':{rx:0.10,ry:0.30},'MIS-02':{rx:0.10,ry:0.65},
      'ENV-01':{rx:0.33,ry:0.25},'ENV-02':{rx:0.45,ry:0.25},'ENV-03':{rx:0.39,ry:0.65},
      'ROT-01':{rx:0.68,ry:0.30},'ROT-02':{rx:0.68,ry:0.65},
      'EXP-01':{rx:0.90,ry:0.50},
    },
  },
};

/* Layout genérico para empresas novas sem mapeamento */
const LAYOUT_GENERICO = {
  setores: [
    {id:'injecao',   label:'SETOR A', cor:'#3B8FEA', rx:0.03,ry:0.05,rw:0.44,rh:0.88},
    {id:'acabamento',label:'SETOR B', cor:'#1FAE72', rx:0.51,ry:0.05,rw:0.44,rh:0.42},
    {id:'montagem',  label:'SETOR C', cor:'#C99A1A', rx:0.51,ry:0.52,rw:0.26,rh:0.41},
    {id:'expedicao', label:'SETOR D', cor:'#7B52C4', rx:0.81,ry:0.52,rw:0.14,rh:0.41},
  ],
  posicoes: {},
};

/* Retorna o layout ativo baseado no token da empresa atual */
function getLayoutAtivo(){
  return EMPRESA_LAYOUTS[empresaToken] || LAYOUT_GENERICO;
}

function getSetorArea(setor){
  return getLayoutAtivo().setores.find(a=>a.id===setor) || getLayoutAtivo().setores[0];
}

/* ── SIDEBAR DINÂMICA ────────────────────────────────────────────────────── */
function renderSidebar(){
  const container = document.getElementById('setorFilter');
  if(!container) return;

  const layout = getLayoutAtivo();
  const setoresPresentes = layout.setores.filter(s =>
    MAQUINAS.some(m => m.setor === s.id)
  );

  /* empresa sem dados ainda → mostra placeholder */
  if(MAQUINAS.length === 0){
    container.innerHTML = `<div style="padding:10px 12px;font-size:11px;color:var(--text3)">Nenhum setor cadastrado</div>`;
    return;
  }

  const chips = [
    /* chip "Todos" sempre primeiro */
    `<div class="setor-chip active" data-setor="all" onclick="filterSetor('all',this)">
      <div class="setor-dot" style="background:var(--accent)"></div>
      <span class="setor-label">Todos</span>
      <span class="setor-count">${MAQUINAS.length}</span>
    </div>`,
    /* um chip por setor que tem ao menos 1 máquina */
    ...setoresPresentes.map(s => {
      const count = MAQUINAS.filter(m => m.setor === s.id).length;
      return `<div class="setor-chip" data-setor="${s.id}" onclick="filterSetor('${s.id}',this)">
        <div class="setor-dot" style="background:${s.cor}"></div>
        <span class="setor-label">${s.label.charAt(0) + s.label.slice(1).toLowerCase()}</span>
        <span class="setor-count">${count}</span>
      </div>`;
    }),
  ];

  container.innerHTML = chips.join('');
  /* reaplica filtro ativo se ainda existir, senão volta pra 'all' */
  const chipAtivo = container.querySelector(`[data-setor="${filtroSetor}"]`);
  if(chipAtivo){
    container.querySelectorAll('.setor-chip').forEach(c=>c.classList.remove('active'));
    chipAtivo.classList.add('active');
  } else {
    filtroSetor = 'all';
    container.querySelector('[data-setor="all"]')?.classList.add('active');
  }
}

/* SETOR_CORES dinâmico — lido do layout ativo */
function getSetorCor(setor){
  const s = getLayoutAtivo().setores.find(a=>a.id===setor);
  return s?.cor || '#3B8FEA';
}

function getMaquinasDoSetor(setor){
  return MAQUINAS.filter(m=>(m.setor || 'injecao') === setor);
}

function autoMaquinaPos(m){
  /* 1. posição salva diretamente na máquina (Firebase) */
  if(Number.isFinite(Number(m.rx)) && Number.isFinite(Number(m.ry))) return {rx:Number(m.rx), ry:Number(m.ry)};
  if(m.posicao && Number.isFinite(Number(m.posicao.rx)) && Number.isFinite(Number(m.posicao.ry))) {
    return {rx:Number(m.posicao.rx), ry:Number(m.posicao.ry)};
  }
  /* 2. posição fixa do layout da empresa */
  const layout = getLayoutAtivo();
  if(layout.posicoes && layout.posicoes[m.id]) return layout.posicoes[m.id];

  /* 3. auto-grid dentro da área do setor */
  const setor = m.setor || 'injecao';
  const area = getSetorArea(setor);
  const maquinasSetor = getMaquinasDoSetor(setor);
  const idx = Math.max(0, maquinasSetor.findIndex(item=>item.id===m.id));
  const total = Math.max(1, maquinasSetor.length);
  const cols = Math.max(1, Math.ceil(Math.sqrt(total * (area.rw / Math.max(area.rh, 0.1)))));
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const rows = Math.max(1, Math.ceil(total / cols));
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
let firebaseSalvarChecklistOperador = null;
let firebaseEncerrarOP = null;
let firebaseSalvarSolicitacaoCompra = null;
let firebaseSalvarExpedicao = null;
let firebaseAtualizarStatusExpedicao = null;
let firebaseRegistrarConferenciaExpedicao = null;
let firebaseCriarUsuarioEmpresa = null;
let firebaseRemoverUsuarioEmpresa = null;
let firebaseEditarUsuarioEmpresa = null;
let USUARIOS_EMPRESA = [];
let AUDITORIA_USUARIOS = [];
let ASSINATURA_EMPRESA = null;
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
let expedicaoFiltro = 'todos';
let materialDetalheAtual = null;
let expedicaoConferenciaAtual = null;
let expedicaoRomaneioAtual = null;
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
  if(v === 'usuarios' && !podeAdministrarUsuarios()) return;
  document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
  el?.classList.add('active');
  document.querySelectorAll('.view').forEach(d=>d.classList.remove('active'));
  const target = document.getElementById('view-'+v);
  if(target) target.classList.add('active');
  if(v==='mapa') setTimeout(()=>{ initCanvas(); drawMapa(); },30);
  if(v==='usuarios') renderUsuarios();
  if(v==='expedicao') renderExpedicao();
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

  /* empresa sem máquinas cadastradas → tela vazia com mensagem */
  if(MAQUINAS.length === 0){
    ctx.save();
    const textMuted = getCSSVar('--text3');
    ctx.font = '700 13px "Barlow",system-ui';
    ctx.fillStyle = textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('Nenhuma máquina cadastrada nesta empresa.', mapW/2, mapH/2 - 10);
    ctx.font = '400 11px "Barlow",system-ui';
    ctx.fillText('Use popular-banco.html para carregar dados de demonstração.', mapW/2, mapH/2 + 12);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.translate(mapOffsetX,mapOffsetY);
  ctx.translate(mapW/2,mapH/2);
  ctx.scale(mapScale,mapScale);
  ctx.translate(-mapW/2,-mapH/2);

  const textPrimary = getCSSVar('--text');
  const textMuted   = getCSSVar('--text3');
  const layout      = getLayoutAtivo();

  /* setor areas */
  layout.setores.forEach(a=>{
    const dim = filtroSetor!=='all' && a.id!==filtroSetor;
    const cor = a.cor;
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
/* EXPEDICAO */
const EXPEDICAO_STATUS = {
  pendente:   { label:'Pendente',    cls:'s-yellow' },
  separacao:  { label:'Separação',   cls:'s-blue' },
  conferencia:{ label:'Conferência', cls:'s-purple' },
  pronto:     { label:'Pronto',      cls:'s-green' },
  enviado:    { label:'Enviado',     cls:'s-green' },
  cancelado:  { label:'Cancelado',   cls:'s-red' },
};

function expedicaoStatusInfo(status){
  return EXPEDICAO_STATUS[status] || EXPEDICAO_STATUS.pendente;
}

function expedicaoStatusSeguinte(status){
  return {
    pendente: 'separacao',
    separacao: 'conferencia',
    conferencia: 'pronto',
    pronto: 'enviado',
  }[status] || '';
}

function expedicaoStatusAcaoLabel(status){
  return {
    pendente: 'Iniciar separação',
    separacao: 'Conferir',
    conferencia: 'Registrar conferencia',
    pronto: 'Confirmar envio',
  }[status] || '';
}

function expedicaoPodeAvancar(status){
  if(status === 'pendente' || status === 'pronto') return userPodeGerir;
  if(status === 'separacao' || status === 'conferencia') return userPodeApontar || userPodeGerir;
  return false;
}

function expedicaoDataLabel(value){
  if(!value) return '-';
  const data = new Date(String(value).includes('T') ? value : `${value}T00:00:00`);
  if(Number.isNaN(data.getTime())) return String(value);
  return data.toLocaleDateString('pt-BR');
}

function expedicaoHoje(value){
  if(!value) return false;
  const data = new Date(value);
  if(Number.isNaN(data.getTime())) return false;
  const hoje = new Date();
  return data.getFullYear() === hoje.getFullYear()
    && data.getMonth() === hoje.getMonth()
    && data.getDate() === hoje.getDate();
}

function encontrarExpedicao(id){
  return EXPEDICOES.find(e=>String(e.id || e.codigo) === String(id));
}

function expedicaoQuantidadeLabel(valor, unidade){
  const numero = Number(valor);
  const texto = Number.isFinite(numero) ? numero.toLocaleString('pt-BR') : '-';
  return `${texto} ${unidade || ''}`.trim();
}

function expedicaoConferida(expedicao){
  return Number.isFinite(Number(expedicao?.quantidadeConferida));
}

function expedicaoTemDivergencia(expedicao){
  if(!expedicaoConferida(expedicao)) return false;
  return Number(expedicao.quantidadeConferida) !== Number(expedicao.quantidade || 0);
}

function expedicoesFiltradas(){
  if(expedicaoFiltro === 'todos') return EXPEDICOES;
  return EXPEDICOES.filter(e=>String(e.status || 'pendente') === expedicaoFiltro);
}

function expedicaoResumo(){
  return {
    pendentes: EXPEDICOES.filter(e=>(e.status || 'pendente') === 'pendente').length,
    separacao: EXPEDICOES.filter(e=>['separacao','conferencia'].includes(e.status)).length,
    prontos: EXPEDICOES.filter(e=>e.status === 'pronto').length,
    enviadosHoje: EXPEDICOES.filter(e=>e.status === 'enviado' && expedicaoHoje(e.enviadoEm || e.atualizadoEm)).length,
  };
}

function renderExpedicao(){
  const sub=document.getElementById('expedicao-sub');
  if(sub && empresaData) sub.textContent=`${empresaData.nome} - pedidos de saída manuais`;

  const resumo=expedicaoResumo();
  const setText=(id,value)=>{ const el=document.getElementById(id); if(el) el.textContent=value; };
  setText('expKpiPendentes', resumo.pendentes);
  setText('expKpiSeparacao', resumo.separacao);
  setText('expKpiProntos', resumo.prontos);
  setText('expKpiEnviadosHoje', resumo.enviadosHoje);
  setText('expedicaoCount', `${EXPEDICOES.length} pedido${EXPEDICOES.length === 1 ? '' : 's'}`);

  const grid=document.getElementById('expedicoesGrid');
  if(!grid) return;

  const lista=expedicoesFiltradas().slice().sort((a,b)=>String(b.criadoEm || b.previsao || '').localeCompare(String(a.criadoEm || a.previsao || '')));
  if(!lista.length){
    grid.innerHTML='<div class="expedicao-empty">Nenhum pedido de saída encontrado neste filtro.</div>';
    return;
  }

  grid.innerHTML=lista.map(e=>{
    const status=String(e.status || 'pendente');
    const info=expedicaoStatusInfo(status);
    const proximo=expedicaoStatusSeguinte(status);
    const acaoConferencia=status === 'conferencia' && expedicaoPodeAvancar(status);
    const podeAvancar=proximo && expedicaoPodeAvancar(status) && !acaoConferencia;
    const podeCancelar=userPodeGerir && !['enviado','cancelado'].includes(status);
    const conferida=expedicaoConferida(e);
    const divergente=expedicaoTemDivergencia(e) || e.divergencia === true;
    const conferenciaClasse=conferida ? (divergente ? 'conferencia-diff' : 'conferencia-ok') : '';
    const conferenciaTexto=conferida
      ? expedicaoQuantidadeLabel(e.quantidadeConferida, e.unidade)
      : 'Aguardando conferencia';
    const conferenciaResumo=conferida ? (divergente ? 'Divergencia' : 'OK') : 'Pendente';
    const id=escapeHtml(e.id || e.codigo);
    return `<article class="expedicao-card">
      <div class="expedicao-card-head">
        <div>
          <div class="expedicao-codigo">${escapeHtml(e.codigo || e.id)}</div>
          <div class="expedicao-produto">${escapeHtml(e.produto)}</div>
          <div class="expedicao-destino">${escapeHtml(e.destino)}</div>
        </div>
        <span class="status-pill ${info.cls}">${info.label}</span>
      </div>
      <div class="expedicao-meta">
        <div><div class="expedicao-meta-k">Quantidade prevista</div><div class="expedicao-meta-v">${escapeHtml(expedicaoQuantidadeLabel(e.quantidade, e.unidade))}</div></div>
        <div><div class="expedicao-meta-k">Previsão</div><div class="expedicao-meta-v">${escapeHtml(expedicaoDataLabel(e.previsao))}</div></div>
        <div><div class="expedicao-meta-k">Transportadora</div><div class="expedicao-meta-v">${escapeHtml(e.transportadora || 'Não definida')}</div></div>
        <div><div class="expedicao-meta-k">OP / lote</div><div class="expedicao-meta-v">${escapeHtml(e.opRef || 'Sem vínculo')}</div></div>
      </div>
      <div class="expedicao-conferencia ${conferenciaClasse}">
        <span>Conferido: <strong>${escapeHtml(conferenciaTexto)}</strong></span>
        <strong>${escapeHtml(conferenciaResumo)}</strong>
      </div>
      ${e.observacao ? `<div class="expedicao-obs">${escapeHtml(e.observacao)}</div>` : ''}
      ${e.conferenciaObs ? `<div class="expedicao-obs">Obs. conferencia: ${escapeHtml(e.conferenciaObs)}</div>` : ''}
      <div class="expedicao-actions">
        <button class="btn-sm" type="button" data-expedicao-romaneio="${id}"><i class="ph ph-file-text"></i> Romaneio</button>
        ${acaoConferencia ? `<button class="btn-sm primary" type="button" data-expedicao-conferencia="${id}">${expedicaoStatusAcaoLabel(status)}</button>` : ''}
        ${podeAvancar ? `<button class="btn-sm primary" type="button" data-expedicao-id="${id}" data-expedicao-status="${proximo}">${expedicaoStatusAcaoLabel(status)}</button>` : ''}
        ${podeCancelar ? `<button class="btn-sm danger" type="button" data-expedicao-id="${id}" data-expedicao-status="cancelado">Cancelar</button>` : ''}
      </div>
    </article>`;
  }).join('');

  grid.querySelectorAll('[data-expedicao-id][data-expedicao-status]').forEach(btn=>{
    btn.addEventListener('click',()=>atualizarStatusExpedicao(btn.dataset.expedicaoId, btn.dataset.expedicaoStatus));
  });
  grid.querySelectorAll('[data-expedicao-conferencia]').forEach(btn=>{
    btn.addEventListener('click',()=>abrirConferenciaExpedicao(btn.dataset.expedicaoConferencia));
  });
  grid.querySelectorAll('[data-expedicao-romaneio]').forEach(btn=>{
    btn.addEventListener('click',()=>abrirRomaneioExpedicao(btn.dataset.expedicaoRomaneio));
  });
}

function aplicarFiltroExpedicao(filtro, btn){
  expedicaoFiltro=filtro || 'todos';
  document.querySelectorAll('[data-expedicao-filter]').forEach(el=>{
    const ativo = el === btn || el.dataset.expedicaoFilter === expedicaoFiltro;
    el.classList.toggle('active', ativo);
    el.setAttribute('aria-checked', ativo ? 'true' : 'false');
  });
  renderExpedicao();
}

const expedicaoFilterBtn=document.getElementById('expedicaoFilterBtn');
const expedicaoFilterMenu=document.getElementById('expedicaoFilterMenu');
function fecharMenuFiltroExpedicao(){
  expedicaoFilterMenu?.classList.remove('open');
  expedicaoFilterBtn?.setAttribute('aria-expanded','false');
}
expedicaoFilterBtn?.addEventListener('click', e=>{
  e.stopPropagation();
  const aberto=expedicaoFilterMenu?.classList.toggle('open');
  expedicaoFilterBtn.setAttribute('aria-expanded', aberto ? 'true' : 'false');
});
expedicaoFilterMenu?.addEventListener('click', e=>{
  const btn=e.target.closest('[data-expedicao-filter]');
  if(!btn) return;
  aplicarFiltroExpedicao(btn.dataset.expedicaoFilter, btn);
  fecharMenuFiltroExpedicao();
});
document.addEventListener('click', e=>{
  if(!e.target.closest('.expedicao-filter-wrap')) fecharMenuFiltroExpedicao();
});

const expedicaoModal=document.getElementById('expedicaoModal');
const expedicaoForm=document.getElementById('expedicaoForm');
const expedicaoFormMsg=document.getElementById('expedicaoFormMsg');
const novaExpedicaoBtn=document.getElementById('novaExpedicaoBtn');
const fecharExpedicaoModal=document.getElementById('fecharExpedicaoModal');
const cancelarExpedicao=document.getElementById('cancelarExpedicao');
const expedicaoConferenciaModal=document.getElementById('expedicaoConferenciaModal');
const expedicaoConferenciaForm=document.getElementById('expedicaoConferenciaForm');
const conferenciaFormMsg=document.getElementById('conferenciaFormMsg');
const fecharConferenciaModal=document.getElementById('fecharConferenciaModal');
const cancelarConferencia=document.getElementById('cancelarConferencia');
const expedicaoRomaneioModal=document.getElementById('expedicaoRomaneioModal');
const fecharRomaneioModal=document.getElementById('fecharRomaneioModal');
const fecharRomaneioBtn=document.getElementById('fecharRomaneioBtn');
const imprimirRomaneioBtn=document.getElementById('imprimirRomaneioBtn');

function gerarExpedicaoCodigo(){
  const d=new Date();
  const stamp=String(d.getFullYear()).slice(2)
    + String(d.getMonth()+1).padStart(2,'0')
    + String(d.getDate()).padStart(2,'0')
    + '-'
    + String(d.getHours()).padStart(2,'0')
    + String(d.getMinutes()).padStart(2,'0')
    + String(d.getSeconds()).padStart(2,'0');
  return 'EXP-' + stamp;
}

function validarExpedicao(expedicao){
  if(!expedicao.codigo) return { ok:false, mensagem:'Informe o código do pedido.' };
  if(!expedicao.destino) return { ok:false, mensagem:'Informe o cliente ou destino.' };
  if(!expedicao.produto) return { ok:false, mensagem:'Informe o produto ou carga.' };
  if(!Number.isFinite(Number(expedicao.quantidade)) || Number(expedicao.quantidade) <= 0) {
    return { ok:false, mensagem:'Informe uma quantidade válida.' };
  }
  if(!expedicao.unidade) return { ok:false, mensagem:'Informe a unidade.' };
  return { ok:true };
}

function abrirExpedicaoModal(){
  if(!userPodeGerir || !expedicaoModal) return;
  expedicaoForm?.reset();
  document.getElementById('expedicaoCodigo').value=gerarExpedicaoCodigo();
  document.getElementById('expedicaoPrevisao').value=new Date().toISOString().slice(0,10);
  if(expedicaoFormMsg){
    expedicaoFormMsg.textContent='OP/lote é opcional. Use apenas quando esse pedido precisar de rastreio.';
    expedicaoFormMsg.className='form-msg';
  }
  expedicaoModal.classList.add('active');
  expedicaoModal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('expedicaoDestino')?.focus(),30);
}

function fecharModalExpedicao(){
  if(!expedicaoModal) return;
  expedicaoModal.classList.remove('active');
  expedicaoModal.setAttribute('aria-hidden','true');
}

function setElementText(id, value){
  const el=document.getElementById(id);
  if(el) el.textContent=value;
}

function setInputValue(id, value){
  const el=document.getElementById(id);
  if(el) el.value=value;
}

function abrirConferenciaExpedicao(id){
  const expedicao=encontrarExpedicao(id);
  if(!expedicao || !expedicaoConferenciaModal) return;
  expedicaoConferenciaAtual=expedicao;
  const quantidadePrevista=expedicaoQuantidadeLabel(expedicao.quantidade, expedicao.unidade);
  setInputValue('conferenciaExpedicaoId', expedicao.id || expedicao.codigo || '');
  setElementText('confPedidoCodigo', expedicao.codigo || expedicao.id || '-');
  setElementText('confPedidoProduto', expedicao.produto || '-');
  setElementText('confPedidoDestino', expedicao.destino || '-');
  setElementText('confQuantidadePrevista', quantidadePrevista);
  setInputValue('conferenciaQuantidade', expedicaoConferida(expedicao) ? Number(expedicao.quantidadeConferida) : Number(expedicao.quantidade || 0));
  setInputValue('conferenciaResponsavel', currentUserName || '-');
  setInputValue('conferenciaObs', expedicao.conferenciaObs || '');
  if(conferenciaFormMsg){
    conferenciaFormMsg.textContent='Confira a quantidade física antes de liberar para pronto.';
    conferenciaFormMsg.className='form-msg';
  }
  expedicaoConferenciaModal.classList.add('active');
  expedicaoConferenciaModal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('conferenciaQuantidade')?.focus(),30);
}

function fecharModalConferencia(){
  if(!expedicaoConferenciaModal) return;
  expedicaoConferenciaAtual=null;
  expedicaoConferenciaModal.classList.remove('active');
  expedicaoConferenciaModal.setAttribute('aria-hidden','true');
}

async function registrarConferenciaExpedicao(e){
  e?.preventDefault();
  if(!expedicaoConferenciaAtual || !expedicaoConferenciaForm) return;
  const form=new FormData(expedicaoConferenciaForm);
  const quantidadeConferida=Number(form.get('quantidadeConferida'));
  if(!Number.isFinite(quantidadeConferida) || quantidadeConferida < 0){
    if(conferenciaFormMsg){
      conferenciaFormMsg.textContent='Informe uma quantidade conferida valida.';
      conferenciaFormMsg.className='form-msg error';
    }
    return;
  }
  const observacao=String(form.get('observacao') || '').trim();
  const payload={
    quantidadeConferida,
    observacao,
    conferidoPor: currentUser?.uid || '',
    conferidoPorNome: currentUserName || '-',
    divergencia: quantidadeConferida !== Number(expedicaoConferenciaAtual.quantidade || 0),
  };
  try{
    if(conferenciaFormMsg){
      conferenciaFormMsg.textContent='Registrando conferencia...';
      conferenciaFormMsg.className='form-msg';
    }
    if(typeof firebaseRegistrarConferenciaExpedicao === 'function'){
      await firebaseRegistrarConferenciaExpedicao(expedicaoConferenciaAtual.id || expedicaoConferenciaAtual.codigo, payload);
    } else {
      Object.assign(expedicaoConferenciaAtual, {
        quantidadeConferida,
        conferenciaObs: observacao,
        conferidoPor: payload.conferidoPor,
        conferidoPorNome: payload.conferidoPorNome,
        conferidoEm: new Date().toISOString(),
        divergencia: payload.divergencia,
        status: 'pronto',
        atualizadoEm: new Date().toISOString(),
      });
      renderExpedicao();
    }
    fecharModalConferencia();
  }catch(err){
    console.error(err);
    if(conferenciaFormMsg){
      conferenciaFormMsg.textContent='Nao foi possivel registrar a conferencia.';
      conferenciaFormMsg.className='form-msg error';
    }
  }
}

function abrirRomaneioExpedicao(id){
  const expedicao=encontrarExpedicao(id);
  if(!expedicao || !expedicaoRomaneioModal) return;
  expedicaoRomaneioAtual=expedicao;
  const info=expedicaoStatusInfo(expedicao.status || 'pendente');
  const conferida=expedicaoConferida(expedicao);
  const divergente=expedicaoTemDivergencia(expedicao) || expedicao.divergencia === true;
  setElementText('romaneioCodigo', expedicao.codigo || expedicao.id || '-');
  setElementText('romaneioDestino', expedicao.destino || '-');
  setElementText('romaneioProduto', expedicao.produto || '-');
  setElementText('romaneioQtdPrevista', expedicaoQuantidadeLabel(expedicao.quantidade, expedicao.unidade));
  setElementText('romaneioQtdConferida', conferida ? expedicaoQuantidadeLabel(expedicao.quantidadeConferida, expedicao.unidade) : 'Nao conferida');
  setElementText('romaneioTransportadora', expedicao.transportadora || 'Nao definida');
  setElementText('romaneioPrevisao', expedicaoDataLabel(expedicao.previsao));
  setElementText('romaneioOpRef', expedicao.opRef || 'Sem vinculo');
  setElementText('romaneioStatus', info.label || '-');
  setElementText('romaneioDivergencia', conferida ? (divergente ? 'Divergencia de quantidade' : 'Conferencia OK') : 'Aguardando conferencia');
  setElementText('romaneioObs', expedicao.conferenciaObs || expedicao.observacao || '-');
  document.getElementById('romaneioDivergencia')?.parentElement?.classList.toggle('romaneio-alert', divergente);
  expedicaoRomaneioModal.classList.add('active');
  expedicaoRomaneioModal.setAttribute('aria-hidden','false');
}

function fecharModalRomaneio(){
  if(!expedicaoRomaneioModal) return;
  expedicaoRomaneioAtual=null;
  expedicaoRomaneioModal.classList.remove('active');
  expedicaoRomaneioModal.setAttribute('aria-hidden','true');
}

function imprimirRomaneioExpedicao(){
  if(!expedicaoRomaneioAtual) return;
  window.print();
}

async function salvarExpedicao(e){
  e?.preventDefault();
  if(!userPodeGerir || !expedicaoForm) return;
  const form=new FormData(expedicaoForm);
  const codigo=String(form.get('codigo') || gerarExpedicaoCodigo()).trim().toUpperCase();
  const expedicao={
    id: codigo,
    codigo,
    destino: String(form.get('destino') || '').trim(),
    produto: String(form.get('produto') || '').trim(),
    quantidade: Number(form.get('quantidade') || 0),
    unidade: String(form.get('unidade') || 'un'),
    transportadora: String(form.get('transportadora') || '').trim(),
    previsao: String(form.get('previsao') || '').trim(),
    opRef: String(form.get('opRef') || '').trim(),
    observacao: String(form.get('observacao') || '').trim(),
    status: 'pendente',
  };
  const validacao=validarExpedicao(expedicao);
  if(!validacao.ok){
    if(expedicaoFormMsg){
      expedicaoFormMsg.textContent=validacao.mensagem;
      expedicaoFormMsg.className='form-msg error';
    }
    return;
  }
  try{
    if(expedicaoFormMsg){
      expedicaoFormMsg.textContent='Salvando pedido de saída...';
      expedicaoFormMsg.className='form-msg';
    }
    if(typeof firebaseSalvarExpedicao === 'function'){
      await firebaseSalvarExpedicao(expedicao);
    } else {
      EXPEDICOES.unshift({ ...expedicao, criadoEm:new Date().toISOString(), criadoPorNome:currentUserName });
      renderExpedicao();
    }
    fecharModalExpedicao();
    showView('expedicao', document.querySelector('[data-view="expedição"], [data-view="expedicao"]'));
  }catch(err){
    console.error(err);
    if(expedicaoFormMsg){
      expedicaoFormMsg.textContent='Não foi possível salvar o pedido de saída.';
      expedicaoFormMsg.className='form-msg error';
    }
  }
}

async function atualizarStatusExpedicao(id, status){
  const expedicao=encontrarExpedicao(id);
  if(!expedicao || !status) return;
  if(status === 'pronto' && !expedicaoConferida(expedicao)){
    abrirConferenciaExpedicao(id);
    return;
  }
  if(status === 'cancelado' && !confirm(`Cancelar o pedido ${expedicao.codigo || id}?`)) return;
  try{
    if(typeof firebaseAtualizarStatusExpedicao === 'function'){
      await firebaseAtualizarStatusExpedicao(id, status);
    } else {
      expedicao.status=status;
      expedicao.atualizadoEm=new Date().toISOString();
      if(status === 'enviado') expedicao.enviadoEm=expedicao.atualizadoEm;
      renderExpedicao();
    }
  }catch(err){
    console.error(err);
    alert('Não foi possível atualizar o status da expedição.');
  }
}

novaExpedicaoBtn?.addEventListener('click', abrirExpedicaoModal);
fecharExpedicaoModal?.addEventListener('click', fecharModalExpedicao);
cancelarExpedicao?.addEventListener('click', fecharModalExpedicao);
expedicaoModal?.addEventListener('click', e=>{ if(e.target === expedicaoModal) fecharModalExpedicao(); });
expedicaoForm?.addEventListener('submit', salvarExpedicao);
fecharConferenciaModal?.addEventListener('click', fecharModalConferencia);
cancelarConferencia?.addEventListener('click', fecharModalConferencia);
expedicaoConferenciaModal?.addEventListener('click', e=>{ if(e.target === expedicaoConferenciaModal) fecharModalConferencia(); });
expedicaoConferenciaForm?.addEventListener('submit', registrarConferenciaExpedicao);
fecharRomaneioModal?.addEventListener('click', fecharModalRomaneio);
fecharRomaneioBtn?.addEventListener('click', fecharModalRomaneio);
expedicaoRomaneioModal?.addEventListener('click', e=>{ if(e.target === expedicaoRomaneioModal) fecharModalRomaneio(); });
imprimirRomaneioBtn?.addEventListener('click', imprimirRomaneioExpedicao);

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

function renderDonut(){
  const op    = MAQUINAS.filter(m=>m.status==='operando').length;
  const setup = MAQUINAS.filter(m=>m.status==='setup').length;
  const par   = MAQUINAS.filter(m=>m.status==='parada').length;
  const inativo = MAQUINAS.filter(m=>m.status==='livre' || (m.status !== 'operando' && m.status !== 'setup' && m.status !== 'parada')).length;
  const total = MAQUINAS.length || 1;

  const pOp    = (op    / total) * 100;
  const pSetup = (setup / total) * 100;
  const pPar   = (par   / total) * 100;
  const pInativo = 100 - pOp - pSetup - pPar;

  const donut = document.querySelector('.donut');
  if(donut){
    donut.style.background = `conic-gradient(
      var(--green)  0% ${pOp.toFixed(1)}%,
      var(--yellow) ${pOp.toFixed(1)}% ${(pOp+pSetup).toFixed(1)}%,
      var(--red)    ${(pOp+pSetup).toFixed(1)}% ${(pOp+pSetup+pPar).toFixed(1)}%,
      var(--border) ${(pOp+pSetup+pPar).toFixed(1)}% 100%
    )`;
  }

  const legend = document.querySelector('.donut-legend');
  if(legend){
    legend.innerHTML = `
      <div class="donut-item"><div class="donut-dot" style="background:var(--green)"></div>Operando (${op})</div>
      <div class="donut-item"><div class="donut-dot" style="background:var(--yellow)"></div>Setup (${setup})</div>
      <div class="donut-item"><div class="donut-dot" style="background:var(--red)"></div>Parada (${par})</div>
      <div class="donut-item"><div class="donut-dot" style="background:var(--border)"></div>Inativo (${inativo})</div>
    `;
  }
}

/* ── SAIR ── */


function cargoLabel(cargo){
  return {gestores:'Gestor', administradores:'Administrador', admin:'Administrador', supervisores:'Supervisor', operadores:'Operador'}[cargo] || cargo || '-';
}

function podeAdministrarUsuarios(){
  return ['gestores','administradores','admin'].includes(userCargo);
}

function aplicarPermissoes(){
  userPodeGerir = userCargo === 'gestores' || userCargo === 'supervisores';
  userPodeApontar = userCargo === 'operadores' || userCargo === 'supervisores';
  const userPodeAdministrarUsuarios = podeAdministrarUsuarios();
  novaOrdemBtn?.classList.toggle('hidden-by-role', !userPodeGerir);
  novaExpedicaoBtn?.classList.toggle('hidden-by-role', !userPodeGerir);
  novoUsuarioBtn?.classList.toggle('hidden-by-role', !userPodeAdministrarUsuarios);
  document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden-by-role', !userPodeAdministrarUsuarios));
  if(!userPodeAdministrarUsuarios && document.getElementById('view-usuarios')?.classList.contains('active')){
    showView('dashboard', document.querySelector('[data-view="dashboard"]'));
  }
  renderUsuarios();
  renderExpedicao();
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

/* USUARIOS */
const usuarioModal = document.getElementById('usuarioModal');
const usuarioForm = document.getElementById('usuarioForm');
const usuarioFormMsg = document.getElementById('usuarioFormMsg');
const novoUsuarioBtn = document.getElementById('novoUsuarioBtn');
const fecharUsuarioModal = document.getElementById('fecharUsuarioModal');
const cancelarUsuario = document.getElementById('cancelarUsuario');
const usuarioModalTitle = document.getElementById('usuarioModalTitle');
const usuarioSubmitBtn = document.getElementById('usuarioSubmitBtn');
const usuarioEmailInput = document.getElementById('usuarioEmail');
const usuarioSenhaInput = document.getElementById('usuarioSenha');
const usuarioSenhaField = document.getElementById('usuarioSenhaField');
const usuarioStatusField = document.getElementById('usuarioStatusField');
const usuarioStatusInput = document.getElementById('usuarioStatus');
const PLANO_LIMITES_USUARIOS = { basico: 5, profissional: 20, enterprise: 0 };
let usuarioEditandoUid = null;

function limiteUsuariosAtual(){
  const plano = ASSINATURA_EMPRESA?.plano || 'profissional';
  const limiteAssinatura = Number(ASSINATURA_EMPRESA?.limiteUsuarios);
  if(Number.isFinite(limiteAssinatura) && limiteAssinatura >= 0) return limiteAssinatura;
  return PLANO_LIMITES_USUARIOS[plano] ?? PLANO_LIMITES_USUARIOS.profissional;
}

function limiteUsuariosAtingido(){
  const limite = limiteUsuariosAtual();
  return limite > 0 && USUARIOS_EMPRESA.length >= limite;
}

function usuariosLimiteLabel(total){
  const limite = limiteUsuariosAtual();
  if(limite <= 0) return `${total} usuarios / ilimitado`;
  return `${total} / ${limite} usuarios`;
}

function usuarioStatusLabel(status){
  return {ativo:'Ativo', inativo:'Inativo', bloqueado:'Bloqueado'}[status] || status || 'Ativo';
}

function usuarioCriadoEmLabel(value){
  if(!value) return 'Sem data';
  const data = new Date(value);
  if(Number.isNaN(data.getTime())) return String(value);
  return data.toLocaleDateString('pt-BR');
}

function usuarioDataHoraLabel(value){
  if(!value) return 'Sem data';
  const data = typeof value === 'number' ? new Date(value) : new Date(value);
  if(Number.isNaN(data.getTime())) return String(value);
  return data.toLocaleString('pt-BR', { dateStyle:'short', timeStyle:'short' });
}

function usuarioEhAdministrador(cargo){
  return ['gestores','administradores','admin'].includes(cargo);
}

function totalAdminsAtivos(){
  return USUARIOS_EMPRESA.filter(u=>usuarioEhAdministrador(u.cargo) && (u.status || 'ativo') === 'ativo').length;
}

function setUsuariosTab(tab){
  const isAuditoria = tab === 'auditoria';
  document.getElementById('usuariosTabEquipe')?.classList.toggle('active', !isAuditoria);
  document.getElementById('usuariosTabAuditoria')?.classList.toggle('active', isAuditoria);
  document.getElementById('usuariosPanelEquipe')?.classList.toggle('active', !isAuditoria);
  document.getElementById('usuariosPanelAuditoria')?.classList.toggle('active', isAuditoria);
  if(isAuditoria) renderAuditoriaUsuarios();
}

function auditoriaAcaoLabel(acao){
  return {
    criacao_usuario: 'Usuario criado',
    edicao_usuario: 'Usuario editado',
    remocao_usuario: 'Usuario removido',
    inativacao_usuario: 'Usuario inativado',
    reativacao_usuario: 'Usuario reativado',
  }[acao] || acao || 'Acao registrada';
}

function auditoriaDiffLabel(log){
  const antes = log.antes || {};
  const depois = log.depois || {};
  const partes = [];
  if(antes.cargo && depois.cargo && antes.cargo !== depois.cargo){
    partes.push(`Cargo: ${cargoLabel(antes.cargo)} -> ${cargoLabel(depois.cargo)}`);
  }
  if(antes.status && depois.status && antes.status !== depois.status){
    partes.push(`Status: ${usuarioStatusLabel(antes.status)} -> ${usuarioStatusLabel(depois.status)}`);
  }
  if(antes.nome && depois.nome && antes.nome !== depois.nome){
    partes.push(`Nome: ${antes.nome} -> ${depois.nome}`);
  }
  return partes.join(' | ');
}

function renderAuditoriaUsuarios(){
  const list = document.getElementById('auditoriaUsuariosList');
  if(!list) return;
  if(!podeAdministrarUsuarios()){
    list.innerHTML = '<div class="usuarios-empty">Somente diretores/gestores podem acessar a auditoria.</div>';
    return;
  }
  const logs = [...AUDITORIA_USUARIOS].sort((a,b)=>{
    const da = new Date(a.criadoEm || a.editadoEm || a.removidoEm || 0).getTime() || 0;
    const db = new Date(b.criadoEm || b.editadoEm || b.removidoEm || 0).getTime() || 0;
    return db - da;
  });
  if(!logs.length){
    list.innerHTML = '<div class="usuarios-empty">Nenhum registro de auditoria encontrado.</div>';
    return;
  }
  list.innerHTML = logs.map(log=>{
    const diff = auditoriaDiffLabel(log);
    return `<div class="auditoria-item">
      <div class="auditoria-title">${escapeHtml(auditoriaAcaoLabel(log.acao))}: ${escapeHtml(log.usuarioNome || log.usuarioEmail || log.usuarioUid || '-')}</div>
      <div class="auditoria-meta">${escapeHtml(usuarioDataHoraLabel(log.criadoEm || log.editadoEm || log.removidoEm))} - Responsavel: ${escapeHtml(log.responsavelNome || log.responsavelUid || '-')}</div>
      ${diff ? `<div class="auditoria-diff">${escapeHtml(diff)}</div>` : ''}
    </div>`;
  }).join('');
}

function renderUsuarios(){
  const grid = document.getElementById('usuariosGrid');
  const count = document.getElementById('usuariosCount');
  const sub = document.getElementById('usuarios-sub');
  if(!grid) return;

  const lista = [...USUARIOS_EMPRESA].sort((a,b)=>String(a.nome || '').localeCompare(String(b.nome || '')));
  const limiteAtingido = limiteUsuariosAtingido();
  if(count) count.textContent = usuariosLimiteLabel(lista.length);
  if(sub) sub.textContent = limiteAtingido
    ? 'Capacidade maxima de usuarios alcancada para o plano atual.'
    : (empresaData ? `${empresaData.nome} - controle de acessos` : 'controle de acessos da empresa');
  novoUsuarioBtn?.toggleAttribute('disabled', limiteAtingido);

  if(!podeAdministrarUsuarios()){
    grid.innerHTML = '<div class="usuarios-empty">Somente diretores/gestores podem acessar o controle de usuarios.</div>';
    return;
  }

  if(!lista.length){
    grid.innerHTML = '<div class="usuarios-empty">Nenhum usuario vinculado a esta empresa ainda.</div>';
    return;
  }

  grid.innerHTML = lista.map(u=>`
    <div class="usuario-card">
      <div class="usuario-card-head">
        <div>
          <div class="usuario-nome">${escapeHtml(u.nome || u.email || 'Usuario')}</div>
          <div class="usuario-email">${escapeHtml(u.email || '-')}</div>
        </div>
        <div class="usuario-cargo">${escapeHtml(cargoLabel(u.cargo))}</div>
      </div>
      <div class="usuario-meta">
        <span>${escapeHtml(usuarioStatusLabel(u.status))}</span>
        <span>Criado em ${escapeHtml(usuarioCriadoEmLabel(u.criadoEm))}</span>
      </div>
      <div class="usuario-actions">
        <button class="btn-sm" type="button" data-edit-user="${escapeHtml(u.uid)}">Editar</button>
        ${u.uid === currentUser?.uid
          ? '<span class="usuario-self">Usuario atual</span>'
          : `<button class="btn-sm danger" type="button" data-remove-user="${escapeHtml(u.uid)}">Remover</button>`}
      </div>
    </div>
  `).join('');
}

function abrirUsuarioModal(){
  if(!podeAdministrarUsuarios() || !usuarioModal || !usuarioForm) return;
  if(limiteUsuariosAtingido()){
    alert('Capacidade maxima de usuarios alcancada para o plano atual.');
    return;
  }
  usuarioEditandoUid = null;
  usuarioForm.reset();
  if(usuarioModalTitle) usuarioModalTitle.textContent = 'Novo Usuario';
  if(usuarioSubmitBtn) usuarioSubmitBtn.innerHTML = '<i class="ph ph-check"></i> Criar usuario';
  if(usuarioEmailInput) usuarioEmailInput.readOnly = false;
  if(usuarioSenhaInput) usuarioSenhaInput.required = true;
  if(usuarioSenhaField) usuarioSenhaField.style.display = '';
  if(usuarioStatusField) usuarioStatusField.style.display = 'none';
  if(usuarioStatusInput) usuarioStatusInput.value = 'ativo';
  const empresaLabel = document.getElementById('usuarioEmpresaLabel');
  if(empresaLabel) empresaLabel.value = `${empresaData?.nome || 'Empresa'} - ${empresaToken || '-'}`;
  usuarioFormMsg.textContent = '';
  usuarioFormMsg.className = 'form-msg';
  usuarioModal.classList.add('active');
  usuarioModal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('usuarioNome')?.focus(), 30);
}

function abrirEditarUsuario(uid){
  if(!podeAdministrarUsuarios() || !usuarioModal || !usuarioForm) return;
  const usuario = USUARIOS_EMPRESA.find(u=>u.uid === uid);
  if(!usuario) return;
  usuarioEditandoUid = uid;
  usuarioForm.reset();
  if(usuarioModalTitle) usuarioModalTitle.textContent = 'Editar Usuario';
  if(usuarioSubmitBtn) usuarioSubmitBtn.innerHTML = '<i class="ph ph-check"></i> Salvar usuario';
  document.getElementById('usuarioNome').value = usuario.nome || '';
  document.getElementById('usuarioCargo').value = usuario.cargo || 'operadores';
  if(usuarioEmailInput){
    usuarioEmailInput.value = usuario.email || '';
    usuarioEmailInput.readOnly = true;
  }
  if(usuarioSenhaInput){
    usuarioSenhaInput.value = '';
    usuarioSenhaInput.required = false;
  }
  if(usuarioSenhaField) usuarioSenhaField.style.display = 'none';
  if(usuarioStatusField) usuarioStatusField.style.display = '';
  if(usuarioStatusInput) usuarioStatusInput.value = usuario.status || 'ativo';
  const empresaLabel = document.getElementById('usuarioEmpresaLabel');
  if(empresaLabel) empresaLabel.value = `${empresaData?.nome || 'Empresa'} - ${empresaToken || '-'}`;
  usuarioFormMsg.textContent = '';
  usuarioFormMsg.className = 'form-msg';
  usuarioModal.classList.add('active');
  usuarioModal.setAttribute('aria-hidden','false');
  setTimeout(()=>document.getElementById('usuarioNome')?.focus(), 30);
}

function fecharModalUsuario(){
  if(!usuarioModal) return;
  usuarioModal.classList.remove('active');
  usuarioModal.setAttribute('aria-hidden','true');
  usuarioEditandoUid = null;
}

novoUsuarioBtn?.addEventListener('click', abrirUsuarioModal);
fecharUsuarioModal?.addEventListener('click', fecharModalUsuario);
cancelarUsuario?.addEventListener('click', fecharModalUsuario);
usuarioModal?.addEventListener('click', e=>{ if(e.target === usuarioModal) fecharModalUsuario(); });

async function removerUsuario(uid){
  if(!podeAdministrarUsuarios()) return;
  if(uid === currentUser?.uid){
    alert('Voce nao pode remover o proprio usuario logado.');
    return;
  }
  const usuario = USUARIOS_EMPRESA.find(u=>u.uid === uid);
  if(!usuario) return;
  if(usuarioEhAdministrador(usuario.cargo) && (usuario.status || 'ativo') === 'ativo' && totalAdminsAtivos() <= 1){
    alert('Nao e possivel remover o ultimo gestor ativo da empresa.');
    return;
  }
  const label = usuario.nome || usuario.email || 'este usuario';
  const confirmar = confirm(`Remover ${label}? O acesso ao sistema sera bloqueado e a acao sera registrada em auditoria.`);
  if(!confirmar) return;
  if(typeof firebaseRemoverUsuarioEmpresa !== 'function'){
    alert('Firebase ainda nao esta pronto para remover usuarios.');
    return;
  }
  try{
    await firebaseRemoverUsuarioEmpresa(uid, usuario);
  }catch(err){
    console.error(err);
    alert(err.message || 'Nao foi possivel remover o usuario.');
  }
}

document.getElementById('usuariosGrid')?.addEventListener('click', e=>{
  const editBtn = e.target.closest('[data-edit-user]');
  if(editBtn){
    abrirEditarUsuario(editBtn.dataset.editUser);
    return;
  }
  const removeBtn = e.target.closest('[data-remove-user]');
  if(removeBtn) removerUsuario(removeBtn.dataset.removeUser);
});

document.querySelectorAll('[data-usuarios-tab]').forEach(btn=>{
  btn.addEventListener('click', ()=>setUsuariosTab(btn.dataset.usuariosTab));
});

usuarioForm?.addEventListener('submit', async e=>{
  e.preventDefault();
  if(!podeAdministrarUsuarios()) return;
  if(usuarioEditandoUid){
    if(typeof firebaseEditarUsuarioEmpresa !== 'function'){
      usuarioFormMsg.textContent = 'Firebase ainda nao esta pronto para editar usuarios.';
      usuarioFormMsg.className = 'form-msg error';
      return;
    }
    const usuarioAtual = USUARIOS_EMPRESA.find(u=>u.uid === usuarioEditandoUid);
    if(!usuarioAtual) return;
    const form = new FormData(usuarioForm);
    const usuarioEditado = {
      uid: usuarioEditandoUid,
      nome: String(form.get('nome') || '').trim(),
      cargo: String(form.get('cargo') || 'operadores'),
      status: String(form.get('status') || 'ativo'),
    };
    if(!usuarioEditado.nome){
      usuarioFormMsg.textContent = 'Informe o nome completo.';
      usuarioFormMsg.className = 'form-msg error';
      return;
    }
    const afetaAdmin = usuarioEhAdministrador(usuarioAtual.cargo) && (!usuarioEhAdministrador(usuarioEditado.cargo) || usuarioEditado.status !== 'ativo');
    if(afetaAdmin && totalAdminsAtivos() <= 1){
      usuarioFormMsg.textContent = 'Nao e possivel remover o ultimo gestor ativo da empresa.';
      usuarioFormMsg.className = 'form-msg error';
      return;
    }
    if(usuarioEditandoUid === currentUser?.uid && (!usuarioEhAdministrador(usuarioEditado.cargo) || usuarioEditado.status !== 'ativo')){
      usuarioFormMsg.textContent = 'Voce nao pode retirar seu proprio acesso de gestor.';
      usuarioFormMsg.className = 'form-msg error';
      return;
    }
    if((usuarioAtual.cargo !== usuarioEditado.cargo || usuarioAtual.status !== usuarioEditado.status) && !confirm('Confirmar alteracao de cargo/status deste usuario?')){
      return;
    }
    try{
      usuarioFormMsg.textContent = 'Salvando usuario...';
      usuarioFormMsg.className = 'form-msg';
      await firebaseEditarUsuarioEmpresa(usuarioEditado, usuarioAtual);
      usuarioFormMsg.textContent = 'Usuario atualizado.';
      usuarioFormMsg.className = 'form-msg success';
      setTimeout(fecharModalUsuario, 700);
    }catch(err){
      console.error(err);
      usuarioFormMsg.textContent = err.message || 'Nao foi possivel editar o usuario.';
      usuarioFormMsg.className = 'form-msg error';
    }
    return;
  }
  if(limiteUsuariosAtingido()){
    usuarioFormMsg.textContent = 'Capacidade maxima de usuarios alcancada para o plano atual.';
    usuarioFormMsg.className = 'form-msg error';
    return;
  }
  if(typeof firebaseCriarUsuarioEmpresa !== 'function'){
    usuarioFormMsg.textContent = 'Firebase ainda nao esta pronto para criar usuarios.';
    usuarioFormMsg.className = 'form-msg error';
    return;
  }

  const form = new FormData(usuarioForm);
  const novoUsuario = {
    nome: String(form.get('nome') || '').trim(),
    email: String(form.get('email') || '').trim(),
    senha: String(form.get('senha') || ''),
    cargo: String(form.get('cargo') || 'operadores'),
  };

  if(!novoUsuario.nome || !novoUsuario.email || novoUsuario.senha.length < 6){
    usuarioFormMsg.textContent = 'Informe nome, e-mail e senha com pelo menos 6 caracteres.';
    usuarioFormMsg.className = 'form-msg error';
    return;
  }

  try{
    usuarioFormMsg.textContent = 'Criando usuario...';
    usuarioFormMsg.className = 'form-msg';
    await firebaseCriarUsuarioEmpresa(novoUsuario);
    usuarioFormMsg.textContent = 'Usuario criado e vinculado a empresa.';
    usuarioFormMsg.className = 'form-msg success';
    setTimeout(fecharModalUsuario, 700);
  }catch(err){
    console.error(err);
    usuarioFormMsg.textContent = err.code === 'auth/email-already-in-use'
      ? 'Este e-mail ja esta cadastrado.'
      : (err.message || 'Nao foi possivel criar o usuario.');
    usuarioFormMsg.className = 'form-msg error';
  }
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
function statusLabel(status){ return {operando:'Operando',setup:'Setup',parada:'Parada',livre:'Livre',checklist:'Checklist'}[status] || status || '-'; }

let maquina3DAnim=null;

function canvasMaquinaSetup(canvas){
  const rect=canvas.getBoundingClientRect();
  const ratio=window.devicePixelRatio || 1;
  canvas.width=Math.max(1, Math.floor(rect.width * ratio));
  canvas.height=Math.max(1, Math.floor(rect.height * ratio));
  const c=canvas.getContext('2d');
  c.setTransform(ratio,0,0,ratio,0,0);
  return {c,w:rect.width,h:rect.height};
}

function projetarPonto3D(p, ang, escala, cx, cy, flutuar){
  const ca=Math.cos(ang), sa=Math.sin(ang);
  const x=p.x*ca - p.z*sa;
  const z=p.x*sa + p.z*ca;
  const y=p.y;
  const persp=1/(1 + (z + 260)/720);
  return { x:cx + x*escala*persp, y:cy + flutuar + y*escala*persp, z, persp };
}

function luminanciaFace(face){
  const a=face[0], b=face[1], c=face[2];
  const ux=b.x-a.x, uy=b.y-a.y, uz=b.z-a.z;
  const vx=c.x-a.x, vy=c.y-a.y, vz=c.z-a.z;
  const nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx;
  const len=Math.hypot(nx,ny,nz) || 1;
  return Math.max(.28, Math.min(1, .55 + (nx*.28 - ny*.42 + nz*.62)/len*.45));
}

function corFace(base, luz, alpha=.98){
  const hex=base.replace('#','');
  const r=parseInt(hex.slice(0,2),16), g=parseInt(hex.slice(2,4),16), b=parseInt(hex.slice(4,6),16);
  return `rgba(${Math.round(r*luz)},${Math.round(g*luz)},${Math.round(b*luz)},${alpha})`;
}

function cubo3D(cx,cy,cz,w,h,d,base){
  const x=w/2, y=h/2, z=d/2;
  const p=[
    {x:cx-x,y:cy-y,z:cz-z},{x:cx+x,y:cy-y,z:cz-z},{x:cx+x,y:cy+y,z:cz-z},{x:cx-x,y:cy+y,z:cz-z},
    {x:cx-x,y:cy-y,z:cz+z},{x:cx+x,y:cy-y,z:cz+z},{x:cx+x,y:cy+y,z:cz+z},{x:cx-x,y:cy+y,z:cz+z}
  ];
  return [
    {pts:[p[0],p[1],p[2],p[3]],base}, {pts:[p[4],p[5],p[6],p[7]],base},
    {pts:[p[0],p[4],p[7],p[3]],base}, {pts:[p[1],p[5],p[6],p[2]],base},
    {pts:[p[0],p[1],p[5],p[4]],base}, {pts:[p[3],p[2],p[6],p[7]],base}
  ];
}

function desenharPoligono(c, pontos, fill, stroke){
  c.beginPath();
  pontos.forEach((p,i)=> i ? c.lineTo(p.x,p.y) : c.moveTo(p.x,p.y));
  c.closePath();
  c.fillStyle=fill;
  c.fill();
  c.strokeStyle=stroke;
  c.lineWidth=1;
  c.stroke();
}

function setorVisualMaquina(maq){
  const setor=String(maq.setor || '').toLowerCase();
  if(setor === 'injecao') return {id:'usinagem', nome:'Usinagem CNC'};
  if(setor === 'acabamento') return {id:'solda', nome:'Celula de Solda'};
  if(setor === 'montagem') return {id:'pintura', nome:'Cabine de Pintura'};
  if(setor === 'expedicao') return {id:'expedicao', nome:'Doca de Expedicao'};
  return {id:'usinagem', nome:maq.tipo || 'Maquina Industrial'};
}

function modeloPartes3D(modelo){
  const base='#1e4b43', base2='#32675e', escuro='#15342f', metal='#425c58', amarelo='#8b6f22', roxo='#3b335f';
  if(modelo.id === 'solda'){
    return [
      ...cubo3D(0,38,0,220,34,122,escuro),
      ...cubo3D(-78,4,0,46,92,56,base),
      ...cubo3D(-34,-42,0,86,24,40,base2),
      ...cubo3D(22,-82,0,78,22,34,base2),
      ...cubo3D(72,-55,0,24,74,24,metal),
      ...cubo3D(96,-12,0,42,18,22,amarelo),
      ...cubo3D(78,22,-48,88,48,12,'#284a44'),
      ...cubo3D(78,22,48,88,48,12,'#284a44')
    ];
  }
  if(modelo.id === 'pintura'){
    return [
      ...cubo3D(0,42,0,230,32,126,escuro),
      ...cubo3D(-78,-20,0,28,118,126,base),
      ...cubo3D(78,-20,0,28,118,126,base),
      ...cubo3D(0,-86,0,184,26,126,base2),
      ...cubo3D(0,-18,-56,150,78,16,'#223f3a'),
      ...cubo3D(-22,-18,0,46,68,38,'#345b55'),
      ...cubo3D(42,-8,0,18,44,18,amarelo),
      ...cubo3D(0,-118,0,78,34,42,metal)
    ];
  }
  if(modelo.id === 'expedicao'){
    return [
      ...cubo3D(0,48,0,250,30,126,escuro),
      ...cubo3D(-74,10,0,68,58,72,base),
      ...cubo3D(22,16,0,98,42,80,base2),
      ...cubo3D(88,-4,0,54,78,64,roxo),
      ...cubo3D(-102,-38,0,44,42,50,amarelo),
      ...cubo3D(-18,-34,0,70,34,46,'#5b4820'),
      ...cubo3D(72,38,-52,132,12,18,metal),
      ...cubo3D(72,38,52,132,12,18,metal)
    ];
  }
  return [
    ...cubo3D(0,8,0,216,74,112,base),
    ...cubo3D(-58,-52,-4,78,58,86,base2),
    ...cubo3D(46,-42,4,64,48,78,base2),
    ...cubo3D(92,-2,0,42,92,54,escuro),
    ...cubo3D(-96,34,0,24,62,120,escuro),
    ...cubo3D(0,46,-52,142,20,18,metal),
    ...cubo3D(0,46,52,142,20,18,metal),
    ...cubo3D(-10,-86,0,34,34,34,amarelo)
  ];
}

function desenharFacesModelo(c,partes,ang,escala,cx,cy,flutuar){
  const faces=[];
  partes.forEach(face=>{
    const pts=face.pts.map(p=>projetarPonto3D(p,ang,escala,cx,cy,flutuar));
    faces.push({pts,base:face.base,depth:pts.reduce((a,p)=>a+p.z,0)/pts.length,light:luminanciaFace(face.pts)});
  });
  faces.sort((a,b)=>b.depth-a.depth).forEach(face=>{
    desenharPoligono(c,face.pts,corFace(face.base,face.light),'rgba(210,245,235,.17)');
  });
}

function linha3D(c,a,b,ang,escala,cx,cy,flutuar,cor,largura=2){
  const p1=projetarPonto3D(a,ang,escala,cx,cy,flutuar);
  const p2=projetarPonto3D(b,ang,escala,cx,cy,flutuar);
  c.strokeStyle=cor; c.lineWidth=largura*escala; c.beginPath(); c.moveTo(p1.x,p1.y); c.lineTo(p2.x,p2.y); c.stroke();
  return [p1,p2];
}

function ponto3D(c,p,ang,escala,cx,cy,flutuar,cor,raio=5){
  const pr=projetarPonto3D(p,ang,escala,cx,cy,flutuar);
  c.fillStyle=cor; c.beginPath(); c.arc(pr.x,pr.y,raio*escala,0,Math.PI*2); c.fill();
  return pr;
}

function desenharDetalhesModelo(c,modelo,maq,ang,escala,cx,cy,flutuar,cor,t){
  if(modelo.id === 'solda'){
    linha3D(c,{x:-76,y:-48,z:0},{x:-22,y:-76,z:0},ang,escala,cx,cy,flutuar,'rgba(190,220,215,.72)',8);
    linha3D(c,{x:-22,y:-76,z:0},{x:44,y:-60,z:0},ang,escala,cx,cy,flutuar,'rgba(190,220,215,.72)',7);
    linha3D(c,{x:44,y:-60,z:0},{x:86,y:-26,z:0},ang,escala,cx,cy,flutuar,'rgba(190,220,215,.72)',5);
    ponto3D(c,{x:86,y:-26,z:0},ang,escala,cx,cy,flutuar,cor,7);
    const brilho=ponto3D(c,{x:104,y:-4,z:0},ang,escala,cx,cy,flutuar,'#ffcf5a',3+Math.sin(t*.014)*1.4);
    c.globalAlpha=.28; c.fillStyle='#ffcf5a'; c.beginPath(); c.arc(brilho.x,brilho.y,18*escala,0,Math.PI*2); c.fill(); c.globalAlpha=1;
    return;
  }
  if(modelo.id === 'pintura'){
    linha3D(c,{x:-34,y:-22,z:-66},{x:-34,y:34,z:-66},ang,escala,cx,cy,flutuar,cor,3);
    linha3D(c,{x:18,y:-22,z:-66},{x:18,y:34,z:-66},ang,escala,cx,cy,flutuar,cor,3);
    for(let i=0;i<4;i++){
      const spray=projetarPonto3D({x:-34+i*18,y:22,z:-72},ang,escala,cx,cy,flutuar);
      c.strokeStyle='rgba(90,180,255,.28)'; c.lineWidth=1; c.beginPath(); c.moveTo(spray.x,spray.y); c.lineTo(spray.x+Math.sin(t*.004+i)*18*escala,spray.y+24*escala); c.stroke();
    }
    return;
  }
  if(modelo.id === 'expedicao'){
    for(let i=0;i<6;i++) ponto3D(c,{x:-28+i*28,y:46,z:-58},ang,escala,cx,cy,flutuar,'rgba(190,220,215,.65)',4);
    linha3D(c,{x:44,y:-38,z:-30},{x:104,y:-38,z:-30},ang,escala,cx,cy,flutuar,cor,3);
    linha3D(c,{x:44,y:-38,z:30},{x:104,y:-38,z:30},ang,escala,cx,cy,flutuar,cor,3);
    ponto3D(c,{x:-112,y:-64,z:0},ang,escala,cx,cy,flutuar,'#d0a32a',5);
    return;
  }
  linha3D(c,{x:-8,y:-118,z:0},{x:-8,y:-62,z:0},ang,escala,cx,cy,flutuar,'rgba(210,230,225,.78)',5);
  ponto3D(c,{x:-8,y:-56,z:0},ang,escala,cx,cy,flutuar,cor,7);
  linha3D(c,{x:-76,y:16,z:-62},{x:76,y:16,z:-62},ang,escala,cx,cy,flutuar,cor,3);
  ponto3D(c,{x:104,y:-68,z:-22},ang,escala,cx,cy,flutuar,cor,5);
}

function desenharMaquinaVoando(c,w,h,maq,t){
  const modelo=setorVisualMaquina(maq);
  const cor=STATUS_COR[maq.status] || '#5A8070';
  const ang=t*.00105;
  const flutuar=Math.sin(t*.0024)*9;
  const escala=Math.min(w/430,h/250,1.12);
  const cx=w*.56, cy=h*.58;

  c.fillStyle='rgba(0,0,0,.30)';
  c.beginPath(); c.ellipse(cx, h*.84, 152*escala, 18*escala, 0, 0, Math.PI*2); c.fill();
  c.strokeStyle='rgba(180,230,215,.12)'; c.lineWidth=1; c.beginPath(); c.ellipse(cx, h*.84, 180*escala, 27*escala, 0, 0, Math.PI*2); c.stroke();

  desenharFacesModelo(c,modeloPartes3D(modelo),ang,escala,cx,cy,flutuar);
  desenharDetalhesModelo(c,modelo,maq,ang,escala,cx,cy,flutuar,cor,t);

  const painel=projetarPonto3D({x:-74,y:-3,z:-62},ang,escala,cx,cy,flutuar);
  c.save(); c.translate(painel.x,painel.y); c.rotate(Math.sin(ang)*.08);
  c.fillStyle='rgba(2,12,10,.82)'; c.strokeStyle=cor; c.lineWidth=2;
  c.fillRect(-25*escala,-17*escala,50*escala,34*escala); c.strokeRect(-25*escala,-17*escala,50*escala,34*escala); c.restore();

  const luz=projetarPonto3D({x:112,y:-49,z:-35},ang,escala,cx,cy,flutuar);
  c.fillStyle=cor; c.beginPath(); c.arc(luz.x,luz.y,5.5*escala,0,Math.PI*2); c.fill();
  c.globalAlpha=.22; c.beginPath(); c.arc(luz.x,luz.y,15*escala,0,Math.PI*2); c.fill(); c.globalAlpha=1;

  const prog=Math.max(.05,Math.min(1,Number(maq.prog || 0)/100));
  const p1=projetarPonto3D({x:-76,y:58,z:-64},ang,escala,cx,cy,flutuar);
  const p2=projetarPonto3D({x:-76 + 152*prog,y:58,z:-64},ang,escala,cx,cy,flutuar);
  c.strokeStyle=cor; c.lineWidth=3; c.beginPath(); c.moveTo(p1.x,p1.y); c.lineTo(p2.x,p2.y); c.stroke();

  c.fillStyle='rgba(212,237,230,.78)'; c.font='700 11px Barlow, system-ui, sans-serif';
  c.fillText(modelo.nome,18,h-18);
}
function renderMaquina3D(maq){
  const canvas=document.getElementById('maquina3dCanvas');
  if(!canvas || !maq) return;
  const cor=STATUS_COR[maq.status] || '#5A8070';
  const nome=document.getElementById('maq3dNome');
  const meta=document.getElementById('maq3dMeta');
  const badge=document.getElementById('maq3dStatus');
  if(nome) nome.textContent=maq.nome || maq.id || '-';
  if(meta) meta.textContent=`${maq.id || '-'} | ${maq.tipo || 'Maquina'} | OP ${maq.ordem || '-'}`;
  if(badge){ badge.textContent=statusLabel(maq.status); badge.style.color=cor; badge.style.borderColor=cor; }

  if(maquina3DAnim) cancelAnimationFrame(maquina3DAnim);
  const frame=(t)=>{
    if(!maquinaModal?.classList.contains('active')) return;
    const {c,w,h}=canvasMaquinaSetup(canvas);
    c.clearRect(0,0,w,h);
    c.fillStyle='rgba(59,143,234,.06)';
    c.beginPath(); c.arc(w*.78,h*.26,58+Math.sin(t*.002)*4,0,Math.PI*2); c.fill();
    desenharMaquinaVoando(c,w,h,maq,t);
    maquina3DAnim=requestAnimationFrame(frame);
  };
  maquina3DAnim=requestAnimationFrame(frame);
}
function abrirMaquinaModal(maquinaId){
  const maq=MAQUINAS.find(m=>m.id===maquinaId); if(!maq || !maquinaModal) return;
  maquinaDetalheAtual=maq;
  const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=v||'-';};
  set('maqDetailNome',`${maq.id} - ${maq.nome}`); set('maqDetailStatus',statusLabel(maq.status)); set('maqDetailOP',maq.ordem); set('maqDetailProduto',maq.produto); set('maqDetailOperador',maq.op); set('maqDetailParada',maq.motivoParada || '-');
  document.getElementById('maqApontarBtn')?.classList.toggle('hidden-by-role', !userPodeApontar);
  document.getElementById('maqChecklistBtn')?.classList.toggle('hidden-by-role', !userPodeApontar);
  document.getElementById('maqEncerrarBtn')?.classList.toggle('hidden-by-role', !userPodeGerir || !maq.ordem || maq.ordem==='-');
  document.getElementById('maqTimelineBtn')?.classList.toggle('hidden-by-role', !maq.ordem || maq.ordem==='-');
  maquinaModal.classList.add('active'); maquinaModal.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>renderMaquina3D(maq));
}
function fecharModalMaquina(){ maquinaModal?.classList.remove('active'); maquinaModal?.setAttribute('aria-hidden','true'); }
fecharMaquinaModal?.addEventListener('click', fecharModalMaquina);
maquinaModal?.addEventListener('click', e=>{ if(e.target===maquinaModal) fecharModalMaquina(); });
document.getElementById('maqApontarBtn')?.addEventListener('click',()=>{ if(maquinaDetalheAtual){ fecharModalMaquina(); abrirApontModal(maquinaDetalheAtual.id); }});
document.getElementById('maqTimelineBtn')?.addEventListener('click',()=>{ if(maquinaDetalheAtual?.ordem) abrirTimeline(maquinaDetalheAtual.ordem); });
document.getElementById('maqEncerrarBtn')?.addEventListener('click',()=>{ if(maquinaDetalheAtual?.ordem) encerrarOP(maquinaDetalheAtual.ordem, maquinaDetalheAtual.id); });
document.getElementById('maqChecklistBtn')?.addEventListener('click',()=>{ if(maquinaDetalheAtual){ fecharModalMaquina(); abrirChecklistModal(maquinaDetalheAtual.id); }});

const checklistModal=document.getElementById('checklistModal');
const checklistForm=document.getElementById('checklistForm');
const checklistFormMsg=document.getElementById('checklistFormMsg');
const checklistCampos=['limpeza','material','ferramenta','primeiraPeca','seguranca'];
const checklistLabels={
  limpeza:'Maquina limpa e area organizada',
  material:'Materia-prima correta',
  ferramenta:'Ferramenta/molde conferido',
  primeiraPeca:'Peca inicial aprovada',
  seguranca:'Seguranca e EPI OK',
};

function checklistItens(formData){
  return checklistCampos.reduce((acc,campo)=>{
    acc[campo]=formData.has(campo);
    return acc;
  }, {});
}

function checklistPendencias(itens){
  return Object.entries(itens)
    .filter(([,ok])=>!ok)
    .map(([campo])=>checklistLabels[campo] || campo);
}

function abrirChecklistModal(maquinaId){
  if(!userPodeApontar || !checklistModal || !checklistForm) return;
  const maq=MAQUINAS.find(m=>m.id===maquinaId);
  if(!maq) return;
  checklistForm.reset();
  document.getElementById('checklistMaquinaId').value=maq.id;
  document.getElementById('checklistOrdemId').value=maq.ordem && maq.ordem !== '-' ? maq.ordem : '';
  document.getElementById('checklistMaquinaNome').value=`${maq.id} - ${maq.nome}`;
  document.getElementById('checklistOrdemLabel').value=maq.ordem && maq.ordem !== '-' ? `${maq.ordem} - ${maq.produto}` : 'Sem OP vinculada';
  if(checklistFormMsg){
    checklistFormMsg.textContent='Confirme os itens antes de salvar o checklist.';
    checklistFormMsg.className='form-msg';
  }
  checklistModal.classList.add('active');
  checklistModal.setAttribute('aria-hidden','false');
}

function fecharModalChecklist(){
  checklistModal?.classList.remove('active');
  checklistModal?.setAttribute('aria-hidden','true');
}

function registrarChecklistLocal(checklist){
  APONTAMENTOS.push({
    ordem: checklist.ordem,
    maquina: checklist.maquina,
    status: 'checklist',
    observacao: checklist.conforme ? 'Checklist conforme' : `Checklist com pendencia: ${checklist.resumoPendencias}`,
    criadoEm: new Date().toISOString(),
  });
}

async function salvarChecklistOperador(e){
  e?.preventDefault();
  if(!userPodeApontar || !checklistForm) return;
  const form=new FormData(checklistForm);
  const itens=checklistItens(form);
  const pendencias=checklistPendencias(itens);
  const naoConformidade=String(form.get('naoConformidade') || '').trim();
  if(pendencias.length && !naoConformidade){
    if(checklistFormMsg){
      checklistFormMsg.textContent='Descreva a nao conformidade antes de salvar.';
      checklistFormMsg.className='form-msg error';
    }
    return;
  }
  const checklist={
    maquina: String(form.get('maquina') || ''),
    ordem: String(form.get('ordem') || ''),
    itens,
    pendencias,
    resumoPendencias: pendencias.join(', '),
    naoConformidade,
    conforme: pendencias.length === 0 && !naoConformidade,
  };
  try{
    if(checklistFormMsg){
      checklistFormMsg.textContent='Salvando checklist...';
      checklistFormMsg.className='form-msg';
    }
    if(typeof firebaseSalvarChecklistOperador === 'function'){
      await firebaseSalvarChecklistOperador(checklist);
    } else {
      registrarChecklistLocal(checklist);
    }
    if(checklistFormMsg){
      checklistFormMsg.textContent='Checklist salvo.';
      checklistFormMsg.className='form-msg success';
    }
    setTimeout(fecharModalChecklist, 500);
  }catch(err){
    console.error(err);
    if(checklistFormMsg){
      checklistFormMsg.textContent='Nao foi possivel salvar o checklist.';
      checklistFormMsg.className='form-msg error';
    }
  }
}

document.getElementById('fecharChecklistModal')?.addEventListener('click', fecharModalChecklist);
document.getElementById('cancelarChecklist')?.addEventListener('click', fecharModalChecklist);
checklistModal?.addEventListener('click', e=>{ if(e.target===checklistModal) fecharModalChecklist(); });
checklistForm?.addEventListener('submit', salvarChecklistOperador);

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
