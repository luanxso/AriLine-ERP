const firebaseConfig = {
      apiKey: "AIzaSyB4y1rt9_Jynm1M0wO21r-PZPMq5QdxtYY",
      authDomain: "projeto-integrado-ariline.firebaseapp.com",
      projectId: "projeto-integrado-ariline",
      storageBucket: "projeto-integrado-ariline.firebasestorage.app",
      messagingSenderId: "990947686480",
      appId: "1:990947686480:web:e5707c91aa62a985e9f955"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();

    const mainContent   = document.getElementById('main-content');
    const jaSolicitou   = document.getElementById('ja-solicitou');
    const semPermissao  = document.getElementById('sem-permissao');
    const emailDestaque = document.getElementById('emailDestaque');
    const heroSub       = document.getElementById('heroSub');

    // Email que veio do contato.html via sessionStorage
    const demoEmail = sessionStorage.getItem('demoEmail');
    const demoNome  = sessionStorage.getItem('demoNome');

    function mostrarMain() {
      if (demoNome) {
        heroSub.textContent =
          `Olá, ${demoNome}! Seu acesso à demo do AriLine ERP está pronto. ` +
          `Explore o sistema por 30 dias sem precisar de cartão de crédito.`;
      }
      mainContent.style.display = 'block';
    }

    function mostrarJaSolicitou(email) {
      emailDestaque.textContent = email;
      jaSolicitou.style.display = 'block';
    }

    function mostrarSemPermissao() {
      semPermissao.style.display = 'block';
    }

    async function verificarAcesso() {
      // Caso 1: sem email na sessão → acessou direto, sem vir do contato
      if (!demoEmail) {
        mostrarSemPermissao();
        return;
      }

      // Caso 2: veio do contato, mas já havia pedido demo antes?
      // (O contato já verifica isso, mas checamos aqui também por segurança)
      const emailKey = demoEmail.replace(/\./g, '_').replace(/@/g, '_at_');
      try {
        const snap = await db.ref('demos_solicitadas/' + emailKey).get();

        if (snap.exists()) {
          // Verifica se a flag de "recém-chegou do contato" está ativa
          // Se demoNome está presente, é uma solicitação nova (veio agora do contato)
          // Se não tem nome, é uma tentativa de reload/reacesso posterior
          if (demoNome) {
            // Chegou agora do formulário → mostra normalmente
            // Limpa sessionStorage pra evitar reacesso direto depois
            sessionStorage.removeItem('demoEmail');
            sessionStorage.removeItem('demoNome');
            mostrarMain();
          } else {
            // Reload ou acesso posterior sem ter vindo do formulário
            mostrarJaSolicitou(demoEmail);
          }
        } else {
          // Não deveria chegar aqui (contato grava antes), mas por segurança
          mostrarSemPermissao();
        }
      } catch (err) {
        console.error('Erro ao verificar demo:', err);
        // Em caso de falha no Firebase, mostra o conteúdo (não penaliza o usuário)
        mostrarMain();
      }
    }

    verificarAcesso();
