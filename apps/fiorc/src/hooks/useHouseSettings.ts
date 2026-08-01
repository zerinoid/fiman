import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface UseHouseSettingsReturn {
  activeRoommatesCount: 2 | 3;
  loading: boolean;
  setRoommatesCount: (count: 2 | 3) => Promise<void>;
}

export function useHouseSettings(): UseHouseSettingsReturn {
  const [activeRoommatesCount, setActiveRoommatesCountState] = useState<2 | 3>(3);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const userId = userResp?.user?.id;

      if (!userId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('fiorc_house_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching house settings:', error);
      }

      if (data && (data.active_roommates_count === 2 || data.active_roommates_count === 3)) {
        setActiveRoommatesCountState(data.active_roommates_count as 2 | 3);
      }
    } catch (err) {
      console.error('Error loading house settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const setRoommatesCount = async (count: 2 | 3) => {
    setActiveRoommatesCountState(count);
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const userId = userResp?.user?.id;
      if (!userId) return;

      const { data: existing } = await supabase
        .from('fiorc_house_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('fiorc_house_settings')
          .update({ active_roommates_count: count, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('fiorc_house_settings')
          .insert({ user_id: userId, active_roommates_count: count });
      }
    } catch (err) {
      console.error('Failed to update house settings:', err);
    }
  };

  return {
    activeRoommatesCount,
    loading,
    setRoommatesCount,
  };
}
