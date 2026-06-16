/*
  ─────────────────────────────────────────────────────────
  AriLine · Email de Cadastro de Empresa  (substitui cadastro-empresa-2.js)

  Envia ao diretor: boas-vindas + aviso de que a equipe
  entrará em contato para mapeamento da operação.

  Dependência: adicionar antes do </body> em cadastro-empresa.html:
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  ─────────────────────────────────────────────────────────
*/

// ── CONFIG EMAILJS ─────────────────────────────────────
const EMAILJS_PUBLIC_KEY       = '7XmBHN2NSOcDHjRSBU93V';
const SERVICE_ID               = 'service_okgnq9r';
const TEMPLATE_CADASTRO_USER   = 'template_cadastro_user';  // email pro diretor
const TEMPLATE_CADASTRO_TEAM   = 'template_cadastro_team';  // notificação pra equipe AriLine

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ── MÓDULO PRINCIPAL ───────────────────────────────────
(async () => {
  const { initializeApp }                          = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getAuth, createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
  const { getDatabase, ref, set }                  = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");

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

  const form = document.getElementById('empresa-form');
  const msg  = document.getElementById('msg');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    msg.textContent = 'Criando acesso do diretor...';
    msg.className   = 'status-message';

    const nome         = document.getElementById('nome').value.trim();
    const email        = document.getElementById('email').value.trim();
    const senha        = document.getElementById('senha').value;
    const empresaNome  = document.getElementById('empresaNome').value.trim();
    const empresaSetor = document.getElementById('empresaSetor').value.trim();
    const empresaCidade= document.getElementById('empresaCidade').value.trim();

    try {
      // ── 1. CRIAR USUÁRIO NO FIREBASE AUTH ─────────
      const cred = await createUserWithEmailAndPassword(auth, email, senha);
      const user = cred.user;

      const empresaPendente = {
        nome:         empresaNome,
        setor:        empresaSetor,
        cidade:       empresaCidade,
        diretorNome:  nome,
        diretorEmail: email,
        diretorUid:   user.uid,
        status:       'pendente_pagamento',
        criadoEm:     new Date().toISOString(),
      };

      await set(ref(db, 'cargos/'   + user.uid), 'gestores');
      await set(ref(db, 'usuarios/' + user.uid), {
        nome,
        email,
        cargo:           'gestores',
        status:          'ativo',
        criadoEm:        new Date().toISOString(),
        empresaPendente: true,
      });
      await set(ref(db, 'empresasPendentes/' + user.uid), empresaPendente);
      sessionStorage.setItem('cadastroEmpresaPendente', JSON.stringify(empresaPendente));

      // ── 2. ENVIAR EMAILS ────────────────────────────
      // Variáveis disponíveis nos templates do EmailJS:
      // {{to_name}}  {{to_email}}  {{empresa_nome}}
      // {{empresa_setor}}  {{empresa_cidade}}  {{data}}
      const dataFormatada = new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });

      // Email pro diretor — boas-vindas + próximos passos
      const paramsUser = {
        to_name:        nome,
        to_email:       email,
        empresa_nome:   empresaNome,
        empresa_setor:  empresaSetor,
        empresa_cidade: empresaCidade,
        data:           dataFormatada,
      };

      // Email pra equipe AriLine — alerta de novo cadastro para mapeamento
      const paramsTeam = {
        to_name:        'Equipe AriLine',
        to_email:       'contato@ariline.com.br', // mude para o email real de vocês
        empresa_nome:   empresaNome,
        empresa_setor:  empresaSetor,
        empresa_cidade: empresaCidade,
        diretor_nome:   nome,
        diretor_email:  email,
        data:           dataFormatada,
      };

      try {
        await Promise.all([
          emailjs.send(SERVICE_ID, TEMPLATE_CADASTRO_USER, paramsUser),
          emailjs.send(SERVICE_ID, TEMPLATE_CADASTRO_TEAM, paramsTeam),
        ]);
        console.log('[EmailJS] Emails de cadastro enviados.');
      } catch (emailErr) {
        // Email falhou mas cadastro já está salvo — não bloqueia
        console.warn('[EmailJS] Falha ao enviar email de cadastro:', emailErr);
      }

      // ── 3. FEEDBACK E REDIRECIONAMENTO ─────────────
      msg.textContent = '✓ Dados salvos. Enviamos um e-mail de boas-vindas. Escolha o plano...';
      msg.className   = 'status-message success';
      setTimeout(() => location.href = 'planos-assinatura.html', 900);

    } catch (err) {
      console.error(err);
      msg.textContent = err.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está cadastrado.'
        : 'Erro ao cadastrar empresa. Tente novamente.';
      msg.className = 'status-message error';
    }
  });

})().catch(err => console.error('Erro ao carregar modulo:', err));
