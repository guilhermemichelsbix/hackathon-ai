# 🚀 Kanban de Ideias - Guia Completo para Apresentação

## 📋 Visão Geral do Projeto

**Kanban de Ideias** é uma plataforma visual moderna para gestão de pipeline de inovação empresarial, construída com tecnologias de ponta para oferecer uma experiência colaborativa em tempo real.

### 🎯 Objetivo Principal
Permitir que equipes capturem, organizem e priorizem ideias de forma visual e colaborativa, com atualizações em tempo real para todos os participantes.

---

## 🏗️ Arquitetura Geral

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │    DATABASE     │
│   (React SPA)   │◄──►│  (Node.js API)  │◄──►│   (SQLite)      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • Prisma ORM    │
│ • TypeScript    │    │ • TypeScript    │    │ • SQLite        │
│ • Zustand       │    │ • Socket.IO     │    │                 │
│ • Socket.IO     │    │ • JWT Auth      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🖥️ Frontend (React SPA)

### 📁 Estrutura de Pastas
```
src/
├── components/          # Componentes React
│   ├── auth/           # Autenticação
│   ├── kanban/         # Funcionalidades do Kanban
│   └── ui/             # Componentes de UI (shadcn/ui)
├── hooks/              # Custom Hooks
├── layouts/            # Layouts da aplicação
├── pages/              # Páginas principais
├── routes/             # Configuração de rotas
├── services/           # Serviços de API
├── store/              # Gerenciamento de estado (Zustand)
├── types/              # Definições TypeScript
└── locales/            # Internacionalização (i18n)
```

### 🔧 Tecnologias Principais

#### **React 18 + TypeScript**
- **SPA (Single Page Application)** com roteamento client-side
- **Componentes funcionais** com hooks modernos
- **TypeScript** para type safety e melhor DX

#### **Gerenciamento de Estado - Zustand**
```typescript
// store/kanban.ts
interface KanbanState {
  user: User | null;
  board: Board;
  selectedCard: Card | null;
  searchQuery: string;
  selectedColumnId: string | null;
  selectedCreators: string[];
}

interface KanbanActions {
  setUser: (user: User) => void;
  loadBoard: () => Promise<void>;
  createCard: (card: CreateCardRequest) => Promise<void>;
  // ... outras ações
}
```

#### **Real-time Communication - Socket.IO**
```typescript
// hooks/useSocket.ts
const useSocket = () => {
  useEffect(() => {
    socketService.on('card:created', handleCardCreated);
    socketService.on('card:updated', handleCardUpdated);
    socketService.on('comment:created', handleCommentCreated);
    // ... outros eventos
  }, []);
};
```

#### **UI Components - shadcn/ui + Tailwind**
- **Componentes acessíveis** baseados em Radix UI
- **Tailwind CSS** para estilização
- **Framer Motion** para animações
- **Responsive design** mobile-first

#### **Internacionalização (i18n)**
```typescript
// lib/i18n.ts
import i18next from 'i18next';
import { ptBR } from './locales/pt-BR.json';
import { en } from './locales/en.json';

i18next.init({
  resources: { 'pt-BR': ptBR, 'en': en },
  lng: 'pt-BR'
});
```

### 🎨 Componentes Principais

#### **KanbanBoard**
- **Drag & Drop** com @dnd-kit
- **Filtros dinâmicos** (busca, coluna, usuários)
- **Cards interativos** com votos e ações

#### **CardDetailsSheet**
- **Modal lateral** com detalhes completos
- **Comentários** com CRUD completo
- **Enquetes** integradas
- **Ações de edição/exclusão**

#### **KanbanHeader**
- **Barra de busca** com debounce
- **Filtros multi-select** de usuários
- **Filtros ativos** com chips removíveis
- **Controles de coluna**

---

## ⚙️ Backend (Node.js API)

### 📁 Arquitetura em Camadas
```
backend/src/
├── controllers/        # Controladores REST (HTTP)
├── services/          # Lógica de negócio
├── repositories/      # Camada de acesso a dados
├── middleware/        # Middlewares (auth, CORS, etc)
├── routes/            # Definição de rotas
├── utils/             # Utilitários (JWT, validação, etc)
└── types/             # Tipos TypeScript
```

### 🔧 Tecnologias Principais

#### **Express.js + TypeScript**
```typescript
// index.ts
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/columns', columnRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/users', userRoutes);
```

#### **Autenticação JWT**
```typescript
// middleware/auth.ts
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};
```

#### **Validação com Zod**
```typescript
// utils/validation.ts
export const createCardSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  columnId: z.string().uuid(),
});
```

#### **Socket.IO para Real-time**
```typescript
// utils/socketManager.ts
export class SocketManager {
  broadcastCardCreated(card: Card) {
    this.io.emit('card:created', { type: 'card:created', payload: card });
  }
  
  broadcastCommentCreated(comment: Comment) {
    this.io.emit('comment:created', { type: 'comment:created', payload: comment });
  }
}
```

### 🔒 Segurança e Validação

#### **Princípio do Menor Privilégio**
```typescript
// services/cardService.ts
async updateCard(id: string, data: UpdateCardRequest, userId: string) {
  const existingCard = await this.cardRepository.findById(id);
  
  // Apenas o criador pode editar
  if (existingCard.createdBy !== userId) {
    throw new ForbiddenError('Você só pode editar seus próprios cards');
  }
  
  return await this.cardRepository.update(id, data);
}
```

#### **Rate Limiting**
```typescript
// middleware/rateLimit.ts
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas tentativas, tente novamente em 15 minutos'
});
```

---

## 🗄️ Database (SQLite + Prisma)

### 📊 Schema do Banco
```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  locale       String   @default("pt-BR")
  createdAt    DateTime @default(now())
  cards        Card[]
  comments     Comment[]
  votes        Vote[]
  pollVotes    PollVote[]
}

model Card {
  id          String    @id @default(cuid())
  title       String
  description String
  columnId    String
  createdBy   String
  position    Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  column      Column   @relation(fields: [columnId], references: [id])
  creator     User     @relation(fields: [createdBy], references: [id])
  comments    Comment[]
  votes       Vote[]
  polls       Poll[]
}

model Column {
  id        String   @id @default(cuid())
  name      String
  position  Int
  createdAt DateTime @default(now())
  cards     Card[]
}

model Comment {
  id        String   @id @default(cuid())
  body      String
  cardId    String
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  card      Card     @relation(fields: [cardId], references: [id])
  creator   User     @relation(fields: [createdBy], references: [id])
}

model Vote {
  id     String @id @default(cuid())
  cardId String
  userId String
  card   Card   @relation(fields: [cardId], references: [id])
  user   User   @relation(fields: [userId], references: [id])
  @@unique([cardId, userId])
}

model Poll {
  id            String     @id @default(cuid())
  question      String
  cardId        String
  createdBy     String
  allowMultiple Boolean    @default(false)
  isSecret      Boolean    @default(false)
  isActive      Boolean    @default(true)
  endsAt        DateTime?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
  card          Card       @relation(fields: [cardId], references: [id])
  creator       User       @relation(fields: [createdBy], references: [id])
  options       PollOption[]
}

model PollOption {
  id       String      @id @default(cuid())
  text     String
  pollId   String
  poll     Poll        @relation(fields: [pollId], references: [id])
  votes    PollVote[]
}

model PollVote {
  id       String      @id @default(cuid())
  pollId   String
  optionId String
  userId   String
  createdAt DateTime   @default(now())
  poll     Poll        @relation(fields: [pollId], references: [id])
  option   PollOption  @relation(fields: [optionId], references: [id])
  user     User        @relation(fields: [userId], references: [id])
  @@unique([pollId, optionId, userId])
}
```

---

## 🔄 Fluxo de Comunicação Real-time

### 📡 Socket.IO Events

#### **Card Events**
```typescript
// Backend broadcasting
socketManager.broadcastCardCreated(card);
socketManager.broadcastCardUpdated(card);
socketManager.broadcastCardDeleted(cardId);
socketManager.broadcastCardMoved(card);

// Frontend listening
socketService.on('card:created', handleCardCreated);
socketService.on('card:updated', handleCardUpdated);
socketService.on('card:deleted', handleCardDeleted);
socketService.on('card:moved', handleCardMoved);
```

#### **Comment Events**
```typescript
// Backend
socketManager.broadcastCommentCreated(comment);
socketManager.broadcastCommentUpdated(comment);
socketManager.broadcastCommentDeleted(commentId);

// Frontend
socketService.on('comment:created', handleCommentCreated);
socketService.on('comment:updated', handleCommentUpdated);
socketService.on('comment:deleted', handleCommentDeleted);
```

#### **Vote Events**
```typescript
// Backend
socketManager.broadcastCardVoted({ cardId, userId });
socketManager.broadcastCardVoteRemoved({ cardId, userId });

// Frontend
socketService.on('card:vote:added', handleCardVote);
socketService.on('card:vote:removed', handleCardVoteRemoved);
```

#### **Poll Events**
```typescript
// Backend
socketManager.broadcastPollCreated(poll);
socketManager.broadcastPollVoted({ pollId, optionId, userId });
socketManager.broadcastPollVoteRemoved({ pollId, optionId, userId });

// Frontend
socketService.on('poll:created', handlePollCreated);
socketService.on('poll:voted', handlePollVoted);
socketService.on('poll:vote:removed', handlePollVoteRemoved);
```

---

## 🚀 Fluxo de Dados Completo

### 1️⃣ **Criação de Card**
```
Frontend → API POST /cards → Backend Service → Database → Socket.IO Broadcast → Todos os clientes
```

### 2️⃣ **Voto em Card**
```
Frontend → API POST /cards/:id/votes → Backend Service → Database → Socket.IO Broadcast → Todos os clientes
```

### 3️⃣ **Comentário**
```
Frontend → API POST /cards/:id/comments → Backend Service → Database → Socket.IO Broadcast → Todos os clientes
```

### 4️⃣ **Enquete**
```
Frontend → API POST /polls → Backend Service → Database → Socket.IO Broadcast → Todos os clientes
```

---

## 🔐 Sistema de Permissões

### 📋 Regras de Acesso

#### **Cards (Ideias)**
- ✅ **Todos** podem: ver, mover entre colunas, votar, comentar
- 🔒 **Apenas criador** pode: editar conteúdo, excluir

#### **Comentários**
- ✅ **Todos** podem: ver comentários
- 🔒 **Apenas criador** pode: editar, excluir

#### **Enquetes**
- ✅ **Todos** podem: ver, votar
- 🔒 **Apenas criador do card** pode: criar, editar, excluir

#### **Colunas**
- ✅ **Todos** podem: ver, reordenar
- 🔒 **Admin** pode: criar, editar, excluir

---

## 🎯 Funcionalidades Principais

### 📋 **Gestão de Cards**
- **Criar** ideias com título e descrição
- **Editar** (apenas criador)
- **Mover** entre colunas (drag & drop)
- **Excluir** (apenas criador)
- **Votar** (like/unlike)

### 🗳️ **Sistema de Enquetes**
- **Criar** enquetes por card (apenas dono do card)
- **Votar** em múltiplas opções
- **Voto secreto** ou público
- **Enquetes ativas/inativas**

### 💬 **Comentários**
- **Adicionar** comentários
- **Editar** (apenas criador)
- **Excluir** (apenas criador)
- **Timestamp** automático

### 🔍 **Busca e Filtros**
- **Busca por texto** (título, descrição, criador)
- **Filtro por coluna** (dropdown)
- **Filtro por usuários** (multi-select)
- **Filtros ativos** com chips removíveis

### 📊 **Real-time Updates**
- **Todas as ações** são sincronizadas instantaneamente
- **Sem necessidade de refresh** da página
- **Experiência colaborativa** fluida

---

## 🛠️ Tecnologias e Bibliotecas

### 🖥️ **Frontend**
```json
{
  "react": "^18.3.1",           // Framework principal
  "typescript": "^5.8.3",       // Type safety
  "zustand": "^5.0.8",          // Estado global
  "socket.io-client": "^4.8.1", // Real-time
  "react-router-dom": "^6.30.1", // Roteamento
  "framer-motion": "^12.23.15", // Animações
  "tailwindcss": "^3.4.17",     // CSS framework
  "i18next": "^25.5.2",         // Internacionalização
  "@dnd-kit/core": "^6.3.1",    // Drag & drop
  "lucide-react": "^0.462.0"    // Ícones
}
```

### ⚙️ **Backend**
```json
{
  "express": "^4.19.2",         // Framework web
  "socket.io": "^4.8.1",        // Real-time
  "@prisma/client": "^5.19.1",  // ORM
  "jsonwebtoken": "^9.0.2",     // Autenticação
  "bcryptjs": "^2.4.3",         // Hash de senhas
  "zod": "^3.25.76",            // Validação
  "cors": "^2.8.5",             // CORS
  "helmet": "^7.1.0"            // Segurança
}
```

### 🗄️ **Database**
```json
{
  "sqlite": "Database local",
  "prisma": "^5.19.1"           // ORM e migrations
}
```

---

## 🚀 Como Executar o Projeto

### 1️⃣ **Instalação**
```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

### 2️⃣ **Configuração do Banco**
```bash
# Gerar cliente Prisma
npm run backend:db:generate

# Aplicar migrations
npm run backend:db:push

# Popular com dados iniciais
npm run backend:db:seed
```

### 3️⃣ **Execução**
```bash
# Backend (porta 3001)
npm run backend:dev

# Frontend (porta 5173)
npm run dev
```

---

## 📈 Diferenciais Técnicos

### ⚡ **Performance**
- **SPA** com carregamento rápido
- **Lazy loading** de componentes
- **Debounce** em buscas
- **Otimistic updates** para UX fluida

### 🔒 **Segurança**
- **JWT** com expiração
- **Rate limiting** contra spam
- **Validação rigorosa** com Zod
- **Princípio do menor privilégio**

### 🌐 **Escalabilidade**
- **Arquitetura em camadas** bem definida
- **Separação de responsabilidades**
- **Type safety** end-to-end
- **Real-time** eficiente com Socket.IO

### 🎨 **UX/UI**
- **Design system** consistente
- **Responsive** mobile-first
- **Animações** suaves
- **Feedback visual** imediato

---

## 🎯 Conclusão

O **Kanban de Ideias** é uma aplicação moderna e robusta que demonstra:

- ✅ **Arquitetura escalável** com separação clara de responsabilidades
- ✅ **Real-time collaboration** com Socket.IO
- ✅ **Type safety** completo com TypeScript
- ✅ **Segurança** implementada seguindo boas práticas
- ✅ **UX moderna** com componentes acessíveis
- ✅ **Internacionalização** completa
- ✅ **Performance otimizada** para colaboração em tempo real

**Ideal para apresentar conhecimentos em:**
- React 18 + TypeScript
- Node.js + Express
- Socket.IO para real-time
- Prisma ORM
- Autenticação JWT
- Arquitetura de software
- UI/UX moderna
