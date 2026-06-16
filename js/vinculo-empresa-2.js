(() => {
  const msg = document.getElementById('msg');
  if (msg) {
    msg.textContent = 'Cadastro de funcionario desativado. Solicite acesso ao diretor da empresa.';
    msg.className = 'status-message';
  }
})();
