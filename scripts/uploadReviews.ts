// scripts/uploadReviews.ts
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function uploadReviewsFromCSV() {
  const csvFilePath = path.join(process.cwd(), 'data', 'reviews.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  }, async (error, records) => {
    if (error) {
      console.error("Error parsing CSV:", error);
      return;
    }

    for (const record of records) {
      try {
        const profilePicture = await getRandomCatImage();
        const review = await prisma.review.create({
          data: {
            tier: parseInt(record.TIER),
            rating: parseInt(record.RATING),
            review: record.REVIEW,
            profilePicture: profilePicture,
          },
        });
        console.log(`Created review: ${review.id}`);
      } catch (error) {
        console.error(`Error creating review:`, error);
      }
    }

    await prisma.$disconnect();
    console.log("Finished uploading reviews.");
  });
}

async function getRandomCatImage(): Promise<string> {
  try {
    const response = await axios.get('https://api.thecatapi.com/v1/images/search');
    const data = response.data;
    if (data && data.length > 0 && data[0].url) {
      return data[0].url;
    } else {
      throw new Error('Invalid response from Cat API');
    }
  } catch (error) {
    console.error('Error fetching cat image:', error);
    return 'https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg'; // Fallback image URL
  }
}

uploadReviewsFromCSV().catch(console.error);