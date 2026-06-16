$ProjectRoot = Split-Path -Parent $PSScriptRoot

$cadastro = Get-Content -LiteralPath (Join-Path $ProjectRoot 'cadastro.html') -Raw
$vinculo = Get-Content -LiteralPath (Join-Path $ProjectRoot 'vinculo-empresa.html') -Raw
$sistema = Get-Content -LiteralPath (Join-Path $ProjectRoot 'sistema.html') -Raw
$sistemaJs = Get-Content -LiteralPath (Join-Path $ProjectRoot 'js/sistema.js') -Raw
$sistemaFirebaseJs = Get-Content -LiteralPath (Join-Path $ProjectRoot 'js/sistema-2.js') -Raw
$sistemaCss = Get-Content -LiteralPath (Join-Path $ProjectRoot 'css/sistema.css') -Raw
$loginFirebaseJs = Get-Content -LiteralPath (Join-Path $ProjectRoot 'js/login-2.js') -Raw
$vinculoFirebaseJs = Get-Content -LiteralPath (Join-Path $ProjectRoot 'js/vinculo-empresa-2.js') -Raw
$mobileSistema = Get-Content -LiteralPath (Join-Path $ProjectRoot 'mobile_qr/index.html') -Raw
$mobileSistemaJs = Get-Content -LiteralPath (Join-Path $ProjectRoot 'mobile_qr/js/sistema.js') -Raw
$mobileSistemaCss = Get-Content -LiteralPath (Join-Path $ProjectRoot 'mobile_qr/css/mobile-demo.css') -Raw

function Assert-Contains {
  param([string]$Text, [string]$Pattern, [string]$Message)
  if ($Text -notmatch [regex]::Escape($Pattern)) {
    throw $Message
  }
}

function Assert-NotContains {
  param([string]$Text, [string]$Pattern, [string]$Message)
  if ($Text -match [regex]::Escape($Pattern)) {
    throw $Message
  }
}

Assert-Contains $cadastro "Cadastrar empresa" "cadastro.html deve manter cadastro de empresa para diretor."
Assert-NotContains $cadastro "vinculo-empresa.html" "cadastro.html nao deve mais levar funcionario para autocadastro por token."
Assert-Contains $vinculo "Cadastro de funcionario desativado" "vinculo-empresa.html deve informar que funcionario e cadastrado pelo diretor."
Assert-NotContains $vinculo "id=`"func-form`"" "vinculo-empresa.html nao deve expor formulario publico de funcionario."
Assert-NotContains $vinculoFirebaseJs "createUserWithEmailAndPassword(auth" "js/vinculo-empresa-2.js nao deve manter criacao publica de funcionario por token."
Assert-Contains $sistema 'data-view="usuarios"' "sistema.html deve ter navegacao para Usuarios."
Assert-Contains $sistema 'id="view-usuarios"' "sistema.html deve ter a tela de controle de usuarios."
Assert-Contains $sistema 'id="usuarioForm"' "sistema.html deve ter formulario/modal para cadastro de usuario."
Assert-Contains $sistema 'id="usuariosTabEquipe"' "sistema.html deve ter aba Equipe em Usuarios."
Assert-Contains $sistema 'id="usuariosTabAuditoria"' "sistema.html deve ter aba Auditoria em Usuarios."
Assert-Contains $sistema 'id="auditoriaUsuariosList"' "sistema.html deve ter lista visivel de auditoria de usuarios."
Assert-Contains $sistema 'id="usuarioStatus"' "sistema.html deve permitir editar status do usuario."
Assert-Contains $sistemaCss ".usuarios-tab" "css/sistema.css deve estilizar as abas de usuarios."
Assert-Contains $sistemaCss "font-family: 'Barlow Condensed'" "abas de usuarios devem usar fonte menos compacta e mais legivel."
Assert-Contains $sistemaCss "font-size: 15px" "abas de usuarios devem ter fonte maior."
Assert-Contains $sistemaCss "gap: 22px" "abas de usuarios devem ter mais espaco entre opcoes."
Assert-Contains $sistemaJs "renderUsuarios" "js/sistema.js deve renderizar lista de usuarios."
Assert-Contains $sistemaJs "abrirUsuarioModal" "js/sistema.js deve abrir cadastro de usuario."
Assert-Contains $sistemaJs "PLANO_LIMITES_USUARIOS" "js/sistema.js deve definir limites de usuarios por plano."
Assert-Contains $sistemaJs "limiteUsuariosAtingido" "js/sistema.js deve bloquear cadastro quando o limite de usuarios for atingido."
Assert-Contains $sistemaJs "removerUsuario" "js/sistema.js deve permitir remocao de usuario pelo gestor."
Assert-Contains $sistemaJs "abrirEditarUsuario" "js/sistema.js deve permitir abrir edicao de usuario."
Assert-Contains $sistemaJs "renderAuditoriaUsuarios" "js/sistema.js deve renderizar auditoria de usuarios."
Assert-Contains $sistemaJs "AUDITORIA_USUARIOS" "js/sistema.js deve armazenar logs de auditoria em memoria."
Assert-Contains $sistemaJs "data-edit-user" "js/sistema.js deve renderizar acao de editar usuario."
Assert-Contains $sistemaJs "confirm(" "js/sistema.js deve confirmar antes de remover usuario."
Assert-Contains $sistemaJs "data-remove-user" "js/sistema.js deve renderizar acao de remover usuario."
Assert-Contains $sistema 'id="expedicoesGrid"' "sistema.html deve ter lista de pedidos de saida em Expedicao."
Assert-Contains $sistema 'id="novaExpedicaoBtn"' "sistema.html deve ter botao para criar pedido de saida manual."
Assert-Contains $sistema 'id="expedicaoForm"' "sistema.html deve ter modal/formulario de pedido de saida manual."
Assert-Contains $sistema 'id="expedicaoOpRef"' "pedido de saida deve permitir OP/lote opcional, sem obrigar vinculo com OP."
Assert-Contains $sistema 'id="expedicaoConferenciaModal"' "sistema.html deve ter modal de conferencia de quantidade."
Assert-Contains $sistema 'id="expedicaoConferenciaForm"' "sistema.html deve ter formulario para registrar quantidade conferida."
Assert-Contains $sistema 'id="expedicaoRomaneioModal"' "sistema.html deve ter modal de romaneio/resumo da saida."
Assert-Contains $sistema 'id="imprimirRomaneioBtn"' "romaneio deve oferecer acao de impressao."
Assert-Contains $sistema 'id="maqChecklistBtn"' "sistema.html deve ter botao de checklist no detalhe da maquina."
Assert-Contains $sistema 'id="checklistForm"' "sistema.html deve ter formulario de Checklist do Operador."
Assert-Contains $sistema 'id="checklistNaoConformidade"' "sistema.html deve permitir registrar nao conformidade no checklist."
Assert-NotContains $sistema "Modulo de expedicao em desenvolvimento" "sistema.html nao deve manter placeholder de Expedicao."
Assert-Contains $sistemaCss ".expedicao-grid" "css/sistema.css deve estilizar a lista de pedidos de saida."
Assert-Contains $sistemaCss ".expedicao-card" "css/sistema.css deve estilizar cards de Expedicao."
Assert-Contains $sistemaCss ".romaneio-sheet" "css/sistema.css deve estilizar o romaneio de saida."
Assert-Contains $sistemaCss ".conferencia-diff" "css/sistema.css deve destacar divergencia de conferencia."
Assert-Contains $sistemaCss ".checklist-grid" "css/sistema.css deve organizar os itens do Checklist do Operador."
Assert-Contains $sistemaCss ".checklist-option" "css/sistema.css deve estilizar cada item de checklist."
Assert-Contains $sistemaJs "let EXPEDICOES" "js/sistema.js deve manter estado local de Expedicao."
Assert-Contains $sistemaJs "renderExpedicao" "js/sistema.js deve renderizar modulo de Expedicao."
Assert-Contains $sistemaJs "abrirExpedicaoModal" "js/sistema.js deve abrir cadastro manual de pedido de saida."
Assert-Contains $sistemaJs "salvarExpedicao" "js/sistema.js deve salvar pedido de saida manual."
Assert-Contains $sistemaJs "atualizarStatusExpedicao" "js/sistema.js deve avancar status de pedidos de saida."
Assert-Contains $sistemaJs "validarExpedicao" "js/sistema.js deve validar pedido de saida sem exigir OP."
Assert-Contains $sistemaJs "abrirConferenciaExpedicao" "js/sistema.js deve abrir conferencia de quantidade."
Assert-Contains $sistemaJs "registrarConferenciaExpedicao" "js/sistema.js deve registrar quantidade conferida."
Assert-Contains $sistemaJs "expedicaoTemDivergencia" "js/sistema.js deve calcular divergencia entre quantidade prevista e conferida."
Assert-Contains $sistemaJs "abrirRomaneioExpedicao" "js/sistema.js deve abrir romaneio/resumo da saida."
Assert-Contains $sistemaJs "imprimirRomaneioExpedicao" "js/sistema.js deve imprimir romaneio."
Assert-Contains $sistemaJs "quantidadeConferida" "js/sistema.js deve exibir ou persistir quantidade conferida."
Assert-Contains $sistemaJs "abrirChecklistModal" "js/sistema.js deve abrir o Checklist do Operador a partir da maquina."
Assert-Contains $sistemaJs "salvarChecklistOperador" "js/sistema.js deve salvar o Checklist do Operador."
Assert-Contains $sistemaJs "firebaseSalvarChecklistOperador" "js/sistema.js deve delegar a persistencia do checklist ao Firebase."
Assert-Contains $sistemaFirebaseJs "initializeApp(firebaseConfig, 'secondary-user-creator')" "js/sistema-2.js deve usar app secundario para criar funcionario sem trocar sessao do diretor."
Assert-Contains $sistemaFirebaseJs "raw.expedicoes" "js/sistema-2.js deve carregar pedidos de saida da empresa."
Assert-Contains $sistemaFirebaseJs "firebaseSalvarExpedicao" "js/sistema-2.js deve expor salvamento Firebase de pedidos de saida."
Assert-Contains $sistemaFirebaseJs "firebaseAtualizarStatusExpedicao" "js/sistema-2.js deve expor atualizacao de status de Expedicao."
Assert-Contains $sistemaFirebaseJs "firebaseRegistrarConferenciaExpedicao" "js/sistema-2.js deve persistir conferencia de quantidade."
Assert-Contains $sistemaFirebaseJs "quantidadeConferida" "js/sistema-2.js deve carregar/salvar quantidade conferida."
Assert-Contains $sistemaFirebaseJs "conferidoPor" "js/sistema-2.js deve registrar responsavel pela conferencia."
Assert-Contains $sistemaFirebaseJs "divergencia" "js/sistema-2.js deve registrar divergencia da conferencia."
Assert-Contains $sistemaFirebaseJs 'empresas/${token}/expedicoes' "js/sistema-2.js deve persistir Expedicao no escopo da empresa."
Assert-Contains $sistemaFirebaseJs "firebaseSalvarChecklistOperador" "js/sistema-2.js deve expor salvamento Firebase do Checklist do Operador."
Assert-Contains $sistemaFirebaseJs "checklistsOperador" "js/sistema-2.js deve persistir Checklist do Operador no escopo da empresa."
Assert-Contains $sistemaFirebaseJs "firebaseCriarUsuarioEmpresa" "js/sistema-2.js deve expor funcao de criacao de usuario da empresa."
Assert-Contains $sistemaFirebaseJs "firebaseRemoverUsuarioEmpresa" "js/sistema-2.js deve expor funcao de remocao de usuario da empresa."
Assert-Contains $sistemaFirebaseJs "firebaseEditarUsuarioEmpresa" "js/sistema-2.js deve expor funcao de edicao de usuario da empresa."
Assert-Contains $sistemaFirebaseJs "auditoriaUsuarios" "js/sistema-2.js deve registrar remocao em log de auditoria."
Assert-Contains $sistemaFirebaseJs "edicao_usuario" "js/sistema-2.js deve registrar edicao em log de auditoria."
Assert-Contains $sistemaFirebaseJs "AUDITORIA_USUARIOS" "js/sistema-2.js deve carregar logs de auditoria para a tela."
Assert-Contains $sistemaFirebaseJs 'update(ref(db, `usuarios/${uid}`)' "js/sistema-2.js deve atualizar dados do usuario editado."
Assert-Contains $sistemaFirebaseJs 'set(ref(db, `cargos/${uid}`)' "js/sistema-2.js deve atualizar cargo do usuario editado."
Assert-Contains $sistemaFirebaseJs 'remove(ref(db, `usuarios/' "js/sistema-2.js deve remover o vinculo do usuario removido."
Assert-Contains $sistemaFirebaseJs 'remove(ref(db, `cargos/' "js/sistema-2.js deve remover o cargo do usuario removido."
Assert-Contains $sistemaFirebaseJs "limiteUsuarios" "js/sistema-2.js deve carregar limite de usuarios da assinatura."
Assert-Contains $sistemaFirebaseJs "usuarioAtualSessao" "js/sistema-2.js deve monitorar se o usuario logado foi removido."
Assert-Contains $sistemaFirebaseJs "usuariosEmpresa" "js/sistema-2.js deve carregar usuarios da empresa."
Assert-Contains $loginFirebaseJs "dados.status && dados.status !== 'ativo'" "login-2.js deve bloquear login de usuario inativo/removido."
Assert-Contains $mobileSistema 'id="mobileExpedicoesGrid"' "mobile_qr deve ter lista compacta de Expedicao."
Assert-NotContains $mobileSistema "Modulo de expedicao em desenvolvimento" "mobile_qr nao deve manter placeholder de Expedicao."
Assert-Contains $mobileSistemaJs "renderMobileExpedicao" "mobile_qr/js/sistema.js deve renderizar Expedicao mobile."
Assert-Contains $mobileSistemaJs "quantidadeConferida" "mobile_qr/js/sistema.js deve exibir quantidade conferida."
Assert-Contains $mobileSistemaCss ".mobile-expedicao-card" "mobile_qr/css/mobile-demo.css deve estilizar cards de Expedicao."
Assert-Contains $mobileSistemaCss ".mobile-expedicao-conferencia" "mobile_qr/css/mobile-demo.css deve estilizar conferencia no mobile."

Write-Host "Fluxo de cadastro, usuarios e expedicao validado."
