# Painel Municipal de Monitoramento de Animais (Frontend)

Aplicacao frontend em **Next.js + TypeScript + Tailwind CSS** para consumir a API REST municipal.

## Funcionalidades

- Dashboard com contadores:
  - Total de animais
  - Total de ocorrencias
  - Total de notificacoes
- Cadastro de proprietario
- Cadastro de animal
- Lista de animais em tabela
- Registro de ocorrencia
- Busca dinamica por codigo `GBXXXX` (retorna animal + proprietario)
- Lista de notificacoes em tabela
- Feedback visual de carregamento, sucesso e erro

## Estrutura

```text
app/
  dashboard/page.tsx
  proprietarios/novo/page.tsx
  animais/page.tsx
  animais/novo/page.tsx
  ocorrencias/nova/page.tsx
  busca-codigo/page.tsx
  notificacoes/page.tsx
components/
  forms/FormField.tsx
  layout/AppShell.tsx
  layout/Sidebar.tsx
  ui/
hooks/
  useAsyncAction.ts
  useDashboardData.ts
  useDebounce.ts
services/
  api.ts
  proprietarios.service.ts
  animais.service.ts
  ocorrencias.service.ts
  notificacoes.service.ts
types/
  proprietario.ts
  animal.ts
  ocorrencia.ts
  notificacao.ts
```

## Configuracao

1. Instale as dependencias:

```bash
npm install
```

2. Configure a URL da API:

```bash
cp .env.example .env.local
```

3. Execute em desenvolvimento:

```bash
npm run dev
```

Aplicacao: `http://localhost:3001`  
API esperada: `NEXT_PUBLIC_API_BASE_URL` (padrao: `http://localhost:3000`)
