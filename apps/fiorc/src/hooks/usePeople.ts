import { useState, useEffect } from 'react';
import type { Person } from '@fi/types';
import { supabase } from '../lib/supabase';

export interface UsePeopleReturn {
  people: Person[];
  loading: boolean;
}

export function usePeople(): UsePeopleReturn {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('people')
      .select('id, full_name, is_student, is_client')
      .order('full_name')
      .then(({ data }) => {
        setPeople((data ?? []) as Person[]);
        setLoading(false);
      });
  }, []);

  return { people, loading };
}
