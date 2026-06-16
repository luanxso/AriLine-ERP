(async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");  const { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signOut } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");  const { getDatabase, ref, get, onValue, set, update, push, serverTimestamp, query, orderByChild, equalTo, remove } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
  const firebaseConfig = {
    apiKey:            "AIzaSyB4y1rt9_Jynm1M0wO21r-PZPMq5QdxtYY",
    authDomain:        "projeto-integrado-ariline.firebaseapp.com",
    projectId:         "projeto-integrado-ariline",
    storageBucket:     "projeto-integrado-ariline.firebasestorage.app",
    messagingSenderId: "990947686480",
    appId:             "1:990947686480:web:e5707c91aa62a985e9f955",
    databaseURL:       "https://projeto-integrado-ariline-default-rtdb.firebaseio.com",
  };

  const app  = initializeApp(firebaseConfig);
  const secondaryApp = initializeApp(firebaseConfig, 'secondary-user-creator');
  const auth = getAuth(app);
  const secondaryAuth = getAuth(secondaryApp);
  const db   = getDatabase(app);

  const splash = document.getElementById('splash');
  const denied = document.getElementById('denied');
  const appEl  = document.getElementById('app');

  /* empresas mock — em produção viria do Firebase */
  const EMPRESAS_DB = {
    'ARL-DIAD-7F3K9': { nome:'Plastik Diadema Ltda.',   setor:'Plástico e Borracha' },
    'ARL-SBC-2M8QR':  { nome:'MetalParts S. Bernardo',  setor:'Metal-mecânica'      },
    'ARL-MAUA-5P1XZ': { nome:'AlimFlex Mauá',           setor:'Alimentos'           },
  };

  function toArray(obj){ return obj ? Object.entries(obj).map(([id,val])=>({id, ...val})) : []; }
  function isAtiva(op){ return op.status !== 'concluido' && op.status !== 'cancelada'; }
  function podeAdministrarCargo(cargo){ return ['gestores','administradores','admin'].includes(cargo); }
  function podeAdministrarUsuarios(){ return podeAdministrarCargo(userCargo); }
  function planoLimiteUsuarios(plano){
    return { basico: 5, profissional: 20, enterprise: 0 }[plano || 'profissional'] ?? 20;
  }

  function normalizarDados(info, maquinasObj, ordensObj, estoqueObj, apontamentosObj, expedicoesObj){
    const todasOrdens = toArray(ordensObj).map(o=>({
      id: o.id,
      prod: o.prod || o.produto || '',
      produto: o.produto || o.prod || '',
      status: o.status || 'andamento',
      prog: Number(o.prog || 0),
      maq: o.maq || o.maquina || '',
      maquina: o.maquina || o.maq || '',
      qty: o.qty || o.quantidade || '',
      turno: o.turno || '-',
    }));
    const ordensAtivas = todasOrdens.filter(isAtiva);
    const maquinas = toArray(maquinasObj).map(m=>{
      const opAtual = ordensAtivas.find(o=>o.maquina === m.id || o.maq === m.id);
      return {
        id: m.id,
        nome: m.nome || m.id,
        setor: m.setor || 'injecao',
        status: m.status || (opAtual ? opAtual.status : 'parada'),
        ordem: opAtual?.id || m.ordem || '-',
        produto: opAtual?.produto || m.produto || '-',
        prog: Number(opAtual?.prog ?? m.prog ?? 0),
        tipo: m.tipo || 'Maquina',
        op: m.op || '-',
        motivoParada: m.motivoParada || '',
        observacaoParada: m.observacaoParada || '',
        rx: m.rx,
        ry: m.ry,
        posicao: m.posicao,
      };
    });
    const estoque = toArray(estoqueObj).map(e=>({ cod:e.cod || e.id, ...e }));
    const apontamentos = toArray(apontamentosObj);
    const expedicoes = toArray(expedicoesObj).map(e=>({
      id: e.id,
      codigo: e.codigo || e.id,
      destino: e.destino || '',
      produto: e.produto || '',
      quantidade: Number(e.quantidade || 0),
      unidade: e.unidade || 'un',
      transportadora: e.transportadora || '',
      previsao: e.previsao || '',
      opRef: e.opRef || '',
      observacao: e.observacao || '',
      quantidadeConferida: Number.isFinite(Number(e.quantidadeConferida)) ? Number(e.quantidadeConferida) : undefined,
      conferenciaObs: e.conferenciaObs || '',
      conferidoPor: e.conferidoPor || '',
      conferidoPorNome: e.conferidoPorNome || '',
      conferidoEm: e.conferidoEm || '',
      divergencia: e.divergencia === true,
      status: e.status || 'pendente',
      criadoEm: e.criadoEm || '',
      atualizadoEm: e.atualizadoEm || '',
      enviadoEm: e.enviadoEm || '',
      criadoPorNome: e.criadoPorNome || '',
    }));
    return { info: info || {}, maquinas, ordensAtivas, estoque, apontamentos, expedicoes };
  }

  function atualizarTelaComDados(token, empresa, dados){
    MAQUINAS = dados.maquinas;
    ORDENS = dados.ordensAtivas;
    ESTOQUE = dados.estoque;
    APONTAMENTOS = dados.apontamentos || [];
    EXPEDICOES = dados.expedicoes || [];
    empresaData = empresa;
    empresaToken = token;
    aplicarPermissoes();

    document.getElementById('empNome').textContent  = empresa.nome;
    document.getElementById('empToken').textContent = token;
    atualizarUserMenu();

    const op = MAQUINAS.filter(m=>m.status==='operando').length;
    const setup = MAQUINAS.filter(m=>m.status==='setup').length;
    const par = MAQUINAS.filter(m=>m.status==='parada').length;
    const oee = Number(dados.info.oee || 0);
    const producao = ORDENS.reduce((acc,o)=>acc + Number(String(o.qty).replace(/[^0-9]/g,'') || 0), 0);

    document.getElementById('dash-sub').textContent = `${empresa.nome} - turno atual`;
    document.getElementById('ordens-sub').textContent = `${empresa.nome} - ${ORDENS.length} ordens ativas`;
    document.getElementById('kpi-oee').textContent = oee || '-';
    document.getElementById('kpi-ordens').textContent = ORDENS.length;
    document.getElementById('kpi-prod').textContent = producao ? producao.toLocaleString('pt-BR') : '-';
    document.getElementById('kpi-maq').textContent = `${op}/${MAQUINAS.length}`;
    document.getElementById('kpi-oee-d').textContent = 'tempo real';
    document.getElementById('kpi-prod-d').textContent = 'OPs ativas';
    document.getElementById('kpi-maq-d').textContent = `${op} operando agora`;
    document.getElementById('kpi-oee-d').className = 'kpi-delta up';
    document.getElementById('kpi-prod-d').className = 'kpi-delta up';

    document.querySelector('[data-cnt="op"]').textContent = op;
    document.querySelector('[data-cnt="setup"]').textContent = setup;
    document.querySelector('[data-cnt="par"]').textContent = par;
    document.getElementById('ordBadge').textContent = ORDENS.length;

    splash.style.opacity = '0';
    setTimeout(()=>{ splash.style.display='none'; },500);
    appEl.style.display = 'flex';

    renderSidebar();
    renderOrdens();
    renderEstoque();
    renderExpedicao();
    renderBarChart(dados.info.barChart);
    renderDonut();
    renderAlertas();
    preencherMaquinasOP();
    if(ctx) drawMapa();
  }

  function mostrarApp(user, dadosUsuario){
    currentUser = user;
    currentUserName = dadosUsuario.nome || user.email || '-';
    atualizarUserMenu();
    const token = dadosUsuario.tokenEmpresa;
    if(!token){ mostrarNegado(); return; }
    const baseRef = ref(db, `empresas/${token}`);

    firebaseSalvarOP = async (op)=>{
      const path = `empresas/${token}`;
      const statusMaquina = op.status === 'setup' ? 'setup' : 'operando';
      await Promise.all([
        set(ref(db, `${path}/ordens/${op.id}`), {
          id: op.id,
          produto: op.produto,
          maquina: op.maquina,
          qty: op.qty,
          prog: op.prog,
          turno: op.turno,
          status: op.status,
          criadoEm: new Date().toISOString(),
          criadoPor: user.uid,
        }),
        update(ref(db, `${path}/maquinas/${op.maquina}`), {
          status: statusMaquina,
          ordem: op.id,
          produto: op.produto,
          prog: op.prog,
          atualizadoEm: serverTimestamp(),
        })
      ]);
    };

    firebaseEncerrarOP = async (opId, maquinaId)=>{
      const path = `empresas/${token}`;
      const agora = new Date().toISOString();
      await Promise.all([
        update(ref(db, `${path}/ordens/${opId}`), { status:'concluido', prog:100, encerradoEm:agora, encerradoPor:user.uid, atualizadoEm:serverTimestamp() }),
        update(ref(db, `${path}/maquinas/${maquinaId}`), { status:'livre', ordem:'-', produto:'-', prog:0, atualizadoEm:serverTimestamp() }),
        set(push(ref(db, `${path}/apontamentos`)), { ordem:opId, maquina:maquinaId, status:'concluido', observacao:'OP encerrada pelo gestor', criadoEm:agora, criadoPor:user.uid, cargo:userCargo })
      ]);
    };

    firebaseSalvarApontamento = async (apontamento)=>{
      const path = `empresas/${token}`;
      const agora = new Date().toISOString();
      const maquinaUpdate = {
        status: apontamento.status,
        atualizadoEm: serverTimestamp(),
      };
      if(apontamento.status === 'parada'){
        maquinaUpdate.motivoParada = apontamento.motivo;
        maquinaUpdate.observacaoParada = apontamento.observacao || '';
        maquinaUpdate.paradoEm = agora;
      } else {
        maquinaUpdate.motivoParada = '';
        maquinaUpdate.observacaoParada = '';
        maquinaUpdate.paradoEm = null;
      }

      const tarefas = [
        update(ref(db, `${path}/maquinas/${apontamento.maquina}`), maquinaUpdate),
        set(push(ref(db, `${path}/apontamentos`)), {
          ...apontamento,
          criadoEm: agora,
          criadoPor: user.uid,
          cargo: userCargo,
        })
      ];
      if(apontamento.ordem && apontamento.ordem !== '-'){
        tarefas.push(update(ref(db, `${path}/ordens/${apontamento.ordem}`), {
          status: apontamento.status === 'operando' ? 'andamento' : apontamento.status,
          motivoParada: apontamento.status === 'parada' ? apontamento.motivo : '',
          produzidoUltimo: apontamento.produzido || 0,
          refugoUltimo: apontamento.refugo || 0,
          atualizadoEm: serverTimestamp(),
        }));
      }
      await Promise.all(tarefas);
    };

    firebaseSalvarChecklistOperador = async (checklist)=>{
      if(!userPodeApontar){
        throw new Error('Somente operador ou supervisor pode salvar checklist.');
      }
      const path = `empresas/${token}`;
      const agora = new Date().toISOString();
      const payload = {
        maquina: checklist.maquina || '',
        ordem: checklist.ordem || '',
        itens: checklist.itens || {},
        pendencias: checklist.pendencias || [],
        resumoPendencias: checklist.resumoPendencias || '',
        naoConformidade: checklist.naoConformidade || '',
        conforme: checklist.conforme === true,
        criadoEm: agora,
        criadoPor: user.uid,
        criadoPorNome: currentUserName,
        cargo: userCargo,
        atualizadoEm: serverTimestamp(),
      };
      const observacao = payload.conforme
        ? 'Checklist conforme'
        : `Checklist com pendencia: ${payload.naoConformidade || payload.resumoPendencias || 'sem detalhe'}`;
      await Promise.all([
        set(push(ref(db, `${path}/checklistsOperador`)), payload),
        set(push(ref(db, `${path}/apontamentos`)), {
          ordem: payload.ordem,
          maquina: payload.maquina,
          status: 'checklist',
          observacao,
          criadoEm: agora,
          criadoPor: user.uid,
          cargo: userCargo,
        })
      ]);
    };

    firebaseSalvarSolicitacaoCompra = async (solicitacao)=>{
      const path = `empresas/${token}`;
      const agora = new Date().toISOString();
      await set(push(ref(db, `${path}/solicitacoesCompra`)), {
        ...solicitacao,
        criadoEm: agora,
        criadoPor: user.uid,
        criadoPorNome: currentUserName,
        cargo: userCargo,
        atualizadoEm: serverTimestamp(),
      });
    };

    firebaseSalvarExpedicao = async (expedicao)=>{
      if(!userPodeGerir){
        throw new Error('Somente gestor ou supervisor pode criar pedido de saida.');
      }
      const expedicoesPath = `empresas/${token}/expedicoes`;
      const agora = new Date().toISOString();
      const id = String(expedicao.id || expedicao.codigo || '').trim().toUpperCase();
      if(!id){
        throw new Error('Codigo de expedicao invalido.');
      }
      await set(ref(db, `${expedicoesPath}/${id}`), {
        ...expedicao,
        id,
        codigo: expedicao.codigo || id,
        status: expedicao.status || 'pendente',
        criadoEm: agora,
        criadoPor: user.uid,
        criadoPorNome: currentUserName,
        cargo: userCargo,
        atualizadoEm: agora,
      });
      await set(push(ref(db, `${expedicoesPath}/${id}/historico`)), {
        status: expedicao.status || 'pendente',
        observacao: 'Pedido de saida criado manualmente',
        criadoEm: agora,
        criadoPor: user.uid,
        criadoPorNome: currentUserName,
        cargo: userCargo,
      });
    };

    firebaseAtualizarStatusExpedicao = async (id, status)=>{
      const statusPermitidos = ['pendente','separacao','conferencia','pronto','enviado','cancelado'];
      if(!statusPermitidos.includes(status)){
        throw new Error('Status de expedicao invalido.');
      }
      const expedicoesPath = `empresas/${token}/expedicoes`;
      const codigo = String(id || '').trim().toUpperCase();
      const agora = new Date().toISOString();
      const expSnap = await get(ref(db, `${expedicoesPath}/${codigo}`));
      if(!expSnap.exists()){
        throw new Error('Pedido de saida nao encontrado.');
      }
      const updatePayload = {
        status,
        atualizadoEm: agora,
        atualizadoPor: user.uid,
        atualizadoPorNome: currentUserName,
      };
      if(status === 'enviado') updatePayload.enviadoEm = agora;
      if(status === 'cancelado') updatePayload.canceladoEm = agora;
      await Promise.all([
        update(ref(db, `${expedicoesPath}/${codigo}`), updatePayload),
        set(push(ref(db, `${expedicoesPath}/${codigo}/historico`)), {
          status,
          criadoEm: agora,
          criadoPor: user.uid,
          criadoPorNome: currentUserName,
          cargo: userCargo,
        })
      ]);
    };

    firebaseRegistrarConferenciaExpedicao = async (id, conferencia)=>{
      const expedicoesPath = `empresas/${token}/expedicoes`;
      const codigo = String(id || '').trim().toUpperCase();
      const agora = new Date().toISOString();
      const expSnap = await get(ref(db, `${expedicoesPath}/${codigo}`));
      if(!expSnap.exists()){
        throw new Error('Pedido de saida nao encontrado.');
      }
      const expedicao = expSnap.val();
      const quantidadePrevista = Number(expedicao.quantidade || 0);
      const quantidadeConferida = Number(conferencia.quantidadeConferida || 0);
      const divergencia = quantidadeConferida !== quantidadePrevista;
      const conferenciaObs = String(conferencia.observacao || '').trim();
      await Promise.all([
        update(ref(db, `${expedicoesPath}/${codigo}`), {
          quantidadeConferida,
          conferenciaObs,
          conferidoPor: user.uid,
          conferidoPorNome: currentUserName,
          conferidoEm: agora,
          divergencia,
          status: 'pronto',
          atualizadoEm: agora,
          atualizadoPor: user.uid,
          atualizadoPorNome: currentUserName,
        }),
        set(push(ref(db, `${expedicoesPath}/${codigo}/historico`)), {
          acao: 'conferencia_quantidade',
          status: 'pronto',
          quantidadePrevista,
          quantidadeConferida,
          divergencia,
          observacao: conferenciaObs,
          criadoEm: agora,
          criadoPor: user.uid,
          criadoPorNome: currentUserName,
          cargo: userCargo,
        })
      ]);
    };

    firebaseCriarUsuarioEmpresa = async (novoUsuario)=>{
      if(!podeAdministrarUsuarios()){
        throw new Error('Somente diretor/gestor pode cadastrar usuarios.');
      }
      const nome = String(novoUsuario.nome || '').trim();
      const email = String(novoUsuario.email || '').trim();
      const senha = String(novoUsuario.senha || '');
      const cargo = ['gestores','supervisores','operadores'].includes(novoUsuario.cargo)
        ? novoUsuario.cargo
        : 'operadores';

      if(!nome || !email || senha.length < 6){
        throw new Error('Informe nome, e-mail e senha com pelo menos 6 caracteres.');
      }

      const assinaturaSnap = await get(ref(db, `empresas/${token}/assinatura`));
      const assinaturaAtual = assinaturaSnap.exists() ? assinaturaSnap.val() : {};
      const limiteUsuarios = Number.isFinite(Number(assinaturaAtual.limiteUsuarios))
        ? Number(assinaturaAtual.limiteUsuarios)
        : planoLimiteUsuarios(assinaturaAtual.plano);
      const usuariosSnap = await get(query(ref(db, 'usuarios'), orderByChild('tokenEmpresa'), equalTo(token)));
      const totalUsuarios = usuariosSnap.exists() ? Object.keys(usuariosSnap.val()).length : 0;
      if(limiteUsuarios > 0 && totalUsuarios >= limiteUsuarios){
        throw new Error('Capacidade maxima de usuarios alcancada para o plano atual.');
      }

      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, senha);
      const novoUser = cred.user;
      const agora = new Date().toISOString();
      const usuarioPayload = {
        nome,
        email,
        cargo,
        tokenEmpresa: token,
        status: 'ativo',
        criadoEm: agora,
        criadoPor: user.uid,
        criadoPorNome: currentUserName,
      };

      await Promise.all([
        set(ref(db, `cargos/${novoUser.uid}`), cargo),
        set(ref(db, `usuarios/${novoUser.uid}`), usuarioPayload),
        set(ref(db, `empresas/${token}/usuarios/${novoUser.uid}`), {
          uid: novoUser.uid,
          nome,
          email,
          cargo,
          status: 'ativo',
          criadoEm: agora,
          criadoPor: user.uid,
        }),
        set(push(ref(db, `empresas/${token}/auditoriaUsuarios`)), {
          acao: 'criacao_usuario',
          usuarioUid: novoUser.uid,
          usuarioNome: nome,
          usuarioEmail: email,
          usuarioCargo: cargo,
          responsavelUid: user.uid,
          responsavelNome: currentUserName,
          responsavelCargo: userCargo,
          depois: { nome, cargo, status: 'ativo' },
          criadoEm: serverTimestamp(),
        }),
      ]);
      await signOut(secondaryAuth);
      return { uid: novoUser.uid, ...usuarioPayload };
    };

    firebaseEditarUsuarioEmpresa = async (usuarioEditado, usuarioAnterior)=>{
      if(!podeAdministrarUsuarios()){
        throw new Error('Somente gestor ou administrador pode editar usuarios.');
      }
      const uid = String(usuarioEditado.uid || '').trim();
      const nome = String(usuarioEditado.nome || '').trim();
      const cargo = ['gestores','supervisores','operadores','administradores','admin'].includes(usuarioEditado.cargo)
        ? usuarioEditado.cargo
        : 'operadores';
      const status = ['ativo','inativo'].includes(usuarioEditado.status) ? usuarioEditado.status : 'ativo';
      if(!uid || !nome){
        throw new Error('Informe os dados do usuario.');
      }

      const usuarioSnap = await get(ref(db, `usuarios/${uid}`));
      if(!usuarioSnap.exists()){
        throw new Error('Usuario nao encontrado.');
      }
      const atual = usuarioSnap.val();
      if(atual.tokenEmpresa !== token){
        throw new Error('Usuario pertence a outra empresa.');
      }
      const antes = {
        nome: atual.nome || usuarioAnterior?.nome || '',
        cargo: atual.cargo || usuarioAnterior?.cargo || '',
        status: atual.status || usuarioAnterior?.status || 'ativo',
      };
      const eraAdminAtivo = podeAdministrarCargo(antes.cargo) && antes.status === 'ativo';
      const seraAdminAtivo = podeAdministrarCargo(cargo) && status === 'ativo';
      if(uid === user.uid && !seraAdminAtivo){
        throw new Error('Voce nao pode retirar seu proprio acesso de gestor.');
      }
      if(eraAdminAtivo && !seraAdminAtivo){
        const usuariosSnap = await get(query(ref(db, 'usuarios'), orderByChild('tokenEmpresa'), equalTo(token)));
        const usuarios = usuariosSnap.exists() ? Object.entries(usuariosSnap.val()).map(([id,dados])=>({ uid:id, ...dados })) : [];
        const adminsAtivos = usuarios.filter(u=>podeAdministrarCargo(u.cargo) && (u.status || 'ativo') === 'ativo').length;
        if(adminsAtivos <= 1){
          throw new Error('Nao e possivel remover o ultimo gestor ativo da empresa.');
        }
      }

      const depois = { nome, cargo, status };
      const acao = antes.status === 'ativo' && status === 'inativo'
        ? 'inativacao_usuario'
        : (antes.status !== 'ativo' && status === 'ativo' ? 'reativacao_usuario' : 'edicao_usuario');

      await Promise.all([
        update(ref(db, `usuarios/${uid}`), {
          nome,
          cargo,
          status,
          atualizadoEm: new Date().toISOString(),
          atualizadoPor: user.uid,
          atualizadoPorNome: currentUserName,
        }),
        set(ref(db, `cargos/${uid}`), cargo),
        update(ref(db, `empresas/${token}/usuarios/${uid}`), {
          nome,
          cargo,
          status,
          atualizadoEm: new Date().toISOString(),
          atualizadoPor: user.uid,
        }),
        set(push(ref(db, `empresas/${token}/auditoriaUsuarios`)), {
          acao,
          usuarioUid: uid,
          usuarioNome: nome,
          usuarioEmail: atual.email || usuarioAnterior?.email || '',
          usuarioCargo: cargo,
          responsavelUid: user.uid,
          responsavelNome: currentUserName,
          responsavelCargo: userCargo,
          antes,
          depois,
          criadoEm: serverTimestamp(),
        }),
      ]);
    };

    firebaseRemoverUsuarioEmpresa = async (uid, usuarioRemovido)=>{
      if(!podeAdministrarUsuarios()){
        throw new Error('Somente gestor ou administrador pode remover usuarios.');
      }
      if(uid === user.uid){
        throw new Error('Voce nao pode remover o proprio usuario logado.');
      }
      if(!uid){
        throw new Error('Usuario invalido para remocao.');
      }
      const usuarioSnap = await get(ref(db, `usuarios/${uid}`));
      const usuarioAtual = usuarioSnap.exists() ? usuarioSnap.val() : (usuarioRemovido || {});
      if(usuarioAtual.tokenEmpresa && usuarioAtual.tokenEmpresa !== token){
        throw new Error('Usuario pertence a outra empresa.');
      }
      if(podeAdministrarCargo(usuarioAtual.cargo) && (usuarioAtual.status || 'ativo') === 'ativo'){
        const usuariosSnap = await get(query(ref(db, 'usuarios'), orderByChild('tokenEmpresa'), equalTo(token)));
        const usuarios = usuariosSnap.exists() ? Object.entries(usuariosSnap.val()).map(([id,dados])=>({ uid:id, ...dados })) : [];
        const adminsAtivos = usuarios.filter(u=>podeAdministrarCargo(u.cargo) && (u.status || 'ativo') === 'ativo').length;
        if(adminsAtivos <= 1){
          throw new Error('Nao e possivel remover o ultimo gestor ativo da empresa.');
        }
      }
      const removidoEm = new Date().toISOString();
      await Promise.all([
        remove(ref(db, `usuarios/${uid}`)),
        remove(ref(db, `cargos/${uid}`)),
        remove(ref(db, `empresas/${token}/usuarios/${uid}`)),
        set(push(ref(db, `empresas/${token}/auditoriaUsuarios`)), {
          acao: 'remocao_usuario',
          usuarioUid: uid,
          usuarioNome: usuarioAtual.nome || usuarioRemovido?.nome || '',
          usuarioEmail: usuarioAtual.email || usuarioRemovido?.email || '',
          usuarioCargo: usuarioAtual.cargo || usuarioRemovido?.cargo || '',
          responsavelUid: user.uid,
          responsavelNome: currentUserName,
          responsavelCargo: userCargo,
          removidoEm,
          criadoEm: serverTimestamp(),
          authExclusao: 'pendente_backend_admin',
        }),
      ]);
    };

    const usuariosEmpresa = query(ref(db, 'usuarios'), orderByChild('tokenEmpresa'), equalTo(token));
    onValue(usuariosEmpresa, snap=>{
      const usuariosObj = snap.val() || {};
      USUARIOS_EMPRESA = Object.entries(usuariosObj).map(([uid, dados])=>({ uid, ...dados }));
      renderUsuarios();
    }, err=>{
      console.error('Erro ao carregar usuarios da empresa:', err);
      USUARIOS_EMPRESA = [];
      renderUsuarios();
    });

    onValue(ref(db, `empresas/${token}/auditoriaUsuarios`), snap=>{
      const logsObj = snap.val() || {};
      AUDITORIA_USUARIOS = Object.entries(logsObj).map(([id, dados])=>({ id, ...dados }));
      renderAuditoriaUsuarios();
    }, err=>{
      console.error('Erro ao carregar auditoria de usuarios:', err);
      AUDITORIA_USUARIOS = [];
      renderAuditoriaUsuarios();
    });

    onValue(baseRef, snap=>{
      const raw = snap.val();
      if(!raw){ mostrarNegado(); return; }
      const fallbackEmpresa = EMPRESAS_DB[token] || { nome: dadosUsuario.nome || 'Empresa', setor: dadosUsuario.cargo || '' };
      const info = raw.info || {};
      const assinaturaAtual = raw.assinatura || {};
      ASSINATURA_EMPRESA = {
        ...assinaturaAtual,
        limiteUsuarios: Number.isFinite(Number(assinaturaAtual.limiteUsuarios))
          ? Number(assinaturaAtual.limiteUsuarios)
          : planoLimiteUsuarios(assinaturaAtual.plano),
      };
      const empresa = { nome: info.nome || fallbackEmpresa.nome, setor: info.setor || fallbackEmpresa.setor || '' };
      const dados = normalizarDados(info, raw.maquinas, raw.ordens, raw.estoque, raw.apontamentos, raw.expedicoes);
      atualizarTelaComDados(token, empresa, dados);
    }, err=>{
      console.error(err);
      mostrarNegado();
    });
  }

  function mostrarNegado(){
    splash.style.opacity='0';
    setTimeout(()=>{
      splash.style.display='none';
      denied.style.display='flex';
    },500);
  }

  onAuthStateChanged(auth, async (user)=>{
    if(!user){ mostrarNegado(); return; }

    try {
      const [snapUser, snapCargo] = await Promise.all([
        get(ref(db, 'usuarios/'+user.uid)),
        get(ref(db, 'cargos/'+user.uid)),
      ]);

      const dados = snapUser.exists() ? snapUser.val() : {};
      const cargo = snapCargo.exists() ? snapCargo.val() : dados.cargo;
      const tokenEmpresa = dados.tokenEmpresa;
      if(!snapUser.exists() || (dados.status && dados.status !== 'ativo') || !tokenEmpresa){ mostrarNegado(); return; }
      dados.cargo = cargo;
      dados.tokenEmpresa = tokenEmpresa;
      userCargo = cargo;

      const assinaturaSnap = await get(ref(db, 'empresas/' + tokenEmpresa + '/assinatura'));
      const assinatura = assinaturaSnap.exists() ? assinaturaSnap.val() : {};
      if(assinatura.ativa !== true){ mostrarNegado(); return; }
      ASSINATURA_EMPRESA = {
        ...assinatura,
        limiteUsuarios: Number.isFinite(Number(assinatura.limiteUsuarios))
          ? Number(assinatura.limiteUsuarios)
          : planoLimiteUsuarios(assinatura.plano),
      };

      mostrarApp(user, dados);

      const usuarioAtualSessao = ref(db, 'usuarios/' + user.uid);
      onValue(usuarioAtualSessao, snap=>{
        const usuarioAtual = snap.exists() ? snap.val() : null;
        if(!usuarioAtual || (usuarioAtual.status && usuarioAtual.status !== 'ativo') || usuarioAtual.tokenEmpresa !== tokenEmpresa){
          mostrarNegado();
        }
      });

    } catch(err){
      console.error(err);
      mostrarNegado();
    }
  });

})().catch((error) => console.error('Erro ao carregar modulo:', error));
