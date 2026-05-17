# Gerenciamento de Administradores - RSVP Victoria

Este documento descreve como gerenciar quem tem acesso administrativo ao sistema de RSVP.

## 1. Adicionando Administradores via Código
Para que o sistema reconheça um e-mail como administrador no Frontend (esconder/mostrar botões), edite o arquivo:
`src/app/config/admins.ts`

Adicione o e-mail à lista `ADMIN_EMAILS`:
```typescript
export const ADMIN_EMAILS = [
  'victor.atomo@gmail.com',
  'novo-admin@email.com' // Adicione aqui
];
```

## 2. Adicionando Administradores no Firestore (Segurança)
Para que as regras de segurança do banco de dados permitam que o novo administrador salve dados, você deve cadastrá-lo no Firebase Console:

1. Vá para o **Firestore Database**.
2. Crie uma coleção chamada `admins` (se não existir).
3. Adicione um documento onde o **Document ID** seja o e-mail completo do administrador (ex: `novo-admin@email.com`).
4. Não é necessário adicionar campos ao documento, a existência do ID já garante a permissão.

## 3. Autenticação
O sistema utiliza **Firebase Authentication**. Certifique-se de que o método de login (ex: Google) esteja ativado no console do Firebase para que os administradores consigam se logar.
