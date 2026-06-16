/*
  ─────────────────────────────────────────────────────────
  AriLine · Email de Contato  (cola no final de contato.html)
  
  SUBSTITUI o arquivo contato-2.js existente — ou adiciona
  o bloco "ENVIO DE EMAIL" dentro do try{} existente.

  Dependência: adicionar antes do </body>:
  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
  ─────────────────────────────────────────────────────────
*/

// ── CONFIG EMAILJS ─────────────────────────────────────
// Substitua pelos valores do seu painel em emailjs.com
const EMAILJS_PUBLIC_KEY    = '7XmBHN2NSOcDHjRSBU93V';
const SERVICE_ID            = 'service_okgnq9r';
const TEMPLATE_CONTATO_USER = 'template_contato_user'; // email pro usuário
const TEMPLATE_CONTATO_TEAM = 'template_contato_team'; // notificação pra vocês

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ── FIREBASE CONFIG ────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB4y1rt9_Jynm1M0wO21r-PZPMq5QdxtYY",
  authDomain: "projeto-integrado-ariline.firebaseapp.com",
  projectId: "projeto-integrado-ariline",
  storageBucket: "projeto-integrado-ariline.firebasestorage.app",
  messagingSenderId: "990947686480",
  appId: "1:990947686480:web:e5707c91aa62a985e9f955",
  databaseURL: "https://projeto-integrado-ariline-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const form      = document.getElementById('contactForm');
const statusEl  = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

if (!form || !statusEl || !submitBtn) {
  throw new Error('Formulario de contato nao encontrado.');
}

function emailKey(email) {
  return String(email || '').trim().toLowerCase()
    .replace(/\./g, '_').replace(/@/g, '_at_');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const dados = Object.fromEntries(new FormData(form).entries());
  dados.email    = String(dados.email   || '').trim().toLowerCase();
  dados.nome     = String(dados.nome    || '').trim();
  dados.criadoEm = new Date().toISOString();
  dados.origem   = 'contato.html';

  if (!dados.nome || !dados.email || !dados.empresa) {
    statusEl.textContent = 'Preencha nome, e-mail e empresa.';
    statusEl.className   = 'status-message error';
    return;
  }

  submitBtn.disabled     = true;
  statusEl.textContent   = 'Enviando solicitação...';
  statusEl.className     = 'status-message';

  // ── 1. SALVAR NO FIREBASE ──────────────────────────
  try {
    const contatoRef = await db.ref('contatos').push(dados);
    await db.ref('demos_solicitadas/' + emailKey(dados.email)).set({
      contatoId:   contatoRef.key,
      nome:        dados.nome,
      email:       dados.email,
      empresa:     dados.empresa,
      telefone:    dados.telefone  || '',
      cargo:       dados.cargo     || '',
      interesse:   dados.interesse || '',
      mensagem:    dados.mensagem  || '',
      status:      'email_pendente',
      criadoEm:    dados.criadoEm,
    });
  } catch (err) {
    console.error('Erro Firebase:', err);
    statusEl.textContent = 'Não foi possível enviar agora. Tente novamente em alguns minutos.';
    statusEl.className   = 'status-message error';
    submitBtn.disabled   = false;
    return;
  }

  // ── 2. ENVIAR EMAILS VIA EMAILJS ───────────────────
  // Variáveis disponíveis no template do EmailJS:
  // {{to_name}}  {{to_email}}  {{empresa}}  {{cargo}}
  // {{interesse}}  {{mensagem}}  {{telefone}}  {{data}}
  const dataFormatada = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const paramsUser = {
    to_name:    dados.nome,
    to_email:   dados.email,
    empresa:    dados.empresa,
    cargo:      dados.cargo     || 'Não informado',
    interesse:  dados.interesse || 'Não informado',
    mensagem:   dados.mensagem  || '',
    telefone:   dados.telefone  || 'Não informado',
    data:       dataFormatada,
  };

  // Email de notificação para a equipe AriLine
  // Mude 'contato@ariline.com.br' para o email real de vocês
  const paramsTeam = {
    ...paramsUser,
    to_email: 'contato@ariline.com.br',
    to_name:  'Equipe AriLine',
  };

  try {
    // Dispara os dois emails em paralelo
    await Promise.all([
      emailjs.send(SERVICE_ID, TEMPLATE_CONTATO_USER, paramsUser),
      emailjs.send(SERVICE_ID, TEMPLATE_CONTATO_TEAM, paramsTeam),
    ]);
    console.log('[EmailJS] Emails de contato enviados.');
  } catch (emailErr) {
    // Email falhou mas Firebase salvou — não bloqueia o usuário
    console.warn('[EmailJS] Falha no envio:', emailErr);
  }

  // ── 3. FEEDBACK FINAL ──────────────────────────────
  form.reset();
  statusEl.textContent = '✓ Solicitação recebida! Você receberá um e-mail de confirmação em breve.';
  statusEl.className   = 'status-message success';
  submitBtn.disabled   = false;
});
