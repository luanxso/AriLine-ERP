function copy(text, btn){
      navigator.clipboard.writeText(text).then(()=>{
        const orig = btn.textContent;
        btn.textContent = 'Copiado ✓';
        btn.style.color = '#1FAE72';
        setTimeout(()=>{ btn.textContent = orig; btn.style.color = ''; }, 1800);
      });
    }
