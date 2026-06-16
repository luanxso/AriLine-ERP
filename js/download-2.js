(async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");  const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");  const { getDatabase, ref, get } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js");
    const firebaseConfig = {
      apiKey: "AIzaSyB4y1rt9_Jynm1M0wO21r-PZPMq5QdxtYY",
      authDomain: "projeto-integrado-ariline.firebaseapp.com",
      projectId: "projeto-integrado-ariline",
      storageBucket: "projeto-integrado-ariline.firebasestorage.app",
      messagingSenderId: "990947686480",
      appId: "1:990947686480:web:e5707c91aa62a985e9f955",
      databaseURL: "https://projeto-integrado-ariline-default-rtdb.firebaseio.com"
    };

    const app  = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db   = getDatabase(app);

    const loadingScreen = document.getElementById('loading-screen');
    const acessoNegado  = document.getElementById('acesso-negado');
    const mainContent   = document.getElementById('main-content');
    const planoNome     = document.getElementById('planoNome');
    const navBadge      = document.getElementById('navBadge');

    const planoNomes = { basico: 'Básico', profissional: 'Profissional', enterprise: 'Enterprise' };

    function mostrarNegado() { loadingScreen.style.display = 'none'; acessoNegado.style.display = 'flex'; }

    function mostrarConteudo(plano, downloadKey) {
      planoNome.textContent = planoNomes[plano] || plano;
      if(downloadKey) localStorage.setItem(downloadKey, 'true');
      loadingScreen.style.display = 'none';
      mainContent.style.display   = 'block';
      navBadge.classList.add('visible');
    }

    onAuthStateChanged(auth, async (user) => {
      if (!user) { mostrarNegado(); return; }
      try {
        const snap = await get(ref(db, 'usuarios/' + user.uid));
        const dados = snap.exists() ? snap.val() : {};
        const tokenEmpresa = dados.tokenEmpresa || sessionStorage.getItem('tokenEmpresa');
        if (!tokenEmpresa) { mostrarNegado(); return; }
        const assinaturaSnap = await get(ref(db, 'empresas/' + tokenEmpresa + '/assinatura'));
        const assinatura = assinaturaSnap.exists() ? assinaturaSnap.val() : {};
        if (assinatura.ativa === true) {
          const versaoAtual = assinatura.versaoObrigatoria || assinatura.versaoAtual || sessionStorage.getItem('appVersion') || 'web-1';
          const downloadKey = sessionStorage.getItem('downloadKey') || `ariline-download-ok:${user.uid}:${tokenEmpresa}:${versaoAtual}`;
          mostrarConteudo(assinatura.plano || 'profissional', downloadKey);
        } else {
          mostrarNegado();
        }
      } catch (err) {
        console.error(err);
        mostrarNegado();
      }
    });
  
})().catch((error) => console.error('Erro ao carregar modulo:', error));
