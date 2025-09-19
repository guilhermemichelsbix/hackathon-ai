import { v4 as uuidv4 } from 'uuid';
import type { User, Column, Card, Vote, Comment, Board } from '@/types/kanban';

// Mock users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Ana Silva',
    email: 'ana.silva@empresa.com',
    locale: 'pt-BR',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'user-2',
    name: 'Carlos Santos',
    email: 'carlos.santos@empresa.com',
    locale: 'pt-BR',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'user-3',
    name: 'Maria Costa',
    email: 'maria.costa@empresa.com',
    locale: 'pt-BR',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'user-4',
    name: 'João Oliveira',
    email: 'joao.oliveira@empresa.com',
    locale: 'pt-BR',
    createdAt: new Date('2024-01-08'),
  },
  {
    id: 'user-5',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    locale: 'en',
    createdAt: new Date('2024-01-12'),
  },
];

// Mock columns - representing innovation pipeline stages
export const mockColumns: Column[] = [
  {
    id: 'col-1',
    name: 'Backlog',
    position: 0,
    color: '#64748b',
    description: 'Ideias aguardando análise inicial',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'col-2',
    name: 'Em Análise',
    position: 1,
    color: '#f59e0b',
    description: 'Ideias sendo avaliadas pela equipe',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'col-3',
    name: 'Aprovado',
    position: 2,
    color: '#10b981',
    description: 'Ideias aprovadas e priorizadas',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'col-4',
    name: 'Em Desenvolvimento',
    position: 3,
    color: '#3b82f6',
    description: 'Ideias em implementação',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'col-5',
    name: 'Concluído',
    position: 4,
    color: '#8b5cf6',
    description: 'Ideias implementadas com sucesso',
    createdAt: new Date('2024-01-01'),
  },
];

// Mock votes
const mockVotes: Vote[] = [
  {
    id: uuidv4(),
    cardId: 'card-1',
    userId: 'user-2',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: uuidv4(),
    cardId: 'card-1',
    userId: 'user-3',
    createdAt: new Date('2024-01-17'),
  },
  {
    id: uuidv4(),
    cardId: 'card-1',
    userId: 'user-4',
    createdAt: new Date('2024-01-18'),
  },
  {
    id: uuidv4(),
    cardId: 'card-2',
    userId: 'user-1',
    createdAt: new Date('2024-01-22'),
  },
  {
    id: uuidv4(),
    cardId: 'card-2', 
    userId: 'user-5',
    createdAt: new Date('2024-01-23'),
  },
  {
    id: uuidv4(),
    cardId: 'card-3',
    userId: 'user-1',
    createdAt: new Date('2024-02-02'),
  },
  {
    id: uuidv4(),
    cardId: 'card-4',
    userId: 'user-2',
    createdAt: new Date('2024-02-05'),
  },
  {
    id: uuidv4(),
    cardId: 'card-4',
    userId: 'user-3',
    createdAt: new Date('2024-02-06'),
  },
];

// Mock comments
const mockComments: Comment[] = [
  {
    id: uuidv4(),
    cardId: 'card-1',
    body: 'Excelente ideia! Isso pode realmente revolucionar nosso atendimento ao cliente.',
    createdBy: 'user-2',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    user: mockUsers[1],
  },
  {
    id: uuidv4(),
    cardId: 'card-1',
    body: 'Concordo! Precisamos pensar também na integração com nossos sistemas atuais.',
    createdBy: 'user-3',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    user: mockUsers[2],
  },
  {
    id: uuidv4(),
    cardId: 'card-2',
    body: 'Interessante abordagem. Como isso funcionaria com o orçamento atual?',
    createdBy: 'user-4',
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23'),
    user: mockUsers[3],
  },
  {
    id: uuidv4(),
    cardId: 'card-3',
    body: 'Já implementamos algo similar na equipe de marketing. Posso compartilhar os resultados.',
    createdBy: 'user-1',
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02'),
    user: mockUsers[0],
  },
  {
    id: uuidv4(),
    cardId: 'card-5',
    body: 'Great concept! This aligns perfectly with our sustainability goals.',
    createdBy: 'user-5',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12'),
    user: mockUsers[4],
  },
];

// Mock cards with realistic innovation ideas
export const mockCards: Card[] = [
  {
    id: 'card-1',
    title: 'Chatbot IA para Atendimento 24/7',
    description: 'Implementar um chatbot com inteligência artificial para atendimento ao cliente 24 horas, reduzindo tempo de espera e melhorando a experiência do usuário. O sistema seria capaz de resolver 80% das dúvidas mais comuns automaticamente.',
    columnId: 'col-2', // Em Análise
    createdBy: 'user-1',
    position: 0,
    votes: mockVotes.filter(v => v.cardId === 'card-1'),
    comments: mockComments.filter(c => c.cardId === 'card-1'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: 'card-2',
    title: 'Sistema de Gamificação para Funcionários',
    description: 'Criar um sistema de gamificação interno que recompense funcionários por alcançar metas, colaborar em projetos e contribuir com ideias inovadoras. Incluiria rankings, badges e recompensas tangíveis.',
    columnId: 'col-1', // Backlog
    createdBy: 'user-2',
    position: 0,
    votes: mockVotes.filter(v => v.cardId === 'card-2'),
    comments: mockComments.filter(c => c.cardId === 'card-2'),
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-23'),
  },
  {
    id: 'card-3',
    title: 'App Mobile para Gestão de Projetos',
    description: 'Desenvolver um aplicativo mobile nativo que permita aos gestores acompanhar o progresso dos projetos em tempo real, com notificações push, relatórios automáticos e integração com calendário.',
    columnId: 'col-3', // Aprovado
    createdBy: 'user-3',
    position: 0,
    votes: mockVotes.filter(v => v.cardId === 'card-3'),
    comments: mockComments.filter(c => c.cardId === 'card-3'),
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-02'),
  },
  {
    id: 'card-4',
    title: 'Plataforma de E-learning Corporativo',
    description: 'Criar uma plataforma interna de educação continuada com cursos personalizados, trilhas de aprendizado baseadas em IA e certificações internas. Foco em upskilling e reskilling dos colaboradores.',
    columnId: 'col-4', // Em Desenvolvimento
    createdBy: 'user-4',
    position: 0,
    votes: mockVotes.filter(v => v.cardId === 'card-4'),
    comments: mockComments.filter(c => c.cardId === 'card-4'),
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-08'),
  },
  {
    id: 'card-5',
    title: 'Dashboard de Sustentabilidade',
    description: 'Implementar um dashboard em tempo real que monitore e visualize as métricas de sustentabilidade da empresa: consumo de energia, emissões de carbono, reciclagem e outras métricas ESG.',
    columnId: 'col-1', // Backlog
    createdBy: 'user-5',
    position: 1,
    votes: mockVotes.filter(v => v.cardId === 'card-5'),
    comments: mockComments.filter(c => c.cardId === 'card-5'),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12'),
  },
  {
    id: 'card-6',
    title: 'Sistema de Feedback 360° Digital',
    description: 'Digitalizar o processo de avaliação 360° com uma plataforma que facilite coleta de feedback, análise automatizada e geração de planos de desenvolvimento personalizados.',
    columnId: 'col-5', // Concluído
    createdBy: 'user-1',
    position: 0,
    votes: [],
    comments: [],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    id: 'card-7',
    title: 'Marketplace Interno de Serviços',
    description: 'Criar um marketplace interno onde diferentes departamentos podem oferecer e solicitar serviços uns dos outros, otimizando recursos e promovendo colaboração interdepartamental.',
    columnId: 'col-2', // Em Análise
    createdBy: 'user-3',
    position: 1,
    votes: [],
    comments: [],
    createdAt: new Date('2024-02-08'),
    updatedAt: new Date('2024-02-08'),
  },
  {
    id: 'card-8',
    title: 'IA para Análise Preditiva de Vendas',
    description: 'Implementar machine learning para analisar padrões históricos de vendas e prever tendências futuras, auxiliando no planejamento estratégico e gestão de estoque.',
    columnId: 'col-1', // Backlog
    createdBy: 'user-2',
    position: 2,
    votes: [],
    comments: [],
    createdAt: new Date('2024-02-14'),
    updatedAt: new Date('2024-02-14'),
  },
];

// Create complete board
export const mockBoard: Board = {
  columns: mockColumns,
  cards: mockCards,
};

// Current logged user for demo
export const currentUser: User = mockUsers[0]; // Ana Silva

// Function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Function to simulate API delay
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};