# 🚀 Kanban de Ideias

Uma plataforma visual moderna para gestão de pipeline de inovação empresarial, construída com React, Node.js e tecnologias de ponta.

![Kanban de Ideias](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Prisma](https://img.shields.io/badge/Prisma-5+-pink)

## ✨ Características

### 🎯 Funcionalidades Principais
- **📋 Gestão de Cards**: Criar, editar (apenas dono), mover (todos) e excluir (apenas dono)
- **🏗️ Colunas Customizáveis**: Criar/editar/excluir colunas e reordená-las
- **🗳️ Votos em Cards (like)**: Adicionar/remover voto com atualização em tempo real
- **📊 Enquetes por Card**: Criar/editar/excluir enquetes (apenas dono do card) e votar em tempo real
- **💬 Comentários**: Adicionar/editar/excluir comentários (apenas dono do comentário)
- **🔍 Busca e Filtros**: Busca por título/descrição/criador + filtro por múltiplos autores (multi-select) + filtro por coluna
- **🎛️ Filtros Ativos**: Chips de filtros abaixo da barra; limpar individualmente ou todos de uma vez
- **📱 Responsivo**: Layout fluido com chips compactos (limite de exibição com “+N ...”)

### ⚡ Tecnologias de Tempo Real
- **📡 Socket.IO**: Eventos em tempo real para cards, colunas, votos, enquetes e comentários
- **🎭 Drag & Drop**: Interface intuitiva com animações suaves
- **🌐 Multilíngue**: Suporte completo para PT-BR e EN

### 🔐 Segurança e Qualidade
- **🛡️ Autenticação JWT**: Sistema seguro de login/logout
- **✅ Validação Zod**: Validação robusta de dados
- **🚦 Rate Limiting**: Proteção contra spam
- **🔒 CORS**: Configuração segura de origem cruzada
- **🔏 Menor Privilégio (RBAC por ownership)**: O backend valida o “dono” antes de permitir edições/remoções

## 🏗️ Arquitetura

### Backend (Node.js + TypeScript)
```
backend/
├── src/
│   ├── controllers/     # Controladores REST
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Camada de dados
│   ├── middleware/      # Middlewares (auth, cors, etc)
│   ├── routes/          # Definição de rotas
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários (JWT, validação, etc)
│   └── scripts/         # Scripts de seed e migração
├── prisma/              # Schema do banco de dados
└── package.json
```

### Frontend (React + TypeScript)
```
src/
├── components/
│   ├── kanban/          # Componentes do Kanban
│   ├── auth/            # Componentes de autenticação
│   └── ui/              # Componentes base (shadcn/ui)
├── services/            # Serviços de API
├── store/               # Estado global (Zustand)
├── types/               # Tipos TypeScript
├── hooks/               # Hooks customizados
├── lib/                 # Utilitários e configurações
└── locales/             # Arquivos de internacionalização
```

#### Camadas (desacoplamento UI/negócio)
- Renderização (React): `components/kanban/*`
- Estado e orquestração: `store/kanban.ts`
- Serviços HTTP: `services/api.ts` (baixo nível), `services/kanbanService.ts` (alto nível)
- Tempo real: `services/socketService.ts` (cliente), `hooks/useSocket.ts` (assina eventos)

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 20+
- npm ou yarn
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/kanban-ideias.git
cd kanban-ideias
```

### 2. Configure o Backend
```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp config.example .env
# Edite o arquivo .env com suas configurações

# Gere o cliente Prisma
npm run db:generate

# Execute as migrações
npm run db:push

# Popule o banco com dados de exemplo
npm run db:seed

# Inicie o servidor de desenvolvimento
npm run dev
```

### 3. Configure o Frontend
```bash
# Volte para a raiz do projeto
cd ..

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp env.example .env
# Edite o arquivo .env se necessário

# Inicie o servidor de desenvolvimento
npm run dev
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Documentação API**: http://localhost:3001/docs

## 🧭 Guia de Uso Rápido

1) Faça login com uma das credenciais de teste
2) Crie ideias (cards) e mova entre colunas (todos usuários podem mover)
3) Abra um card (sheet) para comentar, votar e criar enquetes
4) Use a barra de busca e:
   - Filtro por coluna
   - Filtro por usuários (botão “Usuários” → multi-seleção → Aplicar)
   - Chips abaixo mostram filtros ativos; clique em “×” para remover ou em “Limpar filtros” para resetar

Atualizações em tempo real aparecem para todos (votos, comentários, enquetes, criação/edição/deleção, reordenação de colunas).

## 🔑 Credenciais de Teste

Após executar o seed, você pode usar estas credenciais:

| Email | Senha | Nome |
|-------|-------|------|
| ana.silva@empresa.com | 123456 | Ana Silva |
| carlos.santos@empresa.com | 123456 | Carlos Santos |
| maria.costa@empresa.com | 123456 | Maria Costa |
| joao.oliveira@empresa.com | 123456 | João Oliveira |
| sarah.johnson@company.com | 123456 | Sarah Johnson |

## 📚 Documentação da API

A documentação completa da API está disponível em `/docs` quando o servidor estiver rodando. Ela inclui:

- **Autenticação**: Login, registro, refresh token
- **Colunas**: CRUD completo
- **Cards**: CRUD, movimentação, busca
- **Votos**: Adicionar/remover votos
- **Comentários**: CRUD completo
- **Eventos em Tempo Real**: SSE endpoints

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/register` - Registrar usuário
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/logout` - Fazer logout

#### Colunas
- `GET /api/columns` - Listar colunas
- `POST /api/columns` - Criar coluna
- `PATCH /api/columns/:id` - Atualizar coluna
- `DELETE /api/columns/:id` - Excluir coluna

#### Cards
- `GET /api/cards` - Listar cards
- `POST /api/cards` - Criar card
- `GET /api/cards/:id` - Obter card
- `PATCH /api/cards/:id` - Atualizar card
- `DELETE /api/cards/:id` - Excluir card
- `PATCH /api/cards/:id/move` - Mover card

#### Usuários
- `GET /api/users?search=` - Listar usuários (para o filtro de autores)

#### Votos
- `POST /api/cards/:id/votes` - Votar em card
- `DELETE /api/cards/:id/votes` - Remover voto
- `GET /api/cards/:id/votes` - Listar votos

#### Comentários
- `POST /api/cards/:id/comments` - Adicionar comentário
- `GET /api/cards/:id/comments` - Listar comentários
- `PATCH /api/comments/:id` - Atualizar comentário
- `DELETE /api/comments/:id` - Excluir comentário

#### Tempo Real (Socket.IO)
- Eventos emitidos pelo servidor (exemplos):
  - `card:created`, `card:updated`, `card:deleted`, `card:moved`
  - `card:voted`, `card:vote:removed`
  - `comment:created`, `comment:updated`, `comment:deleted`
  - `poll:created`, `poll:updated`, `poll:deleted`, `poll:voted`, `poll:vote:removed`
  - `columns:reordered`

O cliente registra handlers em `hooks/useSocket.ts` e atualiza o estado global em `store/kanban.ts`.

## 🔒 Regras de Acesso (Menor Privilégio)

- Qualquer usuário autenticado pode:
  - Visualizar o board, cards e comentários
  - Criar novas ideias (cards)
  - Comentar e votar em cards / votar em enquetes
  - Mover cards entre colunas

- Somente o criador pode:
  - Editar ou excluir o próprio card
  - Editar ou excluir o próprio comentário
  - Criar/editar/excluir enquetes do seu card

As validações acontecem no backend (ex.: `cardService.updateCard`, `commentService.updateComment`), e as rotas sensíveis usam `authenticateToken`. Tentativas sem permissão retornam `403 Forbidden`.

## 🛰️ Fluxo de Tempo Real (Resumo)

1. Ação ocorre (ex.: voto/remover voto, novo comentário, mover coluna)
2. Backend processa, persiste e emite evento Socket.IO
3. Frontend recebe via `socketService` → `useSocket`, atualiza `store/kanban`
4. UI re-renderiza automaticamente (sem F5)

## 🧩 Boas Práticas Implementadas

- Desacoplamento: UI ↔ Serviços ↔ Estado ↔ Socket
- i18n completo (PT-BR/EN) inclusive para labels de filtros
- Prevenção de duplicidades (comentários/enquetes) no estado
- Filtros responsivos com chips limitados e contador “+N ...”
- Logs de debug estratégicos (podem ser desativados em produção)


## 🧪 Testes

### Backend
```bash
cd backend
npm test              # Executar todos os testes
npm run test:watch    # Modo watch
```

### Frontend
```bash
npm run test          # Executar testes do frontend
```

## 🚀 Deploy

### Backend (Railway/Heroku/Vercel)
```bash
cd backend
npm run build
npm start
```

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy da pasta dist/
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: [Seu Nome]
- **Design**: [Designer]
- **Product Owner**: [PO]

## 📞 Suporte

- **Email**: suporte@kanbanideias.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/kanban-ideias/issues)
- **Documentação**: [Wiki](https://github.com/seu-usuario/kanban-ideias/wiki)

---
