<p align="center"><img src="public/logo.png" alt="Logo da Maré" width="116"></p>

<h1 align="center">Maré Web</h1>

<p align="center"><strong>Um lugar para ouvir, avaliar e conversar sobre música.</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/React-182638?logo=react&logoColor=58AAF0" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-182638?logo=typescript&logoColor=58AAF0" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-182638?logo=vite&logoColor=58AAF0" alt="Vite">
</p>

A interface web da Maré reúne avaliações de músicas, publicações, conversas e descoberta de artistas. Ela consome a mesma API usada pelo aplicativo mobile.

## O que você encontra aqui

Feed de publicações, notas para músicas, comentários com respostas, perfis, seguidores, busca, músicas salvas, recomendações, notificações e mensagens privadas. A interface também pode ser instalada pelo navegador como PWA.

## Começando

Requer Node.js e a [API da Maré](../SESI-Mare-Backend/README.md) em execução.

```bash
npm install
```

Crie um `.env` neste diretório:

```env
VITE_API_URL=http://localhost:3000
```

Execute `npm run dev`. A URL local padrão do Vite é `http://localhost:5173`. Para conferir a versão de produção, use `npm run build` e `npm run preview`.

## Mapa do código

| Caminho | Responsabilidade |
| --- | --- |
| `src/pages` | Telas, como feed, post, perfil e mensagens |
| `src/components` | Peças de interface reutilizadas |
| `src/services` | Chamadas à API e dados locais da interface |
| `src/hooks` | Estado e carregamento compartilhados entre telas |
| `src/api.ts` | Cliente HTTP e tratamento de erros |
| `src/App.tsx` | Rotas da aplicação |
| `src/tema.css` | Cores e estilos do tema |

React e TypeScript organizam a interface; Vite compila e serve o projeto; React Router cuida da navegação. O CSS usa Tailwind e estilos próprios. O manifesto e o service worker em `public` permitem a instalação como PWA.

O endereço `VITE_API_URL` é incorporado ao build. Configure-o para a API correta antes de publicar a web. Veja o [guia do projeto](../docs/guia-do-projeto.md) para os fluxos completos.

## Para conferir uma alteração

`npm run lint` verifica as regras de código; `npm run build` checa os tipos e gera a versão de produção. Para testar uma função completa, mantenha a API e o PostgreSQL ativos.
