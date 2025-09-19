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
      where: { id: 'cmfr46mmc0000jnxebw63kt76' },
      update: {},
      create: {
        id: 'cmfr46mmc0000jnxebw63kt76',
        name: 'Backlog',
        position: 0,
      },
    }),
    prisma.column.upsert({
      where: { id: 'cmfr46mmc0001jnxemx6lt23u' },
      update: {},
      create: {
        id: 'cmfr46mmc0001jnxemx6lt23u',
        name: 'Em Análise',
        position: 1,
      },
    }),
    prisma.column.upsert({
      where: { id: 'cmfr46mmc0002jnxejo9pnbhz' },
      update: {},
      create: {
        id: 'cmfr46mmc0002jnxejo9pnbhz',
        name: 'Aprovado',
        position: 2,
      },
    }),
    prisma.column.upsert({
      where: { id: 'cmfr46mmc0003jnxezr51xyw4' },
      update: {},
      create: {
        id: 'cmfr46mmc0003jnxezr51xyw4',
        name: 'Em Desenvolvimento',
        position: 3,
      },
    }),
    prisma.column.upsert({
      where: { id: 'cmfr46mmc0004jnxe9d2hvep2' },
      update: {},
      create: {
        id: 'cmfr46mmc0004jnxe9d2hvep2',
        name: 'Concluído',
        position: 4,
      },
    }),
  ]);

  console.log(`✅ ${columns.length} colunas criadas`);

  // Create cards
  const cards = await Promise.all([
    prisma.card.upsert({
      where: { id: 'cmfr46mmc0005jnxex63prjoi' },
      update: {},
      create: {
        id: 'cmfr46mmc0005jnxex63prjoi',
        title: 'Chatbot IA para Atendimento 24/7',
        description: 'Implementar um chatbot com inteligência artificial para atendimento ao cliente 24 horas, reduzindo tempo de espera e melhorando a experiência do usuário. O sistema seria capaz de resolver 80% das dúvidas mais comuns automaticamente.',
        columnId: columns[1].id, // Em Análise
        createdBy: users[0].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'cmfr46mmc0006jnxex63prjoj' },
      update: {},
      create: {
        id: 'cmfr46mmc0006jnxex63prjoj',
        title: 'Sistema de Gamificação para Funcionários',
        description: 'Criar um sistema de gamificação interno que recompense funcionários por alcançar metas, colaborar em projetos e contribuir com ideias inovadoras. Incluiria rankings, badges e recompensas tangíveis.',
        columnId: columns[0].id, // Backlog
        createdBy: users[1].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'cmfr46mmc0007jnxex63prjok' },
      update: {},
      create: {
        id: 'cmfr46mmc0007jnxex63prjok',
        title: 'App Mobile para Gestão de Projetos',
        description: 'Desenvolver um aplicativo mobile nativo que permita aos gestores acompanhar o progresso dos projetos em tempo real, com notificações push, relatórios automáticos e integração com calendário.',
        columnId: columns[2].id, // Aprovado
        createdBy: users[2].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'cmfr46mmc0008jnxex63prjol' },
      update: {},
      create: {
        id: 'cmfr46mmc0008jnxex63prjol',
        title: 'Plataforma de E-learning Corporativo',
        description: 'Criar uma plataforma interna de educação continuada com cursos personalizados, trilhas de aprendizado baseadas em IA e certificações internas. Foco em upskilling e reskilling dos colaboradores.',
        columnId: columns[3].id, // Em Desenvolvimento
        createdBy: users[3].id,
        position: 0,
      },
    }),
    prisma.card.upsert({
      where: { id: 'cmfr46mmc0009jnxex63prjom' },
      update: {},
      create: {
        id: 'cmfr46mmc0009jnxex63prjom',
        title: 'Dashboard de Sustentabilidade',
        description: 'Implementar um dashboard em tempo real que monitore e visualize as métricas de sustentabilidade da empresa: consumo de energia, emissões de carbono, reciclagem e outras métricas ESG.',
        columnId: columns[0].id, // Backlog
        createdBy: users[4].id,
        position: 1,
      },
    }),
  ]);

  console.log(`✅ ${cards.length} cards criados`);

  // Create some votes
  const votes = await Promise.all([
    prisma.vote.upsert({
      where: {
        cardId_userId: {
          cardId: cards[0].id,
          userId: users[1].id,
        },
      },
      update: {},
      create: {
        cardId: cards[0].id,
        userId: users[1].id,
      },
    }),
    prisma.vote.upsert({
      where: {
        cardId_userId: {
          cardId: cards[0].id,
          userId: users[2].id,
        },
      },
      update: {},
      create: {
        cardId: cards[0].id,
        userId: users[2].id,
      },
    }),
    prisma.vote.upsert({
      where: {
        cardId_userId: {
          cardId: cards[0].id,
          userId: users[3].id,
        },
      },
      update: {},
      create: {
        cardId: cards[0].id,
        userId: users[3].id,
      },
    }),
    prisma.vote.upsert({
      where: {
        cardId_userId: {
          cardId: cards[1].id,
          userId: users[0].id,
        },
      },
      update: {},
      create: {
        cardId: cards[1].id,
        userId: users[0].id,
      },
    }),
    prisma.vote.upsert({
      where: {
        cardId_userId: {
          cardId: cards[1].id,
          userId: users[4].id,
        },
      },
      update: {},
      create: {
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
