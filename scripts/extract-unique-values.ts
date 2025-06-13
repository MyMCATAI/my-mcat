import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function getUniqueValues() {
  try {
    // Get unique values for KnowledgeProfile
    const knowledgeProfiles = await prisma.knowledgeProfile.findMany({
      select: {
        category: true,
        userId: true,
      },
      distinct: ['userId', 'categoryId'],
    });

    // Get unique values for Category
    const categories = await prisma.category.findMany({
      select: {
        subjectCategory: true,
        contentCategory: true,
        conceptCategory: true,
        generalWeight: true,
        section: true,
     },
    });

    // Get unique values for DataPulse
    const dataPulses = await prisma.dataPulse.findMany({
      select: {
        name: true,
        level: true,
        weight: true,
        source: true,
        errorType: true,
        section: true,
        reviewed: true,
      },
    });

    // Process unique values
    const uniqueValues = {
      knowledgeProfile: {
        userId: [...new Set(knowledgeProfiles.map(k => k.userId))],
        categoryId: [...new Set(knowledgeProfiles.map(k => k.category.id))],
      },
      category: {
        subjectCategory: [...new Set(categories.map(c => c.subjectCategory))],
        contentCategory: [...new Set(categories.map(c => c.contentCategory))],
        conceptCategory: [...new Set(categories.map(c => c.conceptCategory))],
        generalWeight: [...new Set(categories.map(c => c.generalWeight))],
        section: [...new Set(categories.map(c => c.section))],

      },
      dataPulse: {
        name: [...new Set(dataPulses.map(d => d.name))],
        level: [...new Set(dataPulses.map(d => d.level))],
        weight: [...new Set(dataPulses.map(d => d.weight))],
        source: [...new Set(dataPulses.map(d => d.source))],
        errorType: [...new Set(dataPulses.map(d => d.errorType).filter(Boolean))],
        section: [...new Set(dataPulses.map(d => d.section).filter(Boolean))],
        reviewed: [...new Set(dataPulses.map(d => d.reviewed))],
      },
    };

    // Create CSV content
    let csvContent = 'Model,Column,Unique Values\n';

    // Add KnowledgeProfile values
    Object.entries(uniqueValues.knowledgeProfile).forEach(([column, values]) => {
      csvContent += `KnowledgeProfile,${column},"${values.join(', ')}"\n`;
    });

    // Add Category values
    Object.entries(uniqueValues.category).forEach(([column, values]) => {
      csvContent += `Category,${column},"${values.join(', ')}"\n`;
    });

    // Add DataPulse values
    Object.entries(uniqueValues.dataPulse).forEach(([column, values]) => {
      csvContent += `DataPulse,${column},"${values.join(', ')}"\n`;
    });

    // Write to CSV file
    const outputPath = path.join(process.cwd(), 'unique-values.csv');
    fs.writeFileSync(outputPath, csvContent);

    console.log(`CSV file has been created at: ${outputPath}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

getUniqueValues(); 