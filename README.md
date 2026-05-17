# 15 Anos da Victória - Sistema de RSVP

Este projeto é uma aplicação web moderna e elegante desenvolvida em **Angular 21** para gerenciar a confirmação de presença (RSVP) do aniversário de 15 anos da Victória. O foco é proporcionar uma experiência de usuário premium para os convidados e um controle gerencial robusto para os organizadores.

---

## 🚀 Utilidade
O sistema centraliza o recebimento de confirmações de presença, permitindo que os convidados confirmem a si mesmos e aos seus familiares/dependentes de forma digital. Ele substitui as planilhas manuais por um banco de dados em tempo real, facilitando o planejamento do Buffet e da recepção.

---

## ✨ Funcionalidades

### 👥 Para o Convidado
- **Busca Inteligente:** Localização do convite por Nome Completo ou Telefone (com máscara dinâmica).
- **Checklist Familiar:** Confirmação individual para o titular e seus dependentes pré-cadastrados.
- **Acompanhantes Extras:** Possibilidade de adicionar novos nomes caso o administrador tenha concedido um limite de vagas extras.
- **Interface Premium:** Design elegante com efeito Glassmorphism, otimizado para dispositivos móveis.

### 🔐 Para o Administrador (Acesso Secreto)
- **Acesso Oculto:** Login via Google disparado por um gesto secreto (5 cliques no título da página inicial).
- **Gestão de Convites:** Cadastro, edição e exclusão de grupos de convidados.
- **Controle de Vagas:** Definição de limites de acompanhantes por titular.
- **Estatísticas em Tempo Real:** Dashboard com total de convites, total de convidados e contador exato de confirmados.
- **Filtros Avançados:** Visualização rápida por status (Pendentes, Confirmados, Recusados).

---

## 🛠️ Stack Tecnológica
- **Framework:** Angular 21 (Signals, Modern Control Flow, Standalone Components).
- **Estilização:** Tailwind CSS v4 + Google Fonts (Playfair Display & Montserrat).
- **Backend/Database:** Firebase Cloud Firestore.
- **Autenticação:** Firebase Auth (Google Provider).
- **Hospedagem:** Firebase Hosting.

---

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos
- Node.js (LTS recomendado).
- Firebase CLI (`npm install -g firebase-tools`).

### 2. Instalação
```bash
git clone [url-do-repositorio]
cd victoria
npm install --legacy-peer-deps
```

### 3. Configuração do Firebase
O projeto utiliza as credenciais localizadas em `src/environments/environment.ts`. Certifique-se de configurar o seu projeto no Firebase Console e habilitar:
- **Firestore Database:** Em modo nativo.
- **Authentication:** Provedor Google ativado.

### 4. Permissões Administrativas
Para tornar-se um administrador:
1. Adicione seu e-mail no arquivo `src/app/config/admins.ts`.
2. No Firestore, crie uma coleção chamada `admins`.
3. Crie um documento com o ID sendo seu e-mail (ex: `seu-email@gmail.com`).

### 5. Comandos Úteis
- **Desenvolvimento:** `npm start` (abre em `http://localhost:4200`).
- **Build de Produção:** `npm run build`.
- **Deploy de Regras:** `npx firebase deploy --only firestore:rules`.
- **Deploy Geral:** `npx firebase deploy`.

---

## 📜 Regras de Segurança
O arquivo `firestore.rules` garante que:
- Convidados só podem atualizar seus próprios campos de status e nomes de extras.
- Apenas administradores autenticados podem criar ou excluir convites.

---
*Desenvolvido com carinho para um momento inesquecível.*
