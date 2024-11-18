import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export interface MedicalSchool {
  "Medical School": string;
  "State": string;
  "Degree Type": string;
  "Average GPA": number;
  "Average MCAT": number | string;
  "Description": string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.toLowerCase();

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    // Get the path to the JSON file
    const jsonDirectory = path.join(process.cwd(), 'data');
    const fileContents = await fs.readFile(jsonDirectory + '/medicalschools.json', 'utf8');
    
    // Parse the JSON file
    const medicalSchools: MedicalSchool[] = JSON.parse(fileContents);

    // Filter the schools
    const results = medicalSchools
      .filter(school => 
        school["Medical School"].toLowerCase().includes(query)
      )
      .map(school => ({
        name: school["Medical School"],
        state: school["State"],
        degreeType: school["Degree Type"],
        averageGPA: school["Average GPA"],
        averageMCAT: school["Average MCAT"],
        description: school["Description"]
      }))
      .slice(0, 10);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error reading medical schools:', error);
    return NextResponse.json({ error: 'Failed to fetch medical schools' }, { status: 500 });
  }
} 