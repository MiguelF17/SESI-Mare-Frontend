# 🌊 Maré — Frontend

**Sua vida musical em um só lugar.**

O Maré é uma plataforma social voltada para pessoas que gostam de música e desejam compartilhar suas opiniões, descobrir novos artistas e acompanhar as experiências musicais de outros usuários.

Este repositório contém a aplicação web do projeto, desenvolvida para oferecer uma experiência social e intuitiva, permitindo que os usuários interajam através de publicações, avaliações e recomendações musicais.

## 🎨 Tecnologias

- **React** — Construção da interface.
- **Vite** — Ambiente de desenvolvimento e build.
- **TypeScript** — Tipagem estática.
- **Tailwind CSS** — Estilização.
- **React Router** — Navegação entre páginas.
- **Phosphor Icons** — Biblioteca de ícones.
- **React Hot Toast** — Notificações visuais.

## ✨ Funcionalidades

- Cadastro, login e verificação de e-mail.
- Feed personalizado de publicações.
- Feed de usuários seguidos.
- Avaliação de músicas com notas de 1 a 5.
- Publicações com textos e avaliações.
- Curtidas e comentários.
- Pesquisa de músicas, artistas, usuários e publicações.
- Perfis personalizados.
- Sistema de seguidores.
- Salvamento de músicas.
- Recomendações musicais.
- Notificações.
- Edição de perfil, foto e capa.
- Integração com plataformas externas de streaming.

## 📁 Estrutura do projeto

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── contexts/
│   ├── routes/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── .env
├── index.html
├── package.json
└── vite.config.ts
```

*A estrutura pode variar conforme a organização atual do projeto.*

## ⚙️ Como executar

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
cd nome-do-repositorio
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure a API

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000
```

Altere o endereço conforme a localização da API.

### 4. Execute a aplicação

```bash
npm run dev
```

O Vite disponibilizará o endereço local da aplicação, normalmente:

```text
http://localhost:5173
```

### 5. Gere a versão de produção

```bash
npm run build
```

## 🎧 Experiência musical

O Maré não busca substituir as plataformas de streaming existentes.

Sua proposta é oferecer uma experiência social em torno da música, permitindo que os usuários descubram conteúdos, compartilhem avaliações e interajam com outras pessoas.

Quando desejarem ouvir uma música, os usuários podem acessar plataformas externas de streaming, como Spotify, Apple Music, Amazon Music e YouTube Music.

## 🔗 Integração

O frontend consome a API do Maré para realizar operações de autenticação, publicações, avaliações, comentários, perfis e demais funcionalidades.

---

Desenvolvido como parte do projeto acadêmico **Maré — TCC**.