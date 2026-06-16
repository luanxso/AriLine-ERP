(async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");  const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");  const { getDatabase, ref, get } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
    const firebaseConfig = {
      apiKey: "AIzaSyB4y1rt9_Jynm1M0wO21r-PZPMq5QdxtYY",
      authDomain: "projeto-integrado-ariline.firebaseapp.com",
      projectId: "projeto-integrado-ariline",
      storageBucket: "projeto-integrado-ariline.firebasestorage.app",
      messagingSenderId: "990947686480",
      appId: "1:990947686480:web:e5707c91aa62a985e9f955"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getDatabase(app);

    const statusElement = document.getElementById('login-status');
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const senha = document.getElementById('login-senha').value.trim();

      statusElement.textContent = 'Verificando credenciais...';
      statusElement.classList.remove('error');

      try {
        // 1. Autentica no Firebase
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // 2. Busca dados completos do usuário (cargo + assinatura)
        const snap = await get(ref(db, 'usuarios/' + user.uid));
        const cargoSnap = await get(ref(db, 'cargos/' + user.uid));

        if (!cargoSnap.exists()) {
          statusElement.textContent = 'Erro: Usuário sem permissão definida.';
          statusElement.classList.add('error');
          return;
        }

        const cargo = cargoSnap.val();
        const dados = snap.exists() ? snap.val() : {};
        if (!snap.exists() || (dados.status && dados.status !== 'ativo')) {
          statusElement.textContent = 'Usuario removido ou inativo. Solicite novo acesso ao gestor.';
          statusElement.classList.add('error');
          return;
        }
        const tokenEmpresa = dados.tokenEmpresa;
        if (!tokenEmpresa) {
          statusElement.textContent = 'Usuario sem empresa vinculada. Entre usando o token da empresa ou fale com o gestor.';
          statusElement.classList.add('error');
          return;
        }
        const assinaturaSnap = await get(ref(db, 'empresas/' + tokenEmpresa + '/assinatura'));
        const assinatura = assinaturaSnap.exists() ? assinaturaSnap.val() : {};
        const empresaAtiva = assinatura.ativa === true;

        sessionStorage.setItem('usuarioLogado', 'true');
        sessionStorage.setItem('userCargo', cargo);
        sessionStorage.setItem('tokenEmpresa', tokenEmpresa);

        if (empresaAtiva) {
          const versaoAtual = assinatura.versaoObrigatoria || assinatura.versaoAtual || 'web-1';
          sessionStorage.setItem('appVersion', versaoAtual);

          statusElement.textContent = `Login autorizado! Entrando como ${cargo}...`;

          setTimeout(() => {
            window.location.href = 'sistema.html';
          }, 1000);
        } else if (cargo === 'gestores') {
          statusElement.textContent = 'Empresa sem assinatura ativa. Redirecionando para escolher o plano...';
          setTimeout(() => {
            window.location.href = 'planos-assinatura.html';
          }, 1000);
        } else {
          statusElement.textContent = 'A empresa ainda nao possui assinatura ativa. Solicite ao gestor responsavel.';
          statusElement.classList.add('error');
        }

      } catch (error) {
        console.error('Erro:', error);
        statusElement.classList.add('error');
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          statusElement.textContent = 'E-mail ou senha incorretos.';
        } else if (error.code === 'auth/too-many-requests') {
          statusElement.textContent = 'Muitas tentativas. Aguarde um pouco.';
        } else {
          statusElement.textContent = 'Erro ao fazer login. Tente novamente.';
        }
      }
    });
  
})().catch((error) => console.error('Erro ao carregar modulo:', error));
