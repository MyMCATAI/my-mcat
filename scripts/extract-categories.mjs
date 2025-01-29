import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function extractCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        subjectCategory: true,
        contentCategory: true,
        conceptCategory: true,
      },
      orderBy: [
        { subjectCategory: 'asc' },
        { contentCategory: 'asc' },
        { conceptCategory: 'asc' },
      ],
    });

    // Create CSV content
    const header = 'Subject Category,Content Category,Concept Category\n';
    const rows = categories.map(cat => 
      `${cat.subjectCategory},${cat.contentCategory},${cat.conceptCategory}`
    ).join('\n');
    
    const csvContent = header + rows;

    // Write to file
    fs.writeFileSync('categories.csv', csvContent);
    console.log('Categories have been exported to categories.csv');

  } catch (error) {
    console.error('Error extracting categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

extractCategories(); 
