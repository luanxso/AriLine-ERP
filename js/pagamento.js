// Tema
    const themeBtn = document.getElementById('themeBtn');
    const htmlTag = document.documentElement;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    if (localStorage.getItem('theme') === 'dark') { htmlTag.setAttribute('data-theme', 'dark'); themeBtn.innerHTML = sunIcon; }
    themeBtn.addEventListener('click', () => {
      const isDark = htmlTag.getAttribute('data-theme') === 'dark';
      htmlTag.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
      themeBtn.innerHTML = isDark ? moonIcon : sunIcon;
    });

    // Carrega resumo do plano selecionado
    const plano = sessionStorage.getItem('planoSelecionado') || 'profissional';
    const preco = sessionStorage.getItem('planoPreco') || '499';
    const planoNomes = { basico: 'Básico', profissional: 'Profissional', enterprise: 'Enterprise' };
    const planoUsuarios = { basico: 'Até 5 usuários', profissional: 'Até 20 usuários', enterprise: 'Ilimitados' };
    document.getElementById('resumoPlano').textContent = planoNomes[plano] || plano;
    document.getElementById('resumoPreco').textContent = `R$ ${preco}`;
    document.getElementById('resumoUsuarios').textContent = planoUsuarios[plano] || '—';

    // Máscaras
    function maskCard(el) {
      let v = el.value.replace(/\D/g, '').substring(0, 16);
      el.value = v.replace(/(.{4})/g, '$1 ').trim();
    }
    function maskExpiry(el) {
      let v = el.value.replace(/\D/g, '').substring(0, 4);
      if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
      el.value = v;
    }
    function maskCPF(el) {
      let v = el.value.replace(/\D/g, '').substring(0, 11);
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d)/, '$1.$2');
      v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      el.value = v;
    }

    // Preview do cartão
    function updatePreview() {
      const num = document.getElementById('numeroCartao').value || '';
      const name = document.getElementById('nomeCartao').value || '';
      const exp = document.getElementById('validade').value || '';
      const numFormatted = num.padEnd(19, ' ').replace(/\S{4}/g, m => m + ' ').trim();
      const displayNum = num ? num.padEnd(19, '•') : '•••• •••• •••• ••••';
      document.getElementById('cardPreview').textContent = displayNum || '•••• •••• •••• ••••';
      document.getElementById('namePreview').textContent = name.toUpperCase() || 'NOME DO TITULAR';
      document.getElementById('expiryPreview').textContent = exp || 'MM/AA';
    }
