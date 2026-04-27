# Sistema Municipal de Monitoramento de Animais - Frontend

Aplicacao web em React + Vite para operacao do sistema municipal de animais, com login por perfil (`ADMIN`, `AGENTE`, `PROPRIETARIO`) e controle de acesso por rota.

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
