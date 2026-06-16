(function(){
  if(localStorage.getItem('arilineAdminDev') !== 'true'){
    document.body.innerHTML = '<main style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#07100E;color:#D4EDE6;font-family:Barlow,Arial,sans-serif;text-align:center;padding:32px"><section><div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#6DAF91;margin-bottom:10px">AriLine interno</div><h1 style="font-family:Barlow Condensed,Arial,sans-serif;text-transform:uppercase;margin:0 0 8px;font-size:38px">Pagina restrita</h1><p style="color:#85A99B;margin:0 0 20px">Ferramenta reservada para configuracao e manutencao do sistema.</p><a href="index.html" style="color:#3B8FEA;font-weight:700;text-decoration:none">Voltar ao site</a></section></main>';
    throw new Error('Pagina interna bloqueada.');
  }
})();
