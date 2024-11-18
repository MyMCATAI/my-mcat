export async function searchUniversities(query: string) {
  try {
    const response = await fetch(`/api/universities?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data.results)) {
      console.error('Unexpected API response format:', data);
      return [];
    }

    return data.results.map((school: any) => ({
      name: school['school.name'],
      city: school['school.city'],
      state: school['school.state']
    }));
  } catch (error) {
    console.error('Error fetching universities:', error);
    return [];
  }
}