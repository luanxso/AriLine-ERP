(async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getDatabase, ref, set, push } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
const firebaseConfig = {
  apiKey:            "AIzaSyB4y1rt9_Jynm1M0wO21r-PZPMq5QdxtYY",
  authDomain:        "projeto-integrado-ariline.firebaseapp.com",
  projectId:         "projeto-integrado-ariline",
  storageBucket:     "projeto-integrado-ariline.firebasestorage.app",
  messagingSenderId: "990947686480",
  appId:             "1:990947686480:web:e5707c91aa62a985e9f955",
  databaseURL:       "https://projeto-integrado-ariline-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

/* ── DATASETS ────────────────────────────────────────────── */
const EMPRESAS = {

  'ARL-DIAD-7F3K9': {
    info: {
      nome:   'Plastik Diadema Ltda.',
      setor:  'Plástico e Borracha',
      cidade: 'Diadema, SP',
      oee:    74,
      turno:  'A',
      cor:    '#1A6FD4',
    },
    maquinas: {
      'INJ-01': {nome:'Injetora 01',  setor:'injecao',    status:'operando', tipo:'Injetora 320T',      op:'José S.'},
      'INJ-02': {nome:'Injetora 02',  setor:'injecao',    status:'operando', tipo:'Injetora 250T',      op:'Maria L.'},
      'INJ-03': {nome:'Injetora 03',  setor:'injecao',    status:'parada',   tipo:'Injetora 180T',      op:'—'},
      'INJ-04': {nome:'Injetora 04',  setor:'injecao',    status:'setup',    tipo:'Injetora 400T',      op:'Paulo R.'},
      'ACB-01': {nome:'Acabamento 01',setor:'acabamento', status:'operando', tipo:'Rebarbação',          op:'Ana K.'},
      'ACB-02': {nome:'Acabamento 02',setor:'acabamento', status:'operando', tipo:'Tampografia',         op:'Carlos M.'},
      'MON-01': {nome:'Montagem 01',  setor:'montagem',   status:'operando', tipo:'Bancada manual',     op:'Fernanda T.'},
      'MON-02': {nome:'Montagem 02',  setor:'montagem',   status:'setup',    tipo:'Bancada semi-auto',  op:'Ricardo B.'},
      'EXP-01': {nome:'Expedição',    setor:'expedicao',  status:'operando', tipo:'Doca de saída',      op:'Marcos V.'},
    },
    ordens: {
      'OP-2847': {produto:'Corpo Válvula A3',         maquina:'INJ-01', qty:'5.000 un',  prog:78,  turno:'A', status:'andamento'},
      'OP-2849': {produto:'Tampa CR-12',              maquina:'INJ-02', qty:'12.000 un', prog:45,  turno:'A', status:'andamento'},
      'OP-2851': {produto:'Conector X7',              maquina:'INJ-04', qty:'3.500 un',  prog:0,   turno:'B', status:'setup'},
      'OP-2843': {produto:'Válvula A3 — Acabamento',  maquina:'ACB-01', qty:'4.800 un',  prog:92,  turno:'A', status:'andamento'},
      'OP-2844': {produto:'Tampa CR-12 — Tampografia',maquina:'ACB-02', qty:'11.500 un', prog:60,  turno:'A', status:'andamento'},
      'OP-2840': {produto:'Kit Válvula Completo',      maquina:'MON-01', qty:'2.200 un',  prog:88,  turno:'A', status:'andamento'},
      'OP-2852': {produto:'Kit Conector X7',           maquina:'MON-02', qty:'1.800 un',  prog:0,   turno:'B', status:'setup'},
      'OP-2838': {produto:'Mix paletes — Expedição',   maquina:'EXP-01', qty:'8.400 un',  prog:100, turno:'A', status:'concluido'},
    },
    estoque: {
      'MP-0041': {mat:'Resina PP Natural',    qtd:4200,  min:1000, un:'kg'},
      'MP-0042': {mat:'Resina ABS Preto',     qtd:780,   min:800,  un:'kg'},
      'MP-0089': {mat:'Pigmento Azul',        qtd:45,    min:50,   un:'kg'},
      'MP-0120': {mat:'Insert Metálico M6',   qtd:12500, min:2000, un:'un'},
      'MP-0200': {mat:'Embalagem Caixa P',    qtd:3200,  min:500,  un:'un'},
      'MP-0201': {mat:'Etiqueta Rastreio',    qtd:890,   min:1000, un:'un'},
      'MP-0055': {mat:'Aditivo Desmoldante',  qtd:22,    min:30,   un:'L'},
    },
  },

  'ARL-SBC-2M8QR': {
    info: {
      nome:   'MetalParts S. Bernardo',
      setor:  'Metal-mecânica',
      cidade: 'S. Bernardo do Campo, SP',
      oee:    81,
      turno:  'B',
      cor:    '#1DB954',
    },
    maquinas: {
      'USI-01': {nome:'Centro Usinage 01', setor:'injecao',    status:'operando', tipo:'CNC Mazak 5x',       op:'Rodrigo A.'},
      'USI-02': {nome:'Centro Usinage 02', setor:'injecao',    status:'operando', tipo:'CNC Romi D600',      op:'Claudia B.'},
      'USI-03': {nome:'Torno CNC',         setor:'injecao',    status:'setup',    tipo:'Torno Romi i30',     op:'Leandro F.'},
      'SOL-01': {nome:'Célula Solda 01',   setor:'acabamento', status:'operando', tipo:'Solda MIG robótica', op:'Tatiane M.'},
      'SOL-02': {nome:'Célula Solda 02',   setor:'acabamento', status:'operando', tipo:'Solda TIG manual',   op:'Fábio N.'},
      'PIN-01': {nome:'Cabine Pintura 01', setor:'montagem',   status:'operando', tipo:'Pintura epóxi auto', op:'Sandra K.'},
      'PIN-02': {nome:'Cabine Pintura 02', setor:'montagem',   status:'parada',   tipo:'Pintura líquida',    op:'—'},
      'EXP-01': {nome:'Expedição',         setor:'expedicao',  status:'operando', tipo:'Doca B',             op:'Gilson P.'},
    },
    ordens: {
      'MP-1102': {produto:'Flange DN80',        maquina:'USI-01', qty:'320 un',   prog:65,  turno:'B', status:'andamento'},
      'MP-1103': {produto:'Estrutura Base',      maquina:'SOL-01', qty:'80 un',    prog:88,  turno:'B', status:'andamento'},
      'MP-1104': {produto:'Eixo Transmissão',    maquina:'USI-02', qty:'150 un',   prog:42,  turno:'B', status:'andamento'},
      'MP-1105': {produto:'Suporte L-40',        maquina:'SOL-02', qty:'240 un',   prog:55,  turno:'B', status:'andamento'},
      'MP-1106': {produto:'Estrutura — Pintura', maquina:'PIN-01', qty:'80 un',    prog:72,  turno:'B', status:'andamento'},
      'MP-1108': {produto:'Pino Guia 12mm',      maquina:'USI-03', qty:'500 un',   prog:0,   turno:'B', status:'setup'},
      'MP-1100': {produto:'Lote fora — Exp.',    maquina:'EXP-01', qty:'1.200 un', prog:100, turno:'A', status:'concluido'},
    },
    estoque: {
      'MP-3010': {mat:'Barra Aço 1020 Ø50',    qtd:680,  min:200,  un:'m'},
      'MP-3011': {mat:'Barra Aço Inox 316',     qtd:95,   min:100,  un:'m'},
      'MP-3020': {mat:'Chapa SAE 1020 3mm',     qtd:2400, min:500,  un:'kg'},
      'MP-3050': {mat:'Arame Solda MIG',         qtd:42,   min:20,   un:'kg'},
      'MP-3051': {mat:'Gás Argônio',             qtd:3,    min:5,    un:'cil'},
      'MP-3060': {mat:'Tinta Epóxi Industrial',  qtd:180,  min:50,   un:'L'},
      'MP-3090': {mat:'Parafuso M10x30',         qtd:8200, min:1000, un:'un'},
    },
  },

  'ARL-MAUA-5P1XZ': {
    info: {
      nome:   'AlimFlex Mauá',
      setor:  'Alimentos e Bebidas',
      cidade: 'Mauá, SP',
      oee:    68,
      turno:  'A',
      cor:    '#C99A1A',
    },
    maquinas: {
      'MIS-01': {nome:'Misturador A',    setor:'injecao',    status:'operando', tipo:'Misturador 800L',    op:'Beatriz C.'},
      'MIS-02': {nome:'Misturador B',    setor:'injecao',    status:'parada',   tipo:'Misturador 400L',    op:'—'},
      'ENV-01': {nome:'Envasadora 01',   setor:'acabamento', status:'operando', tipo:'Envasadora assép.',  op:'Thiago M.'},
      'ENV-02': {nome:'Envasadora 02',   setor:'acabamento', status:'operando', tipo:'Envasadora PET',     op:'Camila R.'},
      'ENV-03': {nome:'Envasadora 03',   setor:'acabamento', status:'setup',    tipo:'Envasadora vidro',   op:'Denis O.'},
      'ROT-01': {nome:'Rotulagem 01',    setor:'montagem',   status:'operando', tipo:'Rotuladora auto',    op:'Priscila V.'},
      'ROT-02': {nome:'Rotulagem 02',    setor:'montagem',   status:'parada',   tipo:'Rotuladora semi',    op:'—'},
      'EXP-01': {nome:'Expedição/Frio',  setor:'expedicao',  status:'operando', tipo:'Câmara + doca',      op:'Wagner L.'},
    },
    ordens: {
      'AF-0391': {produto:'Mix Granola Premium',    maquina:'MIS-01', qty:'4.800 kg',  prog:55,  turno:'A', status:'andamento'},
      'AF-0392': {produto:'Iogurte Natural 1kg',    maquina:'ENV-01', qty:'18.000 un', prog:80,  turno:'A', status:'andamento'},
      'AF-0393': {produto:'Suco Uva 1L',            maquina:'ENV-02', qty:'9.600 un',  prog:33,  turno:'A', status:'andamento'},
      'AF-0394': {produto:'Iogurte — Rotulagem',    maquina:'ROT-01', qty:'17.500 un', prog:76,  turno:'A', status:'andamento'},
      'AF-0395': {produto:'Molho Tomate 500g',      maquina:'ENV-03', qty:'12.000 un', prog:0,   turno:'B', status:'setup'},
      'AF-0396': {produto:'Molho Tomate — Rotul.',  maquina:'ROT-02', qty:'12.000 un', prog:0,   turno:'B', status:'setup'},
      'AF-0388': {produto:'Lote câmara fria',       maquina:'EXP-01', qty:'22.400 un', prog:100, turno:'A', status:'concluido'},
    },
    estoque: {
      'AL-1001': {mat:'Aveia em Flocos',        qtd:3200,  min:800,  un:'kg'},
      'AL-1002': {mat:'Mel Natural',             qtd:180,   min:200,  un:'kg'},
      'AL-1010': {mat:'Leite UHT',               qtd:12000, min:3000, un:'L'},
      'AL-1020': {mat:'Suco Uva Concentrado',    qtd:420,   min:500,  un:'L'},
      'AL-2001': {mat:'Embalagem PET 1L',        qtd:8500,  min:2000, un:'un'},
      'AL-2002': {mat:'Tampa Rosca 28mm',         qtd:7800,  min:2000, un:'un'},
      'AL-2010': {mat:'Rótulo Iogurte 1kg',       qtd:15000, min:5000, un:'un'},
    },
  },
};

/* ── LOGGER ── */
const logBody  = document.getElementById('logBody');
const progFill = document.getElementById('progFill');
const progLabel= document.getElementById('progLabel');

function ts(){
  return new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function log(msg, type='info'){
  const line = document.createElement('div');
  line.className='log-line';
  line.innerHTML=`<span class="log-ts">${ts()}</span><span class="log-${type}">${msg}</span>`;
  logBody.appendChild(line);
  logBody.scrollTop=logBody.scrollHeight;
}
function setProgress(pct, label){
  progFill.style.width=pct+'%';
  progLabel.textContent=label;
}

/* ── SEED ── */
window.seedAll = async function(){
  const btn=document.getElementById('btnSeed');
  btn.disabled=true; btn.textContent='Gravando...';
  logBody.innerHTML='';

  const tokens = Object.keys(EMPRESAS);
  const total  = tokens.reduce((acc,t)=>{
    const e=EMPRESAS[t];
    return acc + 1 + Object.keys(e.maquinas).length
                   + Object.keys(e.ordens).length
                   + Object.keys(e.estoque).length;
  },0);
  let done=0;

  for(const token of tokens){
    const emp=EMPRESAS[token];
    log(`━━ Empresa: ${emp.info.nome} [${token}]`, 'info');

    /* info */
    try{
      await set(ref(db, `empresas/${token}/info`), emp.info);
      done++; setProgress(Math.round(done/total*100), `${done}/${total} gravações`);
      log(`  ✓ info gravado`, 'ok');
    }catch(e){ log(`  ✗ info: ${e.message}`,'err'); }

    /* maquinas */
    for(const [id,maq] of Object.entries(emp.maquinas)){
      try{
        await set(ref(db, `empresas/${token}/maquinas/${id}`), {id, ...maq});
        done++; setProgress(Math.round(done/total*100), `${done}/${total} gravações`);
        log(`  ✓ maquina ${id} — ${maq.nome}`, 'ok');
      }catch(e){ log(`  ✗ maquina ${id}: ${e.message}`,'err'); }
    }

    /* ordens */
    for(const [id,op] of Object.entries(emp.ordens)){
      try{
        await set(ref(db, `empresas/${token}/ordens/${id}`), {id, ...op});
        done++; setProgress(Math.round(done/total*100), `${done}/${total} gravações`);
        log(`  ✓ ordem ${id} — ${op.produto}`, 'ok');
      }catch(e){ log(`  ✗ ordem ${id}: ${e.message}`,'err'); }
    }

    /* estoque */
    for(const [id,item] of Object.entries(emp.estoque)){
      try{
        await set(ref(db, `empresas/${token}/estoque/${id}`), {id, ...item});
        done++; setProgress(Math.round(done/total*100), `${done}/${total} gravações`);
        log(`  ✓ estoque ${id} — ${item.mat}`, 'ok');
      }catch(e){ log(`  ✗ estoque ${id}: ${e.message}`,'err'); }
    }

    log(`  ✓ ${emp.info.nome} completo`, 'ok');
  }

  setProgress(100,'Concluído');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log(`✓ Banco populado — ${done} registros gravados`, 'ok');

  btn.textContent='✓ Concluído';
  btn.style.background='var(--surf2)';
  btn.style.color='var(--green)';
  document.getElementById('doneBanner').style.display='block';
};

})().catch((error) => console.error('Erro ao carregar modulo:', error));
