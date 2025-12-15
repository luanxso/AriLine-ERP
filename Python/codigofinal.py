import tkinter as tk
from tkinter import ttk, messagebox
import sqlite3
from datetime import datetime, timedelta

DB_NAME = "producao.db"

def conectar_db():
    try:
        conexao = sqlite3.connect(
            DB_NAME, 
            detect_types=sqlite3.PARSE_DECLTYPES | sqlite3.PARSE_COLNAMES
        )
        conexao.row_factory = sqlite3.Row 
        return conexao
    except sqlite3.Error as e:
        print(f"Erro ao conectar ao banco de dados: {e}")
        return None

def inicializar_db():
    conexao = conectar_db()
    if not conexao:
        return

    cursor = conexao.cursor()
    
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
    
    conexao.commit()

    cursor.execute("SELECT 1 FROM usuarios LIMIT 1")
    if not cursor.fetchone():
        
        usuarios_iniciais = [
            ("operador", "123", "OPERADOR"),
            ("gestor", "123", "GESTOR"),
            ("admin", "123", "ADMIN"),
        ]
        cursor.executemany("INSERT OR IGNORE INTO usuarios (usuario, senha, perfil) VALUES (?, ?, ?)", usuarios_iniciais)

        motivos_iniciais = [
            ("Falta de matéria-prima",), ("Manutenção não planejada",), 
            ("Troca de ferramenta",), ("Ajuste de máquina",), ("Outros",)
        ]
        cursor.executemany("INSERT OR IGNORE INTO motivos_parada (motivo) VALUES (?)", motivos_iniciais)
        
        inicio_op1 = datetime.now() - timedelta(hours=3, minutes=30)
        inicio_op2 = datetime.now() - timedelta(hours=1, minutes=15)
        
        cursor.execute(
            "INSERT INTO ordens_producao (op, produto, planejado, maquina, meta_hora, produzido, status, inicio_producao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            ("OP-2025-001", "Chapa A", 500, "Linha 1", 100, 350, "PRODUZINDO", inicio_op1)
        )
        cursor.execute(
            "INSERT INTO ordens_producao (op, produto, planejado, maquina, meta_hora, produzido, status, inicio_producao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            ("OP-2025-002", "Perfil B", 800, "Linha 2", 150, 0, "PENDENTE", None)
        )
        
        cursor.execute("INSERT OR REPLACE INTO maquinas_status (maquina, status) VALUES (?, ?)", ("Linha 1", "PRODUZINDO"))
        cursor.execute("INSERT OR REPLACE INTO maquinas_status (maquina, status) VALUES (?, ?)", ("Linha 2", "LIVRE"))
        cursor.execute("INSERT OR REPLACE INTO maquinas_status (maquina, status) VALUES (?, ?)", ("Linha 3", "LIVRE"))
        
        conexao.commit()
    
    conexao.close()

class AplicacaoProducao(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Sistema de Controle de Produção Industrial (AriLine)")
        self.geometry("800x600")
        
        style = ttk.Style()
        style.configure("Header.TFrame", background="#2C3E50")
        style.configure("Footer.TFrame", background="#BDC3C7")

        inicializar_db()
        
        self.protocol("WM_DELETE_WINDOW", self._on_closing)

        self.usuario_logado = None
        self.perfil_usuario = None
        
        self.container = ttk.Frame(self)
        self.container.pack(fill="both", expand=True)
        
        self.mostrar_tela_login()
        
    def _on_closing(self):
        self.destroy()

    def limpar_tela(self):
        for widget in self.container.winfo_children():
            widget.destroy()

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

    def realizar_login(self, usuario, senha):
        conexao = conectar_db()
        if not conexao: return False
        cursor = conexao.cursor()
        
        sql = "SELECT perfil, senha FROM usuarios WHERE usuario = ?"
        cursor.execute(sql, (usuario,))
        resultado = cursor.fetchone()
        
        conexao.close()

        if resultado and resultado['senha'] == senha:
            self.usuario_logado = usuario
            self.perfil_usuario = resultado['perfil']
            messagebox.showinfo("Sucesso", f"Bem-vindo(a), {usuario} ({self.perfil_usuario})")
            
            if self.perfil_usuario == "OPERADOR":
                self.mostrar_tela_operador()
            elif self.perfil_usuario == "GESTOR":
                self.mostrar_painel_gestor()
            elif self.perfil_usuario == "ADMIN":
                self.mostrar_tela_cadastro()
            return True
        else:
            messagebox.showerror("Erro de Login", "Usuário ou senha incorretos.")
            return False

class TelaLogin(ttk.Frame):
    def __init__(self, master, app_controller):
        super().__init__(master) 
        self.app_controller = app_controller
        self.criar_widgets()

    def criar_widgets(self):
        
        header_frame = ttk.Frame(self, height=50, style="Header.TFrame") 
        header_frame.pack(side="top", fill="x")
        
        ttk.Label(header_frame, text="Sistema de Controle de Produção Industrial - AriLine", 
                  font=("Arial", 14, "bold"), foreground="white", 
                  background="#2C3E50").pack(pady=10)

        footer_frame = ttk.Frame(self, height=30, style="Footer.TFrame")
        footer_frame.pack(side="bottom", fill="x")
        
        ttk.Label(footer_frame, 
                  font=("Arial", 8), background="#BDC3C7").pack(pady=5)

        content_frame = ttk.Frame(self)
        content_frame.pack(fill="both", expand=True) 
        
        login_block_frame = ttk.Frame(content_frame)
        login_block_frame.place(relx=0.5, rely=0.5, anchor="center") 
        
        ttk.Label(login_block_frame, text="Acesso ao Sistema", font=("Arial", 24, "bold")).pack(pady=(10, 20))
        
        form_frame = ttk.Frame(login_block_frame)
        form_frame.pack(pady=10)
        
        ttk.Label(form_frame, text="Usuário:").grid(row=0, column=0, padx=5, pady=5, sticky="w")
        self.user_entry = ttk.Entry(form_frame, width=30)
        self.user_entry.grid(row=0, column=1, padx=5, pady=5)
        
        ttk.Label(form_frame, text="Senha:").grid(row=1, column=0, padx=5, pady=5, sticky="w")
        self.pass_entry = ttk.Entry(form_frame, width=30, show="*")
        self.pass_entry.grid(row=1, column=1, padx=5, pady=5)
        
        login_btn = ttk.Button(login_block_frame, text="Entrar", command=self._login, width=20)
        login_btn.pack(pady=(15, 0))


    def _login(self):
        usuario = self.user_entry.get()
        senha = self.pass_entry.get()
        self.app_controller.realizar_login(usuario, senha)

class TelaOperador(ttk.Frame):
    def __init__(self, master, app_controller, operador):
        super().__init__(master, padding="20")
        self.app_controller = app_controller
        self.operador = operador
        
        self.op_atual = self._encontrar_op_ativa()
        self.status_maquina = self._get_maquina_status_db(self.op_atual)
        
        self.criar_widgets()
        self.atualizar_interface()

    def _get_op_data_db(self, op):
        conexao = conectar_db()
        if not conexao:
            return None
        cursor = conexao.cursor()
        
        sql = "SELECT * FROM ordens_producao WHERE op = ?"
        cursor.execute(sql, (op,))
        resultado = cursor.fetchone()
        
        conexao.close()
        return dict(resultado) if resultado else None 

    def _get_status_by_maquina_name(self, maquina_nome):
        conexao = conectar_db()
        if not conexao:
            return "LIVRE"
        cursor = conexao.cursor()
        
        sql = "SELECT status FROM maquinas_status WHERE maquina = ?"
        cursor.execute(sql, (maquina_nome,))
        resultado = cursor.fetchone()
        
        conexao.close()
        return resultado['status'] if resultado else "LIVRE"

    def _get_maquina_status_db(self, op_atual):
        conexao = conectar_db()
        if not conexao: return "LIVRE"
        cursor = conexao.cursor()
        
        status = "LIVRE"
        
        if op_atual:
            op_data = self._get_op_data_db(op_atual)
            if op_data:
                sql = "SELECT status FROM maquinas_status WHERE maquina = ?"
                cursor.execute(sql, (op_data['maquina'],))
                resultado = cursor.fetchone()
                status = resultado['status'] if resultado else "LIVRE"
        
        conexao.close()
        return status

    def _encontrar_op_ativa(self):
        conexao = conectar_db()
        if not conexao:
            return None
        cursor = conexao.cursor()
        
        sql = "SELECT op FROM ordens_producao WHERE status = 'PRODUZINDO' LIMIT 1"
        cursor.execute(sql)
        resultado = cursor.fetchone()
        
        conexao.close()
        return resultado['op'] if resultado else None

    def _get_op_pendentes(self):
        conexao = conectar_db()
        if not conexao:
            return []
        cursor = conexao.cursor()
        
        sql = "SELECT op FROM ordens_producao WHERE status = 'PENDENTE'"
        cursor.execute(sql)
        resultados = cursor.fetchall()
        
        conexao.close()
        return [r['op'] for r in resultados]

    def criar_widgets(self):
        ttk.Label(self, text=f"Terminal de Apontamento", font=("Arial", 18, "bold")).pack(pady=10)

        status_frame = ttk.LabelFrame(self, text="Status Atual", padding="10")
        status_frame.pack(fill="x", pady=10)

        self.op_var = tk.StringVar()
        
        self.lbl_op = ttk.Label(status_frame, text="OP: N/A", font=("Arial", 12))
        self.lbl_op.grid(row=0, column=0, padx=5, pady=5, sticky="w")
        
        self.lbl_produto = ttk.Label(status_frame, text="Produto: N/A", font=("Arial", 12))
        self.lbl_produto.grid(row=1, column=0, padx=5, pady=5, sticky="w")
        
        self.lbl_maquina = ttk.Label(status_frame, text="Máquina: N/A", font=("Arial", 12))
        self.lbl_maquina.grid(row=0, column=1, padx=5, pady=5, sticky="w")
        
        self.lbl_status = ttk.Label(status_frame, text="Status: LIVRE", font=("Arial", 12, "bold"), foreground="blue")
        self.lbl_status.grid(row=1, column=1, padx=5, pady=5, sticky="w")
        
        self.lbl_progresso = ttk.Label(status_frame, text="Progresso: 0 / 0 (0%)", font=("Arial", 12))
        self.lbl_progresso.grid(row=2, column=0, padx=5, pady=5, sticky="w", columnspan=2)
    

        op_frame = ttk.LabelFrame(self, text="Iniciar Nova OP", padding="10")
        op_frame.pack(fill="x", pady=10)
        
        ttk.Label(op_frame, text="Selecione a OP:").pack(side="left", padx=5)
        self.op_dropdown = ttk.Combobox(op_frame, textvariable=self.op_var, state="readonly", width=25)
        self.op_dropdown['values'] = self._get_op_pendentes()
        self.op_dropdown.pack(side="left", padx=5)
        
        self.btn_iniciar = ttk.Button(op_frame, text="Iniciar Produção", command=self.iniciar_op)
        self.btn_iniciar.pack(side="left", padx=10)

        acoes_frame = ttk.Frame(self)
        acoes_frame.pack(pady=20)
        
        self.btn_produzir = tk.Button(acoes_frame, text="+1 Unidade Produzida", command=self.registrar_producao, 
                                      font=("Arial", 14, "bold"), bg="#4CAF50", fg="white", height=3, width=25)
        self.btn_produzir.grid(row=0, column=0, padx=10, pady=10)
        
        self.btn_parada = tk.Button(acoes_frame, text="Apontar Parada", command=self.apontar_parada, 
                                    font=("Arial", 14, "bold"), bg="#FF9800", fg="white", height=3, width=25)
        self.btn_parada.grid(row=0, column=1, padx=10, pady=10)
        
        self.btn_finalizar = tk.Button(acoes_frame, text="Finalizar OP", command=self.finalizar_op, 
                                       font=("Arial", 14, "bold"), bg="#F44336", fg="white", height=3, width=25)
        self.btn_finalizar.grid(row=1, column=0, columnspan=2, padx=10, pady=10, sticky="ew")

        ttk.Button(self, text="Sair / Voltar para Login", command=self.app_controller.mostrar_tela_login).pack(pady=20)


    def _calcular_oee_simulado(self, op_data):
        if op_data["status"] != "PRODUZINDO" or op_data.get("inicio_producao") is None:
            return "N/A"

        produzido = op_data["produzido"]
        meta_hora = op_data["meta_hora"]
        inicio_producao = op_data["inicio_producao"]
        tempo_decorrido = (datetime.now() - inicio_producao).total_seconds() / 3600

        conexao = conectar_db()
        if not conexao: return "0.0%"
        cursor = conexao.cursor()

        sql_paradas = "SELECT SUM(duracao_seg) AS total_parado FROM paradas_log WHERE op = ? AND fim IS NOT NULL"
        cursor.execute(sql_paradas, (op_data['op'],))
        resultado_parada = cursor.fetchone()
        tempo_parado_seg = resultado_parada['total_parado'] or 0

        sql_parada_aberta = "SELECT inicio FROM paradas_log WHERE op = ? AND fim IS NULL ORDER BY id DESC LIMIT 1"
        cursor.execute(sql_parada_aberta, (op_data['op'],))
        parada_aberta = cursor.fetchone()
        if parada_aberta:
            tempo_parado_seg += (datetime.now() - parada_aberta['inicio']).total_seconds()

        conexao.close()

        tempo_operacional_hr = (tempo_decorrido * 3600 - tempo_parado_seg) / 3600

        if tempo_operacional_hr <= 0:
            return "0.0%"

        quantidade_esperada = tempo_operacional_hr * meta_hora
        
        performance = (produzido / quantidade_esperada) if quantidade_esperada > 0 else 0
        
        oee = performance * 100
        
        return f"{min(oee, 100):.1f}%"

    def atualizar_interface(self):
        self.op_atual = self._encontrar_op_ativa()
        self.status_maquina = self._get_maquina_status_db(self.op_atual)
        op_data = self._get_op_data_db(self.op_atual)
        
        if self.op_atual and op_data:
            self.lbl_op.config(text=f"OP: {op_data['op']}")
            self.lbl_produto.config(text=f"Produto: {op_data['produto']}")
            self.lbl_maquina.config(text=f"Máquina: {op_data['maquina']}")
            
            status_text = f"Status: {op_data['status']}"
            cor = "green" if self.status_maquina == "PRODUZINDO" else "red"
            self.lbl_status.config(text=status_text, foreground=cor)
            
            progresso_percent = (op_data['produzido'] / op_data['planejado']) * 100
            self.lbl_progresso.config(text=f"Progresso: {op_data['produzido']} / {op_data['planejado']} ({progresso_percent:.1f}%)")
        
            self.op_var.set(self.op_atual)
            self.op_dropdown.config(state='disabled', values=[self.op_atual])
            self.btn_iniciar.config(state='disabled')
            
        else:
            self.lbl_op.config(text="OP: N/A")
            self.lbl_produto.config(text="Produto: N/A")
            
            maquina_livre = "Linha 2"
            self.lbl_maquina.config(text=f"Máquina: {maquina_livre}")
            self.lbl_status.config(text="Status: LIVRE", foreground="blue")
            self.lbl_progresso.config(text="Progresso: 0 / 0 (0%)")
            
            op_pendentes = self._get_op_pendentes()
            self.op_dropdown.config(values=op_pendentes, state='readonly') 
            
            current_selection = self.op_var.get()
            if current_selection not in op_pendentes:
                 self.op_var.set("")
            
            self.btn_iniciar.config(state='normal' if op_pendentes else 'disabled') 
            
        if self.status_maquina == "PRODUZINDO":
            self.btn_produzir.config(state="normal", text="Apontar Unidade Produzida", bg="#4CAF50")
            self.btn_parada.config(state="normal", text="Apontar Parada", bg="#FF9800")
            self.btn_finalizar.config(state="normal", bg="#F44336")
        elif self.status_maquina == "PARADA":
            self.btn_produzir.config(state="disabled", text="Máquina Parada", bg="gray")
            self.btn_parada.config(state="normal", text="Retornar Produção", bg="#2196F3")
            self.btn_finalizar.config(state="disabled", bg="gray")
        else:
            self.btn_produzir.config(state="disabled", text="Selecione uma OP", bg="gray")
            self.btn_parada.config(state="disabled", text="Apontar Parada", bg="gray")
            self.btn_finalizar.config(state="disabled", bg="gray")
            
        self.after(1000, self.atualizar_interface)

    def iniciar_op(self):
        
        op = self.op_var.get()
        if not op:
            messagebox.showwarning("Atenção", "Selecione uma Ordem de Produção.")
            return

        op_data = self._get_op_data_db(op)
        maquina = op_data['maquina']

        status_maquina_alvo = self._get_status_by_maquina_name(maquina)
        
        if status_maquina_alvo != "LIVRE":
            messagebox.showwarning("Atenção", f"A máquina '{maquina}' está {status_maquina_alvo} e não pode iniciar esta OP.")
            return

        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        agora = datetime.now()

        sql_op = "UPDATE ordens_producao SET status = 'PRODUZINDO', inicio_producao = ? WHERE op = ?"
        cursor.execute(sql_op, (agora, op))

        sql_maquina = "INSERT OR REPLACE INTO maquinas_status (maquina, status) VALUES (?, ?)"
        cursor.execute(sql_maquina, (maquina, "PRODUZINDO"))

        conexao.commit()
        conexao.close()
        
        messagebox.showinfo("Iniciado", f"Produção da OP {op} iniciada na {maquina}.")
        self.op_atual = op
        self.atualizar_interface()

    def registrar_producao(self):
        if self.status_maquina != "PRODUZINDO":
            messagebox.showwarning("Atenção", "A máquina não está em produção (está PARADA ou LIVRE).")
            return

        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        sql = "UPDATE ordens_producao SET produzido = produzido + 1 WHERE op = ?"
        cursor.execute(sql, (self.op_atual,))
        
        op_data = self._get_op_data_db(self.op_atual)
        if op_data and op_data['produzido'] >= op_data['planejado']:
             messagebox.showwarning("Atenção", f"OP {self.op_atual} atingiu ou excedeu a quantidade planejada! Considere finalizar.")

        conexao.commit()
        conexao.close()
        self.atualizar_interface()

    def apontar_parada(self):
        if self.status_maquina == "PRODUZINDO":
            self._abrir_janela_parada()
        elif self.status_maquina == "PARADA":
            self.retornar_producao()
        else:
            messagebox.showwarning("Atenção", "Nenhuma OP em andamento para apontar parada.")

    def _abrir_janela_parada(self):
        parada_window = tk.Toplevel(self)
        parada_window.title("Apontar Parada")
        parada_window.geometry("350x200")
        parada_window.transient(self)
        parada_window.grab_set()

        ttk.Label(parada_window, text="Selecione o Motivo:", font=("Arial", 12, "bold")).pack(pady=10)
        
        motivo_var = tk.StringVar()
        motivo_dropdown = ttk.Combobox(parada_window, textvariable=motivo_var, state="readonly", width=35)
        
        conexao = conectar_db()
        cursor = conexao.cursor()
        motivos_db = cursor.execute("SELECT motivo FROM motivos_parada").fetchall()
        conexao.close()
        
        motivo_dropdown['values'] = [r['motivo'] for r in motivos_db]
        motivo_dropdown.pack(pady=5, padx=10)
        motivo_dropdown.current(0)

        def confirmar_parada():
            motivo = motivo_var.get()
            if not motivo:
                messagebox.showwarning("Atenção", "Selecione um motivo antes de confirmar.", parent=parada_window)
                return
            self._registrar_parada(motivo)
            parada_window.destroy()

        ttk.Button(parada_window, text="Confirmar Parada", command=confirmar_parada).pack(pady=15)

    def _registrar_parada(self, motivo):
        op_data = self._get_op_data_db(self.op_atual)
        maquina = op_data['maquina']
        agora = datetime.now()

        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        sql_maquina = "INSERT OR REPLACE INTO maquinas_status (maquina, status) VALUES (?, ?)"
        cursor.execute(sql_maquina, (maquina, "PARADA"))

        sql_log = "INSERT INTO paradas_log (op, motivo, inicio, operador) VALUES (?, ?, ?, ?)"
        cursor.execute(sql_log, (self.op_atual, motivo, agora, self.operador))

        conexao.commit()
        conexao.close()
        
        messagebox.showinfo("Parada Registrada", f"Parada da {maquina} registrada por motivo: {motivo}")
        self.atualizar_interface()

    def retornar_producao(self):
        if not self.op_atual: return

        op_data = self._get_op_data_db(self.op_atual)
        maquina = op_data['maquina']
        agora = datetime.now()

        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        sql_maquina = "INSERT OR REPLACE INTO maquinas_status (maquina, status) VALUES (?, ?)"
        cursor.execute(sql_maquina, (maquina, "PRODUZINDO"))

        sql_select_log = "SELECT id, inicio FROM paradas_log WHERE op = ? AND fim IS NULL ORDER BY id DESC LIMIT 1"
        cursor.execute(sql_select_log, (self.op_atual,))
        log_recente = cursor.fetchone()

        if log_recente:
            inicio = log_recente['inicio']
            duracao = (agora - inicio).total_seconds()
            
            sql_update_log = "UPDATE paradas_log SET fim = ?, duracao_seg = ? WHERE id = ?"
            cursor.execute(sql_update_log, (agora, round(duracao), log_recente['id']))
            
            conexao.commit()
            messagebox.showinfo("Retorno", f"Máquina {maquina} Retornou à Produção. Duração da Parada: {round(duracao/60, 1)} minutos.")
        else:
            conexao.commit()
            messagebox.showinfo("Retorno", f"Máquina {maquina} Retornou à Produção.")

        conexao.close()
        self.atualizar_interface()

    def finalizar_op(self):
        if not self.op_atual:
            messagebox.showwarning("Atenção", "Nenhuma OP em andamento para finalizar.")
            return

        op_data = self._get_op_data_db(self.op_atual)
        maquina = op_data['maquina']

        if self.status_maquina == "PARADA":
            messagebox.showerror("Erro", "Não é possível finalizar a OP enquanto a máquina estiver em PARADA.")
            return
            
        if not messagebox.askyesno("Confirmar Finalização", f"Tem certeza que deseja finalizar a OP {self.op_atual}?"):
            return

        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        sql_op = "UPDATE ordens_producao SET status = 'FINALIZADA' WHERE op = ?"
        cursor.execute(sql_op, (self.op_atual,))

        sql_maquina = "INSERT OR REPLACE INTO maquinas_status (maquina, status) VALUES (?, ?)"
        cursor.execute(sql_maquina, (maquina, "LIVRE"))

        conexao.commit()
        conexao.close()

        messagebox.showinfo("Finalização", f"OP {self.op_atual} finalizada com sucesso! Produzido total: {op_data['produzido']}")
        self.op_atual = None
        self.atualizar_interface()

class PainelGestor(ttk.Frame):
    def __init__(self, master, app_controller):
        super().__init__(master, padding="20")
        self.app_controller = app_controller
        self.criar_widgets()
        self.atualizar_dados()
        self.after(3000, self.atualizar_dados_periodicamente)

    def _calcular_oee_simulado(self, op_data):
        if op_data["status"] != "PRODUZINDO" or op_data.get("inicio_producao") is None:
            return "N/A"

        produzido = op_data["produzido"]
        meta_hora = op_data["meta_hora"]
        inicio_producao = op_data["inicio_producao"]
        tempo_decorrido = (datetime.now() - inicio_producao).total_seconds() / 3600

        conexao = conectar_db()
        if not conexao: return "0.0%"
        cursor = conexao.cursor()

        sql_paradas = "SELECT SUM(duracao_seg) AS total_parado FROM paradas_log WHERE op = ? AND fim IS NOT NULL"
        cursor.execute(sql_paradas, (op_data['op'],))
        resultado_parada = cursor.fetchone()
        tempo_parado_seg = resultado_parada['total_parado'] or 0

        sql_parada_aberta = "SELECT inicio FROM paradas_log WHERE op = ? AND fim IS NULL ORDER BY id DESC LIMIT 1"
        cursor.execute(sql_parada_aberta, (op_data['op'],))
        parada_aberta = cursor.fetchone()
        if parada_aberta:
            tempo_parado_seg += (datetime.now() - parada_aberta['inicio']).total_seconds()

        conexao.close()

        tempo_operacional_hr = (tempo_decorrido * 3600 - tempo_parado_seg) / 3600

        if tempo_operacional_hr <= 0:
            return "0.0%"

        quantidade_esperada = tempo_operacional_hr * meta_hora
        
        performance = (produzido / quantidade_esperada) if quantidade_esperada > 0 else 0
        
        oee = performance * 100
        
        return f"{min(oee, 100):.1f}%"

    def atualizar_dados_periodicamente(self):
        self.atualizar_dados()
        self.after(3000, self.atualizar_dados_periodicamente)

    def criar_widgets(self):
        ttk.Label(self, text="Painel do Gestor - Produção em Tempo Real", font=("Arial", 20, "bold")).pack(pady=10)
        
        btn_frame = ttk.Frame(self)
        btn_frame.pack(fill="x", anchor="ne")
        ttk.Button(btn_frame, text="Sair / Voltar para Login", command=self.app_controller.mostrar_tela_login).pack(side="right", padx=5, pady=5)
        
        self.maquinas_frame = ttk.LabelFrame(self, text="Status das Máquinas", padding="10")
        self.maquinas_frame.pack(fill="x", pady=15)

        self.op_frame = ttk.LabelFrame(self, text="Progresso das Ordens de Produção", padding="10")
        self.op_frame.pack(fill="both", expand=True, pady=10)
        
        columns = ("op", "maquina", "produto", "planejado", "produzido", "status", "meta", "oee")
        self.tree = ttk.Treeview(self.op_frame, columns=columns, show="headings")

        self.tree.heading("op", text="OP")
        self.tree.heading("maquina", text="Máquina")
        self.tree.heading("produto", text="Produto")
        self.tree.heading("planejado", text="Planejado")
        self.tree.heading("produzido", text="Produzido")
        self.tree.heading("status", text="Status")
        self.tree.heading("meta", text="Meta/H")
        self.tree.heading("oee", text="OEE")
        
        self.tree.column("op", width=80, anchor=tk.CENTER)
        self.tree.column("maquina", width=80, anchor=tk.CENTER)
        self.tree.column("produto", width=100)
        self.tree.column("planejado", width=80, anchor=tk.CENTER)
        self.tree.column("produzido", width=80, anchor=tk.CENTER)
        self.tree.column("status", width=90, anchor=tk.CENTER)
        self.tree.column("meta", width=60, anchor=tk.CENTER)
        self.tree.column("oee", width=60, anchor=tk.CENTER)

        self.tree.pack(fill="both", expand=True)

    def atualizar_dados(self):
        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        for widget in self.maquinas_frame.winfo_children():
            widget.destroy()

        maquinas_db = cursor.execute("SELECT maquina, status FROM maquinas_status").fetchall()
        for row in maquinas_db:
            status = row['status']
            cor = "green" if status == "PRODUZINDO" else ("red" if status == "PARADA" else "blue")
            
            frame = ttk.Frame(self.maquinas_frame)
            frame.pack(side="left", padx=10, pady=5)
            
            ttk.Label(frame, text=f"{row['maquina']}:", font=("Arial", 10, "bold")).pack(side="left")
            ttk.Label(frame, text=status, font=("Arial", 10, "bold"), foreground=cor).pack(side="left", padx=5)

        for i in self.tree.get_children():
            self.tree.delete(i)

        ops_db = cursor.execute("SELECT * FROM ordens_producao").fetchall()
        conexao.close()
        
        for row in ops_db:
            op_data = dict(row)
            
            oee = self._calcular_oee_simulado(op_data)
            meta_display = f"{op_data['meta_hora']}/h"
            
            self.tree.insert("", "end", iid=op_data['op'], 
                             values=(op_data['op'], op_data['maquina'], op_data['produto'], 
                                     op_data['planejado'], op_data['produzido'], op_data['status'], 
                                     meta_display, oee))

class TelaCadastro(ttk.Frame):
    def __init__(self, master, app_controller):
        super().__init__(master, padding="20")
        self.app_controller = app_controller
        self.criar_widgets()

    def criar_widgets(self):
        ttk.Label(self, text="Administração e Cadastro", font=("Arial", 20, "bold")).pack(pady=10)
        
        notebook = ttk.Notebook(self)
        notebook.pack(pady=10, padx=10, fill="both", expand=True)

        op_tab = ttk.Frame(notebook, padding="10")
        self._criar_cadastro_op(op_tab)
        notebook.add(op_tab, text="Cadastrar OP")

        motivo_tab = ttk.Frame(notebook, padding="10")
        self._criar_cadastro_motivo(motivo_tab)
        notebook.add(motivo_tab, text="Motivos de Parada")
        
        btn_frame = ttk.Frame(self)
        btn_frame.pack(pady=10)
        
        ttk.Button(btn_frame, text="Visualizar Painel do Gestor", command=self.app_controller.mostrar_painel_gestor).pack(side="left", padx=10)
        
        ttk.Button(btn_frame, text="Sair / Voltar para Login", command=self.app_controller.mostrar_tela_login).pack(side="left", padx=10)

    def _criar_cadastro_op(self, master):
        form_frame = ttk.LabelFrame(master, text="Nova Ordem de Produção", padding="10")
        form_frame.pack(fill="x", pady=10)

        self.vars = {
            "op": tk.StringVar(),
            "produto": tk.StringVar(),
            "planejado": tk.StringVar(),
            "maquina": tk.StringVar(),
            "meta": tk.StringVar()
        }

        fields = [
            ("OP:", self.vars["op"]),
            ("Produto:", self.vars["produto"]),
            ("Quant. Planejada:", self.vars["planejado"]),
            ("Máquina/Linha:", self.vars["maquina"]),
            ("Meta por Hora:", self.vars["meta"])
        ]

        for i, (label_text, var) in enumerate(fields):
            ttk.Label(form_frame, text=label_text).grid(row=i, column=0, padx=5, pady=5, sticky="w")
            ttk.Entry(form_frame, textvariable=var, width=30).grid(row=i, column=1, padx=5, pady=5)

        ttk.Button(form_frame, text="Cadastrar OP", command=self.cadastrar_op).grid(row=len(fields), column=0, columnspan=2, pady=10)

    def cadastrar_op(self):
        op = self.vars["op"].get().strip()
        produto = self.vars["produto"].get().strip()
        planejado_str = self.vars["planejado"].get().strip()
        maquina = self.vars["maquina"].get().strip()
        meta_str = self.vars["meta"].get().strip()

        if not all([op, produto, planejado_str, maquina, meta_str]):
            messagebox.showerror("Erro", "Todos os campos devem ser preenchidos.")
            return

        try:
            planejado = int(planejado_str)
            meta = int(meta_str)
        except ValueError:
            messagebox.showerror("Erro", "Quantidade Planejada e Meta por Hora devem ser números inteiros.")
            return

        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        cursor.execute("SELECT 1 FROM ordens_producao WHERE op = ?", (op,))
        if cursor.fetchone():
            conexao.close()
            messagebox.showwarning("Atenção", f"A OP '{op}' já está cadastrada.")
            return

        sql_op = """
        INSERT INTO ordens_producao (op, produto, planejado, maquina, meta_hora, produzido, status, inicio_producao) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        cursor.execute(sql_op, (op, produto, planejado, maquina, meta, 0, "PENDENTE", None))

        sql_maquina_status = "INSERT OR IGNORE INTO maquinas_status (maquina, status) VALUES (?, ?)"
        cursor.execute(sql_maquina_status, (maquina, "LIVRE"))

        conexao.commit()
        conexao.close()

        messagebox.showinfo("Sucesso", f"Ordem de Produção '{op}' cadastrada com sucesso!")
        for var in self.vars.values():
            var.set("")


    def _criar_cadastro_motivo(self, master):
        motivo_frame = ttk.LabelFrame(master, text="Adicionar Novo Motivo", padding="10")
        motivo_frame.pack(fill="x", pady=10)

        self.motivo_var = tk.StringVar()
        ttk.Label(motivo_frame, text="Novo Motivo de Parada:").pack(pady=5)
        ttk.Entry(motivo_frame, textvariable=self.motivo_var, width=50).pack(pady=5)
        ttk.Button(motivo_frame, text="Adicionar Motivo", command=self.adicionar_motivo_parada).pack(pady=10)
        
        ttk.Label(master, text="Motivos Atuais:").pack(pady=(15, 5))
        
        self.lista_motivos = tk.Listbox(master, height=8, width=50)
        self.lista_motivos.pack(pady=5, fill="x")
        self.atualizar_lista_motivos()

    def atualizar_lista_motivos(self):
        self.lista_motivos.delete(0, tk.END)
        
        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()
        
        motivos_db = cursor.execute("SELECT motivo FROM motivos_parada ORDER BY motivo").fetchall()
        
        conexao.close()
        
        for row in motivos_db:
            self.lista_motivos.insert(tk.END, row['motivo'])

    def adicionar_motivo_parada(self):
        motivo = self.motivo_var.get().strip()
        if not motivo:
            messagebox.showerror("Erro", "O motivo não pode estar vazio.")
            return
        
        conexao = conectar_db()
        if not conexao: return
        cursor = conexao.cursor()

        cursor.execute("INSERT OR IGNORE INTO motivos_parada (motivo) VALUES (?)", (motivo,))
        
        if cursor.rowcount > 0:
            conexao.commit()
            messagebox.showinfo("Sucesso", f"Motivo '{motivo}' adicionado.")
            self.motivo_var.set("")
            self.atualizar_lista_motivos()
        else:
            messagebox.showwarning("Atenção", "Este motivo já existe.")
        
        conexao.close()


if __name__ == "__main__":
    app = AplicacaoProducao()
    app.mainloop()