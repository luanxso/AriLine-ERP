/*
  ─────────────────────────────────────────────────────────
  AriLine · Email de Pagamento  (substitui pagamento-2.js)

  Envia ao usuário: confirmação do plano + token de acesso.
  
  Dependência: adicionar antes do </body> em pagamento.html:
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  ─────────────────────────────────────────────────────────
*/

// ── CONFIG EMAILJS ─────────────────────────────────────
const EMAILJS_PUBLIC_KEY      = '7XmBHN2NSOcDHjRSBU93V';
const SERVICE_ID              = 'service_okgnq9r';
const TEMPLATE_PAGAMENTO_USER = 'template_pagamento_user';

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ── MÓDULO PRINCIPAL ───────────────────────────────────
(async () => {
  const { initializeApp }   = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getAuth }         = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  const { getDatabase, ref, get, update, set } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

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
  const auth = getAuth(app);
  const db   = getDatabase(app);

  function gerarTokenEmpresa(nomeEmpresa) {
    const clean  = (nomeEmpresa || 'EMPRESA')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toUpperCase().replace(/[^A-Z0-9]/g, '');
    const prefix = (clean.slice(0, 4) || 'ARIL').padEnd(4, 'X');
    const chars  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return `ARL-${prefix}-${code}`;
  }

  async function gerarTokenUnico(nomeEmpresa) {
    for (let i = 0; i < 8; i++) {
      const token = gerarTokenEmpresa(nomeEmpresa);
      const snap  = await get(ref(db, 'empresas/' + token));
      if (!snap.exists()) return token;
    }
    throw new Error('Nao foi possivel gerar um token unico. Tente novamente.');
  }

  const planoNomes = {
    basico:         'Essencial',
    profissional:   'Profissional',
    enterprise:     'Enterprise',
  };
  const planoLimitesUsuarios = {
    basico: 5,
    profissional: 20,
    enterprise: 0,
  };

  // ── PROCESSAR PAGAMENTO ────────────────────────────
  window.processarPagamento = async function () {
    const nome    = document.getElementById('nomeCartao').value.trim();
    const cpf     = document.getElementById('cpf').value.trim();
    const numero  = document.getElementById('numeroCartao').value.trim();
    const validade= document.getElementById('validade').value.trim();
    const cvv     = document.getElementById('cvv').value.trim();
    const status  = document.getElementById('payStatus');
    const btn     = document.getElementById('btnPagar');

    if (!nome || !cpf || !numero || !validade || !cvv) {
      status.textContent = 'Preencha todos os campos do cartão.';
      status.className   = 'status-message error';
      return;
    }
    if (numero.replace(/\s/g, '').length < 16) {
      status.textContent = 'Número do cartão inválido.';
      status.className   = 'status-message error';
      return;
    }

    btn.disabled       = true;
    status.textContent = 'Processando pagamento...';
    status.className   = 'status-message';

    await new Promise(r => setTimeout(r, 1800));

    const user = auth.currentUser;
    if (!user) {
      status.textContent = 'Sessão expirada. Faça login novamente.';
      status.className   = 'status-message error';
      btn.disabled       = false;
      return;
    }

    const plano = sessionStorage.getItem('planoSelecionado') || 'profissional';
    const preco = sessionStorage.getItem('planoPreco')       || '499';

    try {
      const [userSnap, cargoSnap] = await Promise.all([
        get(ref(db, 'usuarios/' + user.uid)),
        get(ref(db, 'cargos/'   + user.uid)),
      ]);
      const dadosUsuario  = userSnap.exists()  ? userSnap.val()  : {};
      const cargo         = cargoSnap.exists() ? cargoSnap.val() : dadosUsuario.cargo;
      const empresaSessao = JSON.parse(sessionStorage.getItem('cadastroEmpresaPendente') || 'null');
      const pendenteSnap  = await get(ref(db, 'empresasPendentes/' + user.uid));
      const empresaPendente = empresaSessao || (pendenteSnap.exists() ? pendenteSnap.val() : null);
      let tokenEmpresa    = dadosUsuario.tokenEmpresa || sessionStorage.getItem('tokenEmpresa');
      const agora         = new Date().toISOString();

      if (cargo !== 'gestores') {
        throw new Error('Somente o gestor/diretor pode ativar a assinatura da empresa.');
      }

      if (!tokenEmpresa && empresaPendente) {
        tokenEmpresa = await gerarTokenUnico(empresaPendente.nome);
        await set(ref(db, 'empresas/' + tokenEmpresa + '/info'), {
          nome:         empresaPendente.nome,
          setor:        empresaPendente.setor,
          cidade:       empresaPendente.cidade,
          diretorUid:   user.uid,
          diretorNome:  empresaPendente.diretorNome  || dadosUsuario.nome  || '',
          diretorEmail: empresaPendente.diretorEmail || user.email         || '',
          criadoEm:     agora,
        });
      }

      if (!tokenEmpresa) {
        throw new Error('Usuario sem empresa vinculada. Cadastre a empresa antes do pagamento.');
      }

      await update(ref(db, 'empresas/' + tokenEmpresa + '/assinatura'), {
        ativa:          true,
        plano,
        planoPreco:     preco,
        limiteUsuarios: planoLimitesUsuarios[plano] ?? planoLimitesUsuarios.profissional,
        pagoPor:        user.uid,
        pagoPorEmail:   user.email || dadosUsuario.email || '',
        pagoEm:         agora,
      });

      await update(ref(db, 'usuarios/' + user.uid), {
        tokenEmpresa,
        empresaPendente:        false,
        ultimoPagamentoEmpresa: tokenEmpresa,
        ultimoPagamentoEm:      agora,
      });

      await update(ref(db, 'empresasPendentes/' + user.uid), {
        status: 'pago',
        tokenEmpresa,
        pagoEm: agora,
      });

      sessionStorage.setItem('empresaAssinante', 'true');
      sessionStorage.setItem('tokenEmpresa', tokenEmpresa);
      sessionStorage.removeItem('cadastroEmpresaPendente');

      // ── ENVIAR EMAIL DE CONFIRMAÇÃO ──────────────
      // Variáveis disponíveis no template do EmailJS:
      // {{to_name}}  {{to_email}}  {{empresa_nome}}
      // {{plano_nome}}  {{plano_preco}}  {{token}}  {{data}}
      const dataFormatada = new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      const emailParams = {
        to_name:    dadosUsuario.nome  || user.displayName || 'Diretor',
        to_email:   dadosUsuario.email || user.email,
        empresa_nome: empresaPendente?.nome || tokenEmpresa,
        plano_nome: planoNomes[plano] || plano,
        plano_preco:`R$ ${preco}/mês`,
        token:      tokenEmpresa,
        data:       dataFormatada,
      };

      try {
        await emailjs.send(SERVICE_ID, TEMPLATE_PAGAMENTO_USER, emailParams);
        console.log('[EmailJS] Email de pagamento enviado para', emailParams.to_email);
      } catch (emailErr) {
        // Falha no email não deve bloquear o fluxo de pagamento
        console.warn('[EmailJS] Falha ao enviar email de pagamento:', emailErr);
      }

      status.textContent = `✓ Pagamento aprovado! Token: ${tokenEmpresa}. Enviamos um e-mail com os detalhes. Redirecionando...`;
      status.className   = 'status-message success';

      setTimeout(() => {
        window.location.href = 'sistema.html';
      }, 4500);

    } catch (err) {
      console.error(err);
      status.textContent = err.message || 'Erro ao confirmar assinatura. Tente novamente.';
      status.className   = 'status-message error';
      btn.disabled       = false;
    }
  };

})().catch(err => console.error('Erro ao carregar modulo:', err));
