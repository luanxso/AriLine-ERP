const themeBtn = document.getElementById('themeBtn');
    const htmlTag = document.documentElement;
    function setThemeIcon(){
      themeBtn.innerHTML = htmlTag.getAttribute('data-theme') === 'dark' ? '<i class="ph ph-sun"></i>' : '<i class="ph ph-moon"></i>';
    }
    if(localStorage.getItem('theme') === 'dark') htmlTag.setAttribute('data-theme','dark');
    setThemeIcon();
    themeBtn.addEventListener('click', () => {
      const isDark = htmlTag.getAttribute('data-theme') === 'dark';
      htmlTag.setAttribute('data-theme', isDark ? 'light' : 'dark');
      localStorage.setItem('theme', isDark ? 'light' : 'dark');
      setThemeIcon();
    });
