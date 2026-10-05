# 💌 Confirmação de Convites (RSVP) — grátis e open source

Site de confirmação de presença para **aniversários, casamentos, 15 anos, chás e qualquer evento**.
Seus convidados buscam o próprio nome ou telefone e confirmam quem vai — você acompanha tudo em um painel em tempo real.

Roda inteiro no **plano gratuito do Firebase (Spark)**: sem mensalidade, sem servidor para manter.

---

## ✨ Funcionalidades

**Para o convidado**
- Busca do convite por nome completo ou telefone.
- Confirmação individual do titular e dos familiares pré-cadastrados.
- Inclusão de acompanhantes extras (até o limite definido por você).
- Informações do local com link para o Google Maps.
- Layout responsivo, pensado para celular.

**Para quem organiza**
- Login com Google, acessado por um gesto secreto: **5 cliques no título do card** da página inicial.
- Cadastro, edição e exclusão de convites (grupos/famílias).
- Limite de acompanhantes extras por convite.
- Estatísticas em tempo real e filtros por status (pendente, confirmado, recusado).
- Edição do local/endereço do evento direto pelo painel.

---

## 🚀 Coloque o seu no ar em ~15 minutos

### 1. Pré-requisitos
- [Node.js](https://nodejs.org) LTS
- Uma conta Google

### 2. Copie o projeto
Clique em **"Use this template"** / **Fork** no GitHub, ou:
```bash
git clone https://github.com/victeo/confirmacao-convites.git
cd confirmacao-convites
npm install --legacy-peer-deps
```

### 3. Crie o projeto no Firebase
1. Acesse o [Firebase Console](https://console.firebase.google.com) → **Adicionar projeto** (pode desativar o Analytics).
2. **Build → Firestore Database → Criar banco de dados** (modo produção, região mais próxima, ex.: `southamerica-east1`).
3. **Build → Authentication → Começar → Google** → Ativar.
4. **Configurações do projeto → Seus apps → Web (`</>`)** → registre o app e copie o objeto `firebaseConfig`.

### 4. Configure o código
| Arquivo | O que mudar |
|---|---|
| `src/environments/environment.ts` e `environment.prod.ts` | Cole os valores do `firebaseConfig`. |
| `.firebaserc` | Troque `SEU_PROJETO` pelo ID do seu projeto. |
| `src/app/config/site.config.ts` | Título, rodapé, textos e imagem de fundo do seu evento. |
| `src/index.html` | Título da aba (opcional). |

> As chaves do Firebase Web **não são secretas** — quem protege os dados são as regras em `firestore.rules`.

### 5. Defina quem é administrador
No Firestore, crie a coleção **`admins`** e adicione um documento cujo **ID é o seu e-mail Google** (ex.: `maria@gmail.com`). Não precisa de campos.
Repita para cada pessoa que vai administrar. É a única lista de admins — o site e as regras de segurança leem dela.

### 6. Publique
```bash
npx firebase login
npx firebase deploy --only firestore:rules   # regras de segurança
npm run build
npx firebase deploy --only hosting           # site em https://SEU_PROJETO.web.app
```

Pronto! Acesse o site, clique 5 vezes no título do card, entre com o Google e comece a cadastrar convidados. Depois é só mandar o link no WhatsApp. 🎉

---

## 🧑‍💻 Desenvolvimento
- `npm start` — servidor local em `http://localhost:4200`
- `npm run build` — build de produção em `dist/confirmacao-convites`
- `npm test` — testes

## 🛠️ Stack
Angular 21 (signals, standalone) · Tailwind CSS v4 · Firebase Firestore, Auth e Hosting.

## 🔒 Segurança
O `firestore.rules` garante que:
- Convidados só alteram o status de presença e os nomes de acompanhantes extras.
- Só admins (documentos em `admins/`) criam, editam ou excluem convites e configurações.

> Como os convites são públicos para leitura (para a busca funcionar), evite guardar dados sensíveis neles.

## 🤝 Contribuindo
Issues e pull requests são bem-vindos! Ideias: temas de cores, lista de presentes, exportar CSV, i18n.

## 📜 Licença
[MIT](LICENSE) — use, modifique e compartilhe à vontade.
