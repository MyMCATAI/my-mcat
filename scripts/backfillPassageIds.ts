import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillPassageIds() {
  // Step 1: Update Tests
  const tests = await prisma.test.findMany({
    include: {
      questions: {
        include: {
          question: true,
        },
      },
    },
  });

  for (const test of tests) {
    const passageIds = test.questions
      .map(tq => tq.question.passageId)
      .filter((id): id is string => id !== null);

    if (passageIds.length > 0) {
      const passageId = passageIds[0]; // Use the first non-null passageId
      await prisma.test.update({
        where: { id: test.id },
        data: { passageId },
      });
      console.log(`Updated Test ${test.id} with passageId ${passageId}`);
    }
  }

  // Step 2: Update UserTests
  const userTests = await prisma.userTest.findMany({
    include: {
      test: true,
    },
  });

  for (const userTest of userTests) {
    if (userTest.test?.passageId) {
      await prisma.userTest.update({
        where: { id: userTest.id },
        data: { passageId: userTest.test.passageId },
      });
      console.log(`Updated UserTest ${userTest.id} with passageId ${userTest.test.passageId}`);
    }
  }

  console.log('Backfill complete');
}

backfillPassageIds()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });