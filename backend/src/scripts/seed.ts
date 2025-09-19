import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/utils/bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Create users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ana.silva@empresa.com' },
      update: {},
      create: {
        name: 'Ana Silva',
        email: 'ana.silva@empresa.com',
        passwordHash: await hashPassword('123456'),
        locale: 'pt-BR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'carlos.santos@empresa.com' },
      update: {},
      create: {
        name: 'Carlos Santos',
        email: 'carlos.santos@empresa.com',
        passwordHash: await hashPassword('123456'),
        locale: 'pt-BR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'maria.costa@empresa.com' },
      update: {},
      create: {
        name: 'Maria Costa',
        email: 'maria.costa@empresa.com',
        passwordHash: await hashPassword('123456'),
        locale: 'pt-BR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'joao.oliveira@empresa.com' },
      update: {},
      create: {
        name: 'João Oliveira',
        email: 'joao.oliveira@empresa.com',
        passwordHash: await hashPassword('123456'),
        locale: 'pt-BR',
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.johnson@company.com' },
      update: {},
      create: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        passwordHash: await hashPassword('123456'),
        locale: 'en',
      },
    }),
  ]);

  console.log(`✅ ${users.length} usuários criados`);

  // Create columns
  const columns = await Promise.all([
    prisma.column.upsert({
      where: { id: 'col-1' },
      update: {},
      create: {
        id: 'col-1',
        name: 'Backlog',
        position: 0,
      },
    }),
    prisma.column.upsert({
      where: { id: 'col-2' },
      update: {},
      create: {
        id: 'col-2',
        name: 'Em Análise',
        position: 1,
      },
    }),
    prisma.column.upsert({
      where: { id: 'col-3' },
      update: {},
      create: {
        id: 'col-3',
        name: 'Aprovado',
        position: 2,
      },
    }),
    prisma.column.upsert({
      where: { id: 'col-4' },
      update: {},
      create: {
        id: 'col-4',
        name: 'Em Desenvolvimento',
        position: 3,
      },
    }),
    prisma.column.upsert({
      where: { id: 'col-5' },
      update: {},
      create: {
        id: 'col-5',
        name: 'Concluído',
        position: 4,
      },
    }),
  ]);

  console.log(`✅ ${columns.length} colunas criadas`);

  // Create cards
  const cards = await Promise.all([
    prisma.card.upsert({
      where: { id: 'card-1' },
      update: {},
      create: {
        id: 'card-1',
        title: 'Chatbot IA para Atendimento 24/7',
        description: 'Implementar um chatbot com inteligência artificial para atendimento ao cliente 24 horas, reduzindo tempo de espera e melhorando a experiência do usuário. O sistema seria capaz de resolver 80% das dúvidas mais comuns automaticamente.',
        columnId: 'col-2',
        createdBy: users[0].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'card-2' },
      update: {},
      create: {
        id: 'card-2',
        title: 'Sistema de Gamificação para Funcionários',
        description: 'Criar um sistema de gamificação interno que recompense funcionários por alcançar metas, colaborar em projetos e contribuir com ideias inovadoras. Incluiria rankings, badges e recompensas tangíveis.',
        columnId: 'col-1',
        createdBy: users[1].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'card-3' },
      update: {},
      create: {
        id: 'card-3',
        title: 'App Mobile para Gestão de Projetos',
        description: 'Desenvolver um aplicativo mobile nativo que permita aos gestores acompanhar o progresso dos projetos em tempo real, com notificações push, relatórios automáticos e integração com calendário.',
        columnId: 'col-3',
        createdBy: users[2].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'card-4' },
      update: {},
      create: {
        id: 'card-4',
        title: 'Plataforma de E-learning Corporativo',
        description: 'Criar uma plataforma interna de educação continuada com cursos personalizados, trilhas de aprendizado baseadas em IA e certificações internas. Foco em upskilling e reskilling dos colaboradores.',
        columnId: 'col-4',
        createdBy: users[3].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'card-5' },
      update: {},
      create: {
        id: 'card-5',
        title: 'Dashboard de Sustentabilidade',
        description: 'Implementar um dashboard em tempo real que monitore e visualize as métricas de sustentabilidade da empresa: consumo de energia, emissões de carbono, reciclagem e outras métricas ESG.',
        columnId: 'col-1',
        createdBy: users[4].id,
        position: 1,
      },
    }),
  ]);

  console.log(`✅ ${cards.length} cards criados`);

  // Create some votes
  const votes = await Promise.all([
    prisma.vote.create({
      data: {
        cardId: cards[0].id,
        userId: users[1].id,
      },
    }),
    prisma.vote.create({
      data: {
        cardId: cards[0].id,
        userId: users[2].id,
      },
    }),
    prisma.vote.create({
      data: {
        cardId: cards[0].id,
        userId: users[3].id,
      },
    }),
    prisma.vote.create({
      data: {
        cardId: cards[1].id,
        userId: users[0].id,
      },
    }),
    prisma.vote.create({
      data: {
        cardId: cards[1].id,
        userId: users[4].id,
      },
    }),
  ]);

  console.log(`✅ ${votes.length} votos criados`);

  // Create some comments
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        body: 'Excelente ideia! Isso pode realmente revolucionar nosso atendimento ao cliente.',
        cardId: cards[0].id,
        createdBy: users[1].id,
      },
    }),
    prisma.comment.create({
      data: {
        body: 'Concordo! Precisamos pensar também na integração com nossos sistemas atuais.',
        cardId: cards[0].id,
        createdBy: users[2].id,
      },
    }),
    prisma.comment.create({
      data: {
        body: 'Interessante abordagem. Como isso funcionaria com o orçamento atual?',
        cardId: cards[1].id,
        createdBy: users[3].id,
      },
    }),
    prisma.comment.create({
      data: {
        body: 'Já implementamos algo similar na equipe de marketing. Posso compartilhar os resultados.',
        cardId: cards[2].id,
        createdBy: users[0].id,
      },
    }),
    prisma.comment.create({
      data: {
        body: 'Great concept! This aligns perfectly with our sustainability goals.',
        cardId: cards[4].id,
        createdBy: users[4].id,
      },
    }),
  ]);

  console.log(`✅ ${comments.length} comentários criados`);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Resumo:');
  console.log(`- ${users.length} usuários`);
  console.log(`- ${columns.length} colunas`);
  console.log(`- ${cards.length} cards`);
  console.log(`- ${votes.length} votos`);
  console.log(`- ${comments.length} comentários`);
  console.log('\n🔐 Credenciais de teste:');
  console.log('Email: ana.silva@empresa.com | Senha: 123456');
  console.log('Email: carlos.santos@empresa.com | Senha: 123456');
  console.log('Email: maria.costa@empresa.com | Senha: 123456');
  console.log('Email: joao.oliveira@empresa.com | Senha: 123456');
  console.log('Email: sarah.johnson@company.com | Senha: 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
