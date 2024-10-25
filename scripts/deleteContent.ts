import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function deleteRecentContent() {
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

  try {
    const result = await prisma.content.deleteMany({
      where: {
        createdAt: {
          gte: tenDaysAgo
        }
      }
    });

    console.log(`Deleted ${result.count} content items created in the last 10 days.`);
  } catch (error) {
    console.error('Error deleting recent content:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteRecentContent().catch(console.error);