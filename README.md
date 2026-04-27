# Sistema Municipal de Monitoramento de Animais - Frontend

Aplicacao web em React + Vite para operacao do sistema municipal de animais, com login por perfil (`ADMIN`, `AGENTE`, `PROPRIETARIO`) e controle de acesso por rota.

## Funcionalidades

- Cadastro e gestao de proprietarios, agentes, usuarios, animais, ocorrencias e notificacoes
- Upload de foto de perfil para proprietarios
- Upload e exibicao de imagens de identificacao dos animais
- Consulta por codigo de identificacao com visualizacao das imagens do animal e do proprietario
- Notificacoes agrupadas por ocorrencia/proprietario com canais exibidos em conjunto (`EMAIL + WHATSAPP`)

## Stack

- React 19
- React Router DOM
- Vite
- Chakra UI
- Material UI
- TypeScript
- CSS global

## Variaveis de Ambiente

Arquivo de referencia: `.env.example`.

```env
VITE_API_BASE_URL=http://localhost:3002
```

## Estrutura

```text
TCC_System_Animals_frontend/
  app/
    agentes/
    animais/
    busca-codigo/
    dashboard/
    login/
    notificacoes/
    ocorrencias/
    proprietarios/
    usuarios/
    globals.css
  components/
    forms/
    layout/
    providers/
    ui/
  hooks/
  lib/
  services/
  src/
    App.tsx
    main.tsx
    theme.ts
    vite-env.d.ts
  types/
  index.html
  vite.config.mts
  package.json
```

## Executando em Desenvolvimento

No diretorio do frontend:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplicacao: `http://localhost:3001`

## Build e Preview

```bash
npm run build
npm run preview
```

## Scripts

- `npm run dev` - servidor de desenvolvimento Vite na porta 3001
- `npm run build` - checagem de tipos + build de producao
- `npm run preview` - preview local do build na porta 3001
- `npm run start` - alias para `npm run preview`
- `npm run type-check` - checagem de tipos
- `npm run lint` - checagem de tipos (alias)

## UI e Layout

- Tema compartilhado em `src/theme.ts` (paleta e tipografia para Chakra e MUI)
- Providers globais em `src/main.tsx`:
  - `ThemeProvider` + `CssBaseline` (MUI)
  - `ChakraProvider` (Chakra UI)
- Componentes base da interface em `components/ui`
- `app/globals.css` contem estilos globais e classes utilitarias de compatibilidade para telas legadas

## Rotas e Perfis

| Rota | ADMIN | AGENTE | PROPRIETARIO |
| --- | --- | --- | --- |
| `/login` | Publica | Publica | Publica |
| `/dashboard` | Sim | Nao | Nao |
| `/usuarios` | Sim | Nao | Nao |
| `/proprietarios` | Sim | Nao | Nao |
| `/agentes` | Sim | Nao | Nao |
| `/animais` | Sim | Nao | Sim |
| `/ocorrencias/nova` | Sim | Sim | Nao |
| `/busca-codigo` | Sim | Sim | Nao |
| `/notificacoes` | Sim | Nao | Sim |

Rota inicial por perfil:

- `ADMIN` -> `/dashboard`
- `AGENTE` -> `/ocorrencias/nova`
- `PROPRIETARIO` -> `/animais`

## Integracao com Backend

Padrao de desenvolvimento:

- Frontend: `http://localhost:3001`
- Backend (Docker): `http://localhost:3002`

Observacoes importantes:

- Arquivos de imagem usam URL publica do backend (`/uploads/...`), resolvida automaticamente pelo frontend.
- Para envio real de email/WhatsApp, o backend precisa estar configurado com SMTP e webhook de WhatsApp.

Se o backend estiver rodando localmente em outra porta, ajuste `VITE_API_BASE_URL`.
