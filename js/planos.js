const btn = document.getElementById('themeBtn');
    const html = document.documentElement;
    if(localStorage.getItem('theme') === 'dark') { html.setAttribute('data-theme', 'dark'); }
    btn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      html.setAttribute('data-theme', current === 'light' ? 'dark' : 'light');
      localStorage.setItem('theme', current === 'light' ? 'dark' : 'light');
    });
