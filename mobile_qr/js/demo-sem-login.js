/*
  Demo sem login para QR Code.
  Usa os dados mockados do sistema.js e simula o Firebase no navegador.
*/
(function(){
  const TOKEN_DEMO = 'ARL-DIAD-7F3K9';
  const EMPRESA_DEMO = { nome:'Plastik Diadema Ltda.', setor:'Plástico e Borracha' };

  function toAtivas(ordens){
    return (ordens || []).filter(o => o.status !== 'concluido' && o.status !== 'cancelada');
  }

  function normalizarDemo(data){
    const ordensAtivas = toAtivas(data.ordens).map(o => ({
      ...o,
      produto: o.produto || o.prod || '',
      maquina: o.maquina || o.maq || ''
    }));

    const maquinas = (data.maquinas || []).map(m => {
      const opAtual = ordensAtivas.find(o => o.maquina === m.id || o.maq === m.id);
      return {
        ...m,
        status: m.status || (opAtual ? opAtual.status : 'parada'),
        ordem: opAtual?.id || m.ordem || '-',
        produto: opAtual?.produto || opAtual?.prod || m.produto || '-',
        prog: Number(opAtual?.prog ?? m.prog ?? 0)
      };
    });

    return {
      info: {
        ...data.kpi,
        oee: data.kpi?.oee || 0,
        barChart: data.barChart || []
      },
      maquinas,
      ordensAtivas,
      estoque: data.estoque || [],
      apontamentos: [],
      expedicoes: data.expedicoes || [
        { id:'EXP-DEMO-001', codigo:'EXP-DEMO-001', destino:'Cliente ABC - São Paulo', produto:'Mix paletes acabado', quantidade:12, unidade:'paletes', transportadora:'Retira cliente', previsao:new Date().toISOString().slice(0,10), opRef:'Lote A12', status:'separacao' },
        { id:'EXP-DEMO-002', codigo:'EXP-DEMO-002', destino:'CD Campinas', produto:'Tampa CR-12', quantidade:320, unidade:'cx', transportadora:'Rápido Sudeste', previsao:new Date().toISOString().slice(0,10), opRef:'Sem vínculo', status:'pronto' }
      ]
    };
  }

  function atualizarTelaDemo(){
    const op = MAQUINAS.filter(m => m.status === 'operando').length;
    const setup = MAQUINAS.filter(m => m.status === 'setup').length;
    const par = MAQUINAS.filter(m => m.status === 'parada').length;
    const producao = ORDENS.reduce((acc,o) => acc + Number(String(o.qty).replace(/[^0-9]/g,'') || 0), 0);

    document.getElementById('empNome').textContent = EMPRESA_DEMO.nome;
    document.getElementById('empToken').textContent = TOKEN_DEMO;
    document.getElementById('dash-sub').textContent = `${EMPRESA_DEMO.nome} - modo demonstração`;
    document.getElementById('ordens-sub').textContent = `${EMPRESA_DEMO.nome} - ${ORDENS.length} ordens ativas`;
    document.getElementById('kpi-oee').textContent = EMPRESA_DATA[TOKEN_DEMO].kpi.oee;
    document.getElementById('kpi-ordens').textContent = ORDENS.length;
    document.getElementById('kpi-prod').textContent = producao ? producao.toLocaleString('pt-BR') : '-';
    document.getElementById('kpi-maq').textContent = `${op}/${MAQUINAS.length}`;
    document.getElementById('kpi-oee-d').textContent = 'modo demo';
    document.getElementById('kpi-prod-d').textContent = 'OPs ativas';
    document.getElementById('kpi-maq-d').textContent = `${op} operando agora`;
    document.getElementById('kpi-oee-d').className = 'kpi-delta up';
    document.getElementById('kpi-prod-d').className = 'kpi-delta up';
    document.getElementById('ordBadge').textContent = ORDENS.length;

    const opEl = document.querySelector('[data-cnt="op"]');
    const setupEl = document.querySelector('[data-cnt="setup"]');
    const parEl = document.querySelector('[data-cnt="par"]');
    if(opEl) opEl.textContent = op;
    if(setupEl) setupEl.textContent = setup;
    if(parEl) parEl.textContent = par;

    document.querySelectorAll('.setor-chip').forEach(chip => {
      const setor = chip.dataset.setor;
      const count = setor === 'all' ? MAQUINAS.length : MAQUINAS.filter(m => m.setor === setor).length;
      const el = chip.querySelector('.setor-count');
      if(el) el.textContent = count;
    });

    renderOrdens();
    renderEstoque();
    renderMobileExpedicao();
    renderBarChart(EMPRESA_DATA[TOKEN_DEMO].barChart);
    renderAlertas();
    preencherMaquinasOP();
    if(ctx) drawMapa();
  }

  function tocarMapaMobile(){
    const canvas = document.getElementById('plantaCanvas');
    if(!canvas) return;
    let lastTap = 0;
    canvas.addEventListener('touchstart', (ev) => {
      if(!ev.touches || ev.touches.length !== 1) return;
      const now = Date.now();
      const touch = ev.touches[0];
      const r = canvas.getBoundingClientRect();
      const mx = touch.clientX - r.left;
      const my = touch.clientY - r.top;
      const m = getMaquinaAt(mx,my);
      if(m && now - lastTap > 250) {
        ev.preventDefault();
        abrirMaquinaModal(m.id);
      }
      lastTap = now;
    }, {passive:false});
  }

  function atualizarLabelsEstoqueMobile(){
    const labels = ['Material','Código','Qtd. atual','Mínimo','Nível','Status'];
    document.querySelectorAll('#estoqueBody tr').forEach(tr => {
      tr.querySelectorAll('td').forEach((td, i) => td.setAttribute('data-label', labels[i] || ''));
    });
  }

  const originalRenderEstoque = window.renderEstoque || renderEstoque;
  window.renderEstoque = function(){
    originalRenderEstoque();
    atualizarLabelsEstoqueMobile();
  };

  window.sair = function(){
    alert('Este é o modo demonstração para a apresentação. Não existe login nesta versão.');
  };
  window.abrirPerfil = function(){
    alert('Usuário demo: Visitante da apresentação. Permissão: Supervisor.');
  };
  window.abrirDownload = function(){
    alert('Esta versão foi feita para abrir pelo QR Code no navegador.');
  };

  document.addEventListener('DOMContentLoaded', () => {
    const base = EMPRESA_DATA[TOKEN_DEMO];
    const dados = normalizarDemo(base);
    dados.expedicoes = (dados.expedicoes || []).map((expedicao, index) => {
      if(Number.isFinite(Number(expedicao.quantidadeConferida))) return expedicao;
      const quantidade = Number(expedicao.quantidade || 0);
      const quantidadeConferida = index === 1 ? Math.max(0, quantidade - 2) : quantidade;
      return {
        ...expedicao,
        quantidadeConferida,
        divergencia: quantidadeConferida !== quantidade,
        status: expedicao.status === 'separacao' ? 'pronto' : expedicao.status
      };
    });

    MAQUINAS = dados.maquinas;
    ORDENS = dados.ordensAtivas;
    ESTOQUE = dados.estoque;
    APONTAMENTOS = dados.apontamentos;
    EXPEDICOES = dados.expedicoes;
    empresaData = EMPRESA_DEMO;
    empresaToken = TOKEN_DEMO;
    currentUser = { uid:'demo' };
    currentUserName = 'Visitante Demo';
    userCargo = 'supervisores';
    userPodeGerir = true;
    userPodeApontar = true;

    firebaseSalvarOP = async function(op){
      const nova = {
        id: op.id,
        prod: op.produto,
        produto: op.produto,
        status: op.status,
        prog: Number(op.prog || 0),
        maq: op.maquina,
        maquina: op.maquina,
        qty: op.qty,
        turno: op.turno || 'A'
      };
      ORDENS.unshift(nova);
      const maq = MAQUINAS.find(m => m.id === op.maquina);
      if(maq){
        maq.status = op.status === 'setup' ? 'setup' : 'operando';
        maq.ordem = op.id;
        maq.produto = op.produto;
        maq.prog = Number(op.prog || 0);
      }
      atualizarTelaDemo();
    };

    firebaseEncerrarOP = async function(opId, maquinaId){
      ORDENS = ORDENS.filter(o => o.id !== opId);
      const maq = MAQUINAS.find(m => m.id === maquinaId);
      if(maq){
        maq.status = 'livre';
        maq.ordem = '-';
        maq.produto = '-';
        maq.prog = 0;
      }
      APONTAMENTOS.push({ordem:opId, maquina:maquinaId, status:'concluido', observacao:'OP encerrada no modo demo', criadoEm:new Date().toLocaleString('pt-BR')});
      atualizarTelaDemo();
    };

    firebaseSalvarApontamento = async function(ap){
      const maq = MAQUINAS.find(m => m.id === ap.maquina);
      if(maq){
        maq.status = ap.status;
        maq.motivoParada = ap.status === 'parada' ? ap.motivo : '';
        maq.observacaoParada = ap.observacao || '';
      }
      const op = ORDENS.find(o => o.id === ap.ordem);
      if(op){
        op.status = ap.status === 'operando' ? 'andamento' : ap.status;
        if(ap.produzido) op.prog = Math.min(100, Number(op.prog || 0) + 5);
      }
      APONTAMENTOS.push({...ap, criadoEm:new Date().toLocaleString('pt-BR')});
      atualizarTelaDemo();
    };

    firebaseSalvarSolicitacaoCompra = async function(sol){
      alert(`Solicitação demo criada: ${sol.material} - ${sol.quantidade} ${sol.unidade}`);
    };

    aplicarPermissoes();
    atualizarTelaDemo();
    tocarMapaMobile();
    document.getElementById('app').style.display = 'flex';
  });
})();
