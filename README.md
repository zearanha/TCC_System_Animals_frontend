# Sistema Municipal de Monitoramento de Animais - Frontend

Aplicacao web em Next.js para operacao do sistema municipal de animais, com login por perfil (`ADMIN`, `AGENTE`, `PROPRIETARIO`) e controle de acesso por rota.

## Visao Geral

- Login com email e senha
- Criacao de conta de proprietario na propria tela de login
- Sessao com token Bearer armazenado no navegador
- Redirecionamento automatico por perfil apos login
- Guards de acesso por rota
- CRUD com modais para modulos administrativos
- Confirmacao de exclusao em modal (sem `alert`)

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS

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

## Modulos da Interface

- Login e criacao de conta:
  - `app/login/page.tsx`
- Dashboard:
  - `app/dashboard/page.tsx`
- Usuarios (admin):
  - criar, listar, editar, excluir em modal
- Proprietarios (admin):
  - criar, listar, editar, excluir em modal
- Agentes (admin):
  - criar, listar, editar, excluir em modal
- Animais (admin/proprietario):
  - admin: CRUD completo em modal
  - proprietario: consulta apenas dos animais vinculados
- Ocorrencias (admin/agente):
  - registrar ocorrencia por codigo
  - concluir ocorrencia
  - admin pode retirar (excluir) ocorrencia
- Busca por codigo (admin/agente):
  - consulta animal + proprietario por `LLNNNN`
- Notificacoes (admin/proprietario):
  - listagem do historico de envio

## Estrutura Principal

```text
frontend/
  app/
    login/page.tsx
    dashboard/page.tsx
    usuarios/page.tsx
    proprietarios/page.tsx
    agentes/page.tsx
    animais/page.tsx
    ocorrencias/nova/page.tsx
    busca-codigo/page.tsx
    notificacoes/page.tsx
    layout.tsx
    page.tsx
  components/
    layout/
    providers/
    forms/
    ui/
  hooks/
  lib/
  services/
  types/
  .env.example
  package.json
```

## Variaveis de Ambiente

Arquivo de referencia: `.env.example`.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
```

A API esperada e a do backend exposta na porta `3002`.

## Executando em Desenvolvimento

No diretorio `frontend`:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplicacao: `http://localhost:3001`

## Build de Producao

No diretorio `frontend`:

```bash
npm run build
npm run start
```

## Fluxo de Autenticacao

- Login:
  - `POST /auth/login`
- Cadastro de proprietario:
  - `POST /auth/registrar-proprietario`
- Sessao atual:
  - `GET /auth/me`
- Logout:
  - `POST /auth/logout`

O frontend envia automaticamente `Authorization: Bearer <token>` quando houver sessao.

## Comportamentos Importantes

- Ao registrar ocorrencia, o backend gera notificacoes automaticas para o proprietario por `WHATSAPP` e `EMAIL` quando houver esses contatos.
- Toda exclusao na interface passa por `ConfirmationModal`.
- O menu lateral e filtrado dinamicamente conforme o perfil logado.

## Troubleshooting

Porta 3001 ocupada (`EADDRINUSE`):

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen | Select-Object -First 1 -ExpandProperty OwningProcess
Stop-Process -Id <PID> -Force
```

Erro `EINVAL ... .next\package.json` no Windows/OneDrive:

```powershell
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
if (Test-Path tsconfig.tsbuildinfo) { Remove-Item tsconfig.tsbuildinfo -Force }
npm run dev
```

Erro de hidratacao por extensao do navegador:

- Testar em aba anonima ou desativar extensoes que injetam atributos no DOM.

## Scripts NPM

- `npm run dev` - Next dev na porta 3001
- `npm run build` - build de producao
- `npm run start` - start de producao na porta 3001
- `npm run lint` - lint
- `npm run type-check` - checagem de tipos
