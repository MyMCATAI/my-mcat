import { NextResponse } from 'next/server';

const EDUCATION_API_KEY = process.env.EDUCATION_API_KEY;
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  try {
    const response = await fetch(
      `${BASE_URL}?api_key=${EDUCATION_API_KEY}&school.name=${query}&fields=school.name,school.city,school.state&per_page=10`
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching universities:', error);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
} 