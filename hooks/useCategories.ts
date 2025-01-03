import { useState, useEffect } from 'react';
import axios from 'axios';
import { SECTION_MAPPINGS } from '@/lib/constants';

export interface Category {
  id: string;
  conceptCategory: string;
  contentCategory: string;
  section: string;
}

export function useCategories(sectionName: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {

      try {
        setLoading(true);
        // Convert full section name to abbreviation
        const sectionCode = SECTION_MAPPINGS[sectionName as keyof typeof SECTION_MAPPINGS];
        
        if (!sectionCode) {
          throw new Error('Invalid section name');
        }

        const response = await axios.get(`/api/categories?section=${sectionCode}`);
        setCategories(response.data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    if (sectionName) {
      fetchCategories();
    }
  }, [sectionName]);

  return { categories, loading, error };
} 