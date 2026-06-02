import tkinter as tk
from tkinter import messagebox
import csv

class MapaIndustrialApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Sistema de Gestão Industrial - MVP")
        self.root.geometry("950x600")
        
        # Banco de dados temporário na memória do programa
        self.maquinas = {}
        self.contador_maquinas = 1
        self.tag_selecionada = None
        
        # Variáveis para controle do arrastar com o mouse
        self.drag_data = {"x": 0, "y": 0}

        # --- LAYOUT PRINCIPAL ---
        # Painel Lateral (Controles e Informações)
        self.painel_lateral = tk.Frame(root, width=250, bg="#2c3e50", padx=10, pady=10)
        self.painel_lateral.pack(side=tk.LEFT, fill=tk.Y)
        self.painel_lateral.pack_propagate(False) # Mantém a largura fixa

        # Área do Mapa (Canvas)
        self.canvas = tk.Canvas(root, bg="#ecf0f1", highlightthickness=1, highlightbackground="#bdc3c7")
        self.canvas.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Simulação de uma "Planta Baixa" desenhada no fundo
        self.canvas.create_text(400, 30, text="MAPA DA FÁBRICA (Clique e arraste as máquinas)", font=("Arial", 14, "bold"), fill="#7f8c8d")

        # --- COMPONENTES DO PAINEL LATERAL ---
        tk.Label(self.painel_lateral, text="CONTROLES", font=("Arial", 12, "bold"), bg="#2c3e50", fg="white").pack(pady=5)
        
        # Botões de Ação
        tk.Button(self.painel_lateral, text="+ Adicionar Máquina", bg="#2ecc71", fg="white", font=("Arial", 10, "bold"), command=self.adicionar_maquina).pack(fill=tk.X, pady=5)
        tk.Button(self.painel_lateral, text="Exportar para Power BI (CSV)", bg="#f1c40f", fg="black", font=("Arial", 10, "bold"), command=self.exportar_para_csv).pack(fill=tk.X, pady=5)
        
        # Divisor visual
        tk.Frame(self.painel_lateral, height=2, bg="#34495e").pack(fill=tk.X, pady=15)
        
        # Painel de Informações da Máquina Selecionada
        tk.Label(self.painel_lateral, text="MÁQUINA SELECIONADA", font=("Arial", 11, "bold"), bg="#2c3e50", fg="white").pack(pady=5)
        
        self.lbl_nome = tk.Label(self.painel_lateral, text="Nenhuma", font=("Arial", 10), bg="#2c3e50", fg="#bdc3c7")
        self.lbl_nome.pack(pady=2)
        
        self.lbl_prod = tk.Label(self.painel_lateral, text="Produção: -", font=("Arial", 10), bg="#2c3e50", fg="#bdc3c7")
        self.lbl_prod.pack(pady=2)
        
        # Botões de edição da máquina selecionada
        self.btn_produzir = tk.Button(self.painel_lateral, text="Simular Produção (+50 pçs)", bg="#3498db", fg="white", command=self.simular_producao, state=tk.DISABLED)
        self.btn_produzir.pack(fill=tk.X, pady=5)
        
        self.btn_excluir = tk.Button(self.painel_lateral, text="Excluir Máquina", bg="#e74c3c", fg="white", command=self.excluir_maquina, state=tk.DISABLED)
        self.btn_excluir.pack(fill=tk.X, pady=5)

        # --- EVENTOS DO MOUSE NO CANVAS ---
        # Vincula eventos para mover os objetos no mapa
        self.canvas.tag_bind("maquina_tag", "<Button-1>", self.iniciar_arrasto)
        self.canvas.tag_bind("maquina_tag", "<B1-Motion>", self.arrastando)

    def adicionar_maquina(self):
        # Define um nome e uma tag única para rastrear esse grupo de desenho (retângulo + texto)
        tag_id = f"maq_{self.contador_maquinas}"
        nome_maquina = f"MÁQUINA {self.contador_maquinas}"
        
        # Coordenadas iniciais no Canvas (centro aproximado)
        x, y = 100, 100
        
        # Desenha o quadrado (representando a máquina) e o texto dentro
        # Ambos recebem a tag geral "maquina_tag" (para movimento) e a tag única "tag_id"
        self.canvas.create_rectangle(x, y, x+90, y+60, fill="#1abc9c", outline="#16a085", width=2, tags=("maquina_tag", tag_id))
        self.canvas.create_text(x+45, y+30, text=nome_maquina, font=("Arial", 9, "bold"), fill="white", tags=("maquina_tag", tag_id))
        
        # Salva os dados no nosso "banco de dados" dicionário
        self.maquinas[tag_id] = {
            "nome": nome_maquina,
            "producao": 0,
            "status": "Ativa"
        }
        
        self.contador_maquinas += 1

    def iniciar_arrasto(self, event):
        """ Identifica qual máquina foi clicada e prepara para arrastar """
        itens_clicados = self.canvas.find_withtag("current")
        if not itens_clicados:
            return
            
        tags = self.canvas.gettags(itens_clicados[0])
        
        # Descobre qual é a tag única (maq_1, maq_2...) da máquina clicada
        for t in tags:
            if t.startswith("maq_"):
                self.tag_selecionada = t
                break
                
        # Atualiza a posição inicial do clique
        self.drag_data["x"] = event.x
        self.drag_data["y"] = event.y
        
        # Destaca a máquina selecionada mudando a cor dos retângulos para identificar seleção
        self.atualizar_visual_selecao()
        self.atualizar_painel_lateral()

    def arrastando(self, event):
        """ Move todos os objetos que possuem a tag da máquina selecionada """
        if not self.tag_selecionada:
            return
            
        # Calcula a distância que o mouse moveu
        dx = event.x - self.drag_data["x"]
        dy = event.y - self.drag_data["y"]
        
        # Move o bloco no canvas
        self.canvas.move(self.tag_selecionada, dx, dy)
        
        # Atualiza a posição anterior do mouse
        self.drag_data["x"] = event.x
        self.drag_data["y"] = event.y

    def atualizar_visual_selecao(self):
        """ Reseta as cores e pinta de laranja apenas a máquina selecionada """
        for tag in self.maquinas.keys():
            # Filtra apenas os retângulos para mudar de cor
            itens = self.canvas.find_withtag(tag)
            for item in itens:
                if self.canvas.type(item) == "rectangle":
                    if tag == self.tag_selecionada:
                        self.canvas.itemconfig(item, fill="#e67e22", outline="#d35400") # Laranja (Selecionada)
                    else:
                        self.canvas.itemconfig(item, fill="#1abc9c", outline="#16a085") # Verde padrão

    def atualizar_painel_lateral(self):
        """ Atualiza os textos do painel esquerdo """
        if self.tag_selecionada and self.tag_selecionada in self.maquinas:
            dados = self.maquinas[self.tag_selecionada]
            self.lbl_nome.config(text=dados["nome"], fg="#2ecc71")
            self.lbl_prod.config(text=f"Produção: {dados['producao']} pçs", fg="white")
            
            # Ativa os botões
            self.btn_produzir.config(state=tk.NORMAL)
            self.btn_excluir.config(state=tk.NORMAL)
        else:
            self.lbl_nome.config(text="Nenhuma", fg="#bdc3c7")
            self.lbl_prod.config(text="Produção: -", fg="#bdc3c7")
            self.btn_produzir.config(state=tk.DISABLED)
            self.btn_excluir.config(state=tk.DISABLED)

    def simular_producao(self):
        """ Adiciona produção à máquina selecionada """
        if self.tag_selecionada:
            self.maquinas[self.tag_selecionada]["producao"] += 50
            self.atualizar_painel_lateral()

    def excluir_maquina(self):
        """ Remove a máquina do mapa e do banco de dados """
        if self.tag_selecionada:
            # Remove do Canvas
            self.canvas.delete(self.tag_selecionada)
            # Remove do dicionário
            del self.maquinas[self.tag_selecionada]
            
            self.tag_selecionada = None
            self.atualizar_painel_lateral()
            messagebox.showinfo("Sucesso", "Máquina removida com sucesso!")

    def exportar_para_csv(self):
        """ Salva os dados atuais em um arquivo CSV para o Power BI ler """
        if not self.maquinas:
            messagebox.showwarning("Aviso", "Não há dados para exportar.")
            return
            
        nome_arquivo = "dados_producao_industrial.csv"
        
        try:
            with open(nome_arquivo, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file, delimiter=';')
                # Cabeçalho das colunas do Power BI
                writer.writerow(["ID_Maquina", "Nome_Maquina", "Pecas_Produzidas", "Status"])
                
                # Escreve os dados de cada máquina
                for tag, dados in self.maquinas.items():
                    writer.writerow([tag, dados["nome"], dados["producao"], dados["status"]])
                    
            messagebox.showinfo("Sucesso", f"Dados exportados para '{nome_arquivo}' com sucesso!\nAbra este arquivo no Power BI.")
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao salvar arquivo: {e}")

# Executa o programa
if __name__ == "__main__":
    root = tk.Tk()
    app = MapaIndustrialApp(root)
    root.mainloop()