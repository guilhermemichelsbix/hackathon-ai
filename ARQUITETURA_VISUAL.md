# 🏗️ Diagramas da Arquitetura - Kanban de Ideias

## 📊 Fluxo de Dados Real-time

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React SPA)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Kanban    │  │ CardDetails │  │  AuthModal  │            │
│  │   Board     │  │   Sheet     │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ZUSTAND STORE (Estado Global)             │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │   │
│  │  │  Cards  │ │Comments │ │  Votes  │ │  Polls  │     │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 SOCKET.IO CLIENT                       │   │
│  │  • card:created  • comment:created  • vote:added      │   │
│  │  • card:updated  • comment:updated  • vote:removed    │   │
│  │  • card:deleted  • comment:deleted  • poll:voted      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP REST + WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │ Controllers │  │  Services   │  │Repositories │            │
│  │   (HTTP)    │  │ (Business)  │  │  (Data)     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│         │                 │                 │                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SOCKET.IO SERVER                          │   │
│  │  • broadcastCardCreated()  • broadcastCommentCreated() │   │
│  │  • broadcastCardUpdated()  • broadcastCommentUpdated() │   │
│  │  • broadcastCardDeleted()  • broadcastCommentDeleted() │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 MIDDLEWARE STACK                       │   │
│  │  • JWT Authentication  • CORS  • Rate Limiting        │   │
│  │  • Zod Validation     • Error Handling                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ SQL Queries
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE (SQLite)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│  │  Users  │ │  Cards  │ │Columns  │ │Comments │ │  Polls  │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │
│  ┌─────────┐ ┌─────────┐                                     │
│  │  Votes  │ │PollVotes│                                     │
│  └─────────┘ └─────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Real-time (Exemplo: Criar Card)

```
1. USER ACTION
   ┌─────────────┐
   │ Click "Add  │
   │   Card"     │
   └─────────────┘
           │
           ▼

2. FRONTEND
   ┌─────────────────────────────────┐
   │ KanbanBoard.tsx                 │
   │ handleCreateCard()              │
   │ ↓                               │
   │ kanbanService.createCard()      │
   │ ↓                               │
   │ apiService.post('/cards')       │
   └─────────────────────────────────┘
           │
           ▼ HTTP POST

3. BACKEND
   ┌─────────────────────────────────┐
   │ cardController.createCard()     │
   │ ↓                               │
   │ cardService.createCard()        │
   │ ↓                               │
   │ cardRepository.create()         │
   │ ↓                               │
   │ DATABASE INSERT                 │
   │ ↓                               │
   │ socketManager.broadcastCardCreated()
   └─────────────────────────────────┘
           │
           ▼ Socket.IO Broadcast

4. ALL CLIENTS
   ┌─────────────────────────────────┐
   │ useSocket.ts                    │
   │ handleCardCreated()             │
   │ ↓                               │
   │ addCard(card)                   │
   │ ↓                               │
   │ UI UPDATES AUTOMATICALLY        │
   └─────────────────────────────────┘
```

## 🏛️ Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   React     │ │  Zustand    │ │ Socket.IO   │          │
│  │ Components  │ │   Store     │ │   Client    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST + WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Controllers  │ │  Services   │ │Middleware   │          │
│  │  (HTTP)     │ │(Business)   │ │(Auth/CORS)  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ Repository Pattern
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │Repositories │ │   Prisma    │ │  SQLite     │          │
│  │  (Data)     │ │    ORM      │ │ Database    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                             │
└─────────────────────────────────────────────────────────────┘

1. USER INPUT
   ┌─────────────┐
   │ Email +     │
   │ Password    │
   └─────────────┘
           │
           ▼

2. FRONTEND
   ┌─────────────────────────────────┐
   │ LoginPage.tsx                   │
   │ handleSubmit()                  │
   │ ↓                               │
   │ authService.login()             │
   │ ↓                               │
   │ apiService.post('/auth/login')  │
   └─────────────────────────────────┘
           │
           ▼ HTTP POST

3. BACKEND
   ┌─────────────────────────────────┐
   │ authController.login()          │
   │ ↓                               │
   │ authService.validateUser()      │
   │ ↓                               │
   │ bcrypt.compare(password)        │
   │ ↓                               │
   │ jwt.sign({ userId, email })     │
   │ ↓                               │
   │ return { token, user }          │
   └─────────────────────────────────┘
           │
           ▼ HTTP Response

4. FRONTEND STORE
   ┌─────────────────────────────────┐
   │ setUser(user)                   │
   │ ↓                               │
   │ localStorage.setItem('token')   │
   │ ↓                               │
   │ navigate('/kanban')             │
   └─────────────────────────────────┘

5. PROTECTED ROUTES
   ┌─────────────────────────────────┐
   │ Every API call includes:        │
   │ Authorization: Bearer <token>   │
   │ ↓                               │
   │ middleware/auth.ts validates    │
   │ ↓                               │
   │ req.user = decoded JWT          │
   └─────────────────────────────────┘
```

## 📊 Estados e Dados

```
┌─────────────────────────────────────────────────────────────┐
│                    ZUSTAND STORE                            │
├─────────────────────────────────────────────────────────────┤
│ State:                                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │    User     │ │   Board     │ │  UI State   │           │
│ │ • id        │ │ • columns   │ │ • loading   │           │
│ │ • name      │ │ • cards     │ │ • search    │           │
│ │ • email     │ │ • comments  │ │ • filters   │           │
│ │ • locale    │ │ • votes     │ │ • selected  │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ Actions:                                                    │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ Auth        │ │ Kanban      │ │ Real-time   │           │
│ │ • setUser   │ │ • createCard│ │ • addCard   │           │
│ │ • logout    │ │ • updateCard│ │ • updateCard│           │
│ │ • login     │ │ • deleteCard│ │ • addComment│           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Eventos Socket.IO

```
┌─────────────────────────────────────────────────────────────┐
│                    REAL-TIME EVENTS                         │
├─────────────────────────────────────────────────────────────┤
│ Card Events:                                                │
│ • card:created    → Novo card criado                       │
│ • card:updated    → Card editado                           │
│ • card:deleted    → Card removido                          │
│ • card:moved      → Card movido entre colunas              │
│ • card:vote:added → Voto adicionado                       │
│ • card:vote:removed → Voto removido                       │
│                                                             │
│ Comment Events:                                             │
│ • comment:created → Novo comentário                       │
│ • comment:updated → Comentário editado                    │
│ • comment:deleted → Comentário removido                   │
│                                                             │
│ Poll Events:                                                │
│ • poll:created    → Nova enquete                          │
│ • poll:updated    → Enquete editada                       │
│ • poll:deleted    → Enquete removida                      │
│ • poll:voted      → Voto em enquete                       │
│ • poll:vote:removed → Voto removido da enquete           │
│                                                             │
│ Column Events:                                              │
│ • column:created  → Nova coluna                           │
│ • column:updated  → Coluna editada                        │
│ • column:deleted  → Coluna removida                       │
│ • columns:reordered → Colunas reordenadas                 │
└─────────────────────────────────────────────────────────────┘
```

## 🛡️ Segurança e Validação

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
├─────────────────────────────────────────────────────────────┤
│ 1. AUTHENTICATION                                           │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   JWT       │ │ bcrypt      │ │ Rate Limit  │           │
│ │  Tokens     │ │ Password    │ │ (100 req/   │           │
│ │             │ │   Hash      │ │  15 min)    │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ 2. AUTHORIZATION                                            │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ Ownership   │ │ Role-based  │ │ Permission  │           │
│ │ Validation  │ │ Access      │ │  Checks     │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ 3. VALIDATION                                               │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   Zod       │ │ Input       │ │ Output      │           │
│ │ Schemas     │ │ Sanitization│ │ Filtering   │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ 4. SECURITY HEADERS                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   CORS      │ │   Helmet    │ │   HTTPS     │           │
│ │   Policy    │ │   Security  │ │   Only      │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Resumo para Apresentação

### **1. Visão Geral (30 segundos)**
- **Kanban de Ideias**: Plataforma colaborativa para gestão de pipeline de inovação
- **Stack Moderna**: React 18 + Node.js + Socket.IO + Prisma
- **Real-time**: Todas as ações sincronizadas instantaneamente

### **2. Arquitetura (1 minuto)**
- **Frontend SPA**: React com TypeScript, Zustand para estado, Socket.IO para real-time
- **Backend API**: Express.js com arquitetura em camadas (Controller → Service → Repository)
- **Database**: SQLite com Prisma ORM para type safety

### **3. Funcionalidades (1 minuto)**
- **Cards**: Criar, editar, mover, excluir, votar
- **Comentários**: CRUD completo com permissões
- **Enquetes**: Sistema de votação integrado
- **Filtros**: Busca por texto + filtros por coluna/usuário

### **4. Real-time (1 minuto)**
- **Socket.IO**: 15+ eventos diferentes para sincronização
- **Fluxo**: Ação → API → Database → Broadcast → Todos os clientes
- **UX**: Sem necessidade de refresh, colaboração fluida

### **5. Segurança (30 segundos)**
- **JWT Authentication**: Tokens seguros
- **Princípio do Menor Privilégio**: Apenas criadores podem editar/excluir
- **Validação Zod**: Input sanitization e type safety

### **6. Demo (2 minutos)**
- Criar card, comentar, votar, criar enquete
- Mostrar real-time em múltiplas abas
- Filtros e busca funcionando
- Responsividade mobile

**Total: ~6 minutos de apresentação técnica + demo**
