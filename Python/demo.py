import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3
from datetime import datetime, timedelta

# --- Configurações Globais ---
DB_NAME = "producao.db"

# --- 💾 Camada de Banco de Dados ---

def conectar_db():
    try:
        conexao = sqlite3.connect(
            DB_NAME, 
            detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES
        )
        conexao.row_factory = sqlite3.Row 
        return conexao
    except sqlite3.Error as e:
        print(f"Erro Crítico DB: {e}")
        return None

def inicializar_db():
    """Inicializa tabelas e insere dados de demonstração."""
    conexao = conectar_db()
    if not conexao: return
    cursor = conexao.cursor()
    
    # Tabelas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS usuarios (
        usuario TEXT PRIMARY KEY,
        senha TEXT NOT NULL,
        perfil TEXT NOT NULL
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS motivos_parada (
        motivo TEXT PRIMARY KEY
    )""")

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ordens_producao (
        op TEXT PRIMARY KEY,
        produto TEXT NOT NULL,
        planejado INTEGER NOT NULL,
        maquina TEXT NOT NULL,
        meta_hora INTEGER NOT NULL,
        produzido INTEGER DEFAULT 0,
        status TEXT NOT NULL, 
        inicio_producao TIMESTAMP
    )""")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS paradas_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        op TEXT NOT NULL,
        motivo TEXT NOT NULL,
        inicio TIMESTAMP NOT NULL,
        fim TIMESTAMP,
        duracao_seg INTEGER DEFAULT 0,
        operador TEXT
    )""")
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maquinas_status (
        maquina TEXT PRIMARY KEY,
        status TEXT NOT NULL
    )""")
    
    # Dados Seed (Apenas se vazio)
    cursor.execute("SELECT 1 FROM usuarios LIMIT 1")
    if not cursor.fetchone():
        # Usuários Padrão
        cursor.executemany("INSERT INTO usuarios VALUES (?, ?, ?)", [
            ("operador", "123", "OPERADOR"),
            ("gestor", "123", "GESTOR"),
            ("admin", "123", "ADMIN"),
        ])
        
        # Motivos
        cursor.executemany("INSERT INTO motivos_parada VALUES (?)", [
            ("Falta de Material",), ("Manutenção Mecânica",), 
            ("Ajuste de Setup",), ("Horário de Refeição",)
        ])
        
        # OPs de Demonstração
        agora = datetime.now()
        cursor.execute("INSERT INTO ordens_producao VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            ("OP-DEMO-01", "Peça X (Demo)", 1000, "Linha A", 200, 450, "PRODUZINDO", agora - timedelta(hours=2, minutes=15)))
        
        cursor.execute("INSERT INTO ordens_producao VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            ("OP-DEMO-02", "Peça Y (Futura)", 500, "Linha B", 100, 0, "PENDENTE", None))

        # Status Máquinas
        cursor.execute("INSERT OR REPLACE INTO maquinas_status VALUES (?, ?)", ("Linha A", "PRODUZINDO"))
        cursor.execute("INSERT OR REPLACE INTO maquinas_status VALUES (?, ?)", ("Linha B", "LIVRE"))
        
        conexao.commit()
    
    conexao.close()

# --- 🖥️ Interface Gráfica (GUI) ---

class AplicacaoProducao(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("AriLine - Sistema de Controle Industrial")
        self.geometry("900x650")
        
        # Estilos
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("Header.TFrame", background="#2C3E50") 
        style.configure("Footer.TFrame", background="#BDC3C7")
        style.configure("Card.TFrame", background="#ECF0F1", relief="raised")

        inicializar_db()
        self.usuario_logado = None
        self.perfil_usuario = None
        
        self.container = ttk.Frame(self)
        self.container.pack(fill="both", expand=True)
        
        self.mostrar_tela_login()

    def limpar_tela(self):
        for widget in self.container.winfo_children():
            widget.destroy()

    def realizar_login(self, usuario, senha):
        conexao = conectar_db()
        cursor = conexao.cursor()
        cursor.execute("SELECT perfil, senha FROM usuarios WHERE usuario = ?", (usuario,))
        resultado = cursor.fetchone()
        conexao.close()

        if resultado and resultado['senha'] == senha:
            self.usuario_logado = usuario
            self.perfil_usuario = resultado['perfil']
            
            if self.perfil_usuario == "OPERADOR":
                self.mostrar_tela_operador()
            elif self.perfil_usuario == "GESTOR":
                self.mostrar_painel_gestor()
            elif self.perfil_usuario == "ADMIN":
                self.mostrar_tela_cadastro()
        else:
            messagebox.showerror("Erro", "Credenciais inválidas.")

    def mostrar_tela_login(self):
        self.limpar_tela()
        TelaLogin(self.container, self).pack(fill="both", expand=True)

    def mostrar_tela_operador(self):
        self.limpar_tela()
        TelaOperador(self.container, self, self.usuario_logado).pack(fill="both", expand=True)

    def mostrar_painel_gestor(self):
        self.limpar_tela()
        PainelGestor(self.container, self).pack(fill="both", expand=True)

    def mostrar_tela_cadastro(self):
        self.limpar_tela()
        TelaCadastro(self.container, self).pack(fill="both", expand=True)

# --- TELA: LOGIN ---
class TelaLogin(ttk.Frame):
    def __init__(self, master, controller):
        super().__init__(master)
        self.controller = controller
        
        # Header Decorativo
        header = ttk.Frame(self, height=80, style="Header.TFrame")
        header.pack(fill="x")
        ttk.Label(header, text="AriLine Industrial", font=("Segoe UI", 24, "bold"), 
                  foreground="white", background="#2C3E50").place(relx=0.5, rely=0.5, anchor="center")

        # Caixa de Login
        card = ttk.Frame(self, padding=30, style="Card.TFrame")
        card.place(relx=0.5, rely=0.5, anchor="center")
        
        ttk.Label(card, text="Login de Acesso", font=("Segoe UI", 16)).pack(pady=10)
        
        ttk.Label(card, text="Usuário:").pack(anchor="w")
        self.user = ttk.Entry(card, width=30)
        self.user.pack(pady=5)
        
        ttk.Label(card, text="Senha:").pack(anchor="w")
        self.senha = ttk.Entry(card, width=30, show="*")
        self.senha.pack(pady=5)
        
        ttk.Button(card, text="ENTRAR", command=self._tentar_login).pack(pady=20, fill="x")
        
        # Dica de Demo
        lbl_dica = ttk.Label(self, text="Dica Demo: Use 'operador' / 'gestor' / 'admin' (Senha: 123)", foreground="gray")
        lbl_dica.pack(side="bottom", pady=10)

    def _tentar_login(self):
        self.controller.realizar_login(self.user.get(), self.senha.get())

# --- TELA: OPERADOR (Apontamento) ---
class TelaOperador(ttk.Frame):
    def __init__(self, master, controller, operador):
        super().__init__(master, padding=20)
        self.controller = controller
        self.operador = operador
        self.op_atual = None
        
        self._montar_layout()
        self.atualizar_interface() # Inicia o loop

    def _montar_layout(self):
        # Topo
        top_frame = ttk.Frame(self)
        top_frame.pack(fill="x", pady=(0, 20))
        ttk.Label(top_frame, text=f"Operador: {self.operador.upper()}", font=("Arial", 12, "bold")).pack(side="left")
        ttk.Button(top_frame, text="Sair", command=self.controller.mostrar_tela_login).pack(side="right")

        # Info OP
        self.info_frame = ttk.LabelFrame(self, text="Ordem de Produção Atual", padding=15)
        self.info_frame.pack(fill="x", pady=10)
        
        self.lbl_op = ttk.Label(self.info_frame, text="OP: --", font=("Arial", 14))
        self.lbl_op.grid(row=0, column=0, sticky="w", padx=20)
        
        self.lbl_status = ttk.Label(self.info_frame, text="STATUS: --", font=("Arial", 14, "bold"))
        self.lbl_status.grid(row=0, column=1, sticky="w", padx=20)
        
        self.lbl_meta = ttk.Label(self.info_frame, text="Meta/h: --", font=("Arial", 12))
        self.lbl_meta.grid(row=1, column=0, sticky="w", padx=20, pady=5)

        self.lbl_progresso = ttk.Label(self.info_frame, text="Produzido: 0/0", font=("Arial", 12))
        self.lbl_progresso.grid(row=1, column=1, sticky="w", padx=20, pady=5)
        
        # Barra de Progresso Visual
        self.progress_bar = ttk.Progressbar(self.info_frame, length=400, mode='determinate')
        self.progress_bar.grid(row=2, column=0, columnspan=2, pady=10, sticky="ew")

        # Botões Grandes
        btn_frame = ttk.Frame(self)
        btn_frame.pack(fill="both", expand=True, pady=20)
        
        self.btn_produzir = tk.Button(btn_frame, text="PRODUZIR (+1)", bg="#27ae60", fg="white", 
                                      font=("Arial", 16, "bold"), command=self.registrar_producao)
        self.btn_produzir.pack(side="left", fill="both", expand=True, padx=10)
        
        self.btn_parada = tk.Button(btn_frame, text="PARAR / VOLTAR", bg="#e67e22", fg="white", 
                                    font=("Arial", 16, "bold"), command=self.toggle_parada)
        self.btn_parada.pack(side="left", fill="both", expand=True, padx=10)

        # Seleção de OP (caso esteja livre)
        self.sel_frame = ttk.LabelFrame(self, text="Iniciar Nova OP", padding=10)
        self.sel_frame.pack(fill="x", pady=10)
        self.combo_ops = ttk.Combobox(self.sel_frame, state="readonly")
        self.combo_ops.pack(side="left", padx=10, fill="x", expand=True)
        ttk.Button(self.sel_frame, text="INICIAR", command=self.iniciar_op).pack(side="left")

    def atualizar_interface(self):
        # [BUG FIX] Impede erro se a tela for fechada
        if not self.winfo_exists(): return 

        conexao = conectar_db()
        cursor = conexao.cursor()
        
        # Busca OP Ativa
        cursor.execute("SELECT * FROM ordens_producao WHERE status IN ('PRODUZINDO', 'PARADA') LIMIT 1")
        op_data = cursor.fetchone()
        
        # Busca OPs Pendentes
        cursor.execute("SELECT op FROM ordens_producao WHERE status='PENDENTE'")
        ops_pendentes = [r['op'] for r in cursor.fetchall()]
        self.combo_ops['values'] = ops_pendentes

        if op_data:
            self.op_atual = op_data['op']
            self.lbl_op.config(text=f"OP: {op_data['op']} ({op_data['produto']})")
            
            # Status da Máquina
            cursor.execute("SELECT status FROM maquinas_status WHERE maquina=?", (op_data['maquina'],))
            status_maq = cursor.fetchone()['status']
            
            self.lbl_status.config(text=f"MÁQUINA: {status_maq}", foreground="red" if status_maq=="PARADA" else "green")
            self.lbl_meta.config(text=f"Meta: {op_data['meta_hora']}/h")
            self.lbl_progresso.config(text=f"Produzido: {op_data['produzido']} / {op_data['planejado']}")
            
            # Atualiza Barra
            pct = (op_data['produzido'] / op_data['planejado']) * 100 if op_data['planejado'] > 0 else 0
            self.progress_bar['value'] = pct

            # Logica dos Botões
            if status_maq == "PRODUZINDO":
                self.btn_produzir.config(state="normal", bg="#27ae60")
                self.btn_parada.config(text="APONTAR PARADA", bg="#c0392b")
                self.sel_frame.pack_forget() # Esconde seleção
            else: # PARADA
                self.btn_produzir.config(state="disabled", bg="gray")
                self.btn_parada.config(text="RETORNAR PRODUÇÃO", bg="#2980b9")
                self.sel_frame.pack_forget()

        else:
            # Nenhuma OP ativa
            self.op_atual = None
            self.lbl_op.config(text="AGUARDANDO INÍCIO DE OP")
            self.lbl_status.config(text="STATUS: LIVRE", foreground="blue")
            self.lbl_progresso.config(text="--")
            self.progress_bar['value'] = 0
            
            self.btn_produzir.config(state="disabled", bg="gray")
            self.btn_parada.config(state="disabled", bg="gray")
            self.sel_frame.pack(fill="x", pady=10) # Mostra seleção

        conexao.close()
        self.after(1000, self.atualizar_interface)

    def registrar_producao(self):
        if not self.op_atual: return
        conn = conectar_db()
        conn.execute("UPDATE ordens_producao SET produzido = produzido + 1 WHERE op=?", (self.op_atual,))
        conn.commit()
        conn.close()

    def iniciar_op(self):
        op = self.combo_ops.get()
        if not op: return
        conn = conectar_db()
        # Pega a máquina da OP
        maquina = conn.execute("SELECT maquina FROM ordens_producao WHERE op=?", (op,)).fetchone()[0]
        
        conn.execute("UPDATE ordens_producao SET status='PRODUZINDO', inicio_producao=? WHERE op=?", (datetime.now(), op))
        conn.execute("UPDATE maquinas_status SET status='PRODUZINDO' WHERE maquina=?", (maquina,))
        conn.commit()
        conn.close()

    def toggle_parada(self):
        if not self.op_atual: return
        
        conn = conectar_db()
        op_data = conn.execute("SELECT maquina FROM ordens_producao WHERE op=?", (self.op_atual,)).fetchone()
        maquina = op_data['maquina']
        
        # Verifica status atual
        status_atual = conn.execute("SELECT status FROM maquinas_status WHERE maquina=?", (maquina,)).fetchone()[0]
        
        if status_atual == "PRODUZINDO":
            # Vai Parar -> Pede Motivo Simples
            motivo = "Manutenção (Demo)" # Simplificação para demo
            conn.execute("INSERT INTO paradas_log (op, motivo, inicio, operador) VALUES (?, ?, ?, ?)", 
                         (self.op_atual, motivo, datetime.now(), self.operador))
            conn.execute("UPDATE maquinas_status SET status='PARADA' WHERE maquina=?", (maquina,))
        else:
            # Vai Voltar
            # Fecha parada aberta
            conn.execute("""UPDATE paradas_log SET fim=?, duracao_seg=(strftime('%s',?) - strftime('%s', inicio)) 
                            WHERE op=? AND fim IS NULL""", (datetime.now(), datetime.now(), self.op_atual))
            conn.execute("UPDATE maquinas_status SET status='PRODUZINDO' WHERE maquina=?", (maquina,))
            
        conn.commit()
        conn.close()

# --- TELA: GESTOR (Dashboard) ---
class PainelGestor(ttk.Frame):
    def __init__(self, master, controller):
        super().__init__(master, padding=20)
        self.controller = controller
        
        header = ttk.Frame(self)
        header.pack(fill="x")
        ttk.Label(header, text="Dashboard Gerencial (Tempo Real)", font=("Arial", 18, "bold")).pack(side="left")
        ttk.Button(header, text="Sair", command=self.controller.mostrar_tela_login).pack(side="right")
        
        # Area da Tabela
        self.tree = ttk.Treeview(self, columns=("op", "prod", "plan", "meta", "oee", "status"), show="headings", height=15)
        self.tree.heading("op", text="OP")
        self.tree.heading("prod", text="Realizado")
        self.tree.heading("plan", text="Planejado")
        self.tree.heading("meta", text="Meta/h")
        self.tree.heading("oee", text="OEE (%)")
        self.tree.heading("status", text="Status")
        
        self.tree.column("op", width=120)
        self.tree.column("prod", width=80, anchor="center")
        self.tree.column("oee", width=80, anchor="center")
        
        self.tree.pack(fill="both", expand=True, pady=15)
        
        self.atualizar_dashboard()

    def calcular_oee(self, op_row):
        if op_row['status'] != 'PRODUZINDO' or not op_row['inicio_producao']:
            return 0.0
            
        inicio = op_row['inicio_producao']
        agora = datetime.now()
        horas_totais = (agora - inicio).total_seconds() / 3600
        
        if horas_totais < 0.01: return 100.0 # Evita erro no inicio
        
        esperado = horas_totais * op_row['meta_hora']
        if esperado == 0: return 0.0
        
        oee = (op_row['produzido'] / esperado) * 100
        return min(oee, 100.0) # Cap em 100%

    def atualizar_dashboard(self):
        if not self.winfo_exists(): return

        conn = conectar_db()
        cursor = conn.cursor()
        ops = cursor.execute("SELECT * FROM ordens_producao").fetchall()
        conn.close()
        
        # Limpa tabela
        for i in self.tree.get_children():
            self.tree.delete(i)
            
        for op in ops:
            oee_val = self.calcular_oee(op)
            status_tag = op['status']
            
            self.tree.insert("", "end", values=(
                op['op'], 
                op['produzido'], 
                op['planejado'], 
                op['meta_hora'],
                f"{oee_val:.1f}%",
                op['status']
            ))
            
        self.after(2000, self.atualizar_dashboard)

# --- TELA: ADMIN (Cadastro Simples) ---
class TelaCadastro(ttk.Frame):
    def __init__(self, master, controller):
        super().__init__(master, padding=20)
        self.controller = controller
        
        ttk.Label(self, text="Administração", font=("Arial", 16)).pack(pady=10)
        
        info = "Nesta tela, o Admin cadastraria novas OPs, Motivos de Parada e Usuários.\n\n(Funcionalidade simplificada para esta demo)"
        ttk.Label(self, text=info).pack(pady=20)
        
        ttk.Button(self, text="Voltar para Login", command=self.controller.mostrar_tela_login).pack()

if __name__ == "__main__":
    app = AplicacaoProducao()
    app.mainloop()