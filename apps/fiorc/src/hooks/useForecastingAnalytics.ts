import { useState, useEffect, useCallback } from 'react';
import type { CommitmentItem } from '@fi/types';
import { supabase } from '../lib/supabase';
import { calculateMoMVariation, calculateWeightedMovingAverage, getCanonicalCommitmentName } from '../utils/splitting';
import { toMonthDate } from '../utils/categories';

export interface MoMItemResult {
  name: string;
  currentAmount: number;
  previousAmount: number | null;
  text: string;
  direction: 'up' | 'down' | 'flat';
}

export interface UseForecastingAnalyticsReturn {
  momVariations: MoMItemResult[];
  projectedNextMonth: CommitmentItem[];
  forecastMap: Record<string, number>;
  loading: boolean;
  bulkImportHistoricalData: (records: Array<{ month_year: string; commitments: CommitmentItem[] }>) => Promise<void>;
  refetch: () => void;
}

export function useForecastingAnalytics(currentYear: number, currentMonth: number): UseForecastingAnalyticsReturn {
  const [momVariations, setMomVariations] = useState<MoMItemResult[]>([]);
  const [projectedNextMonth, setProjectedNextMonth] = useState<CommitmentItem[]>([]);
  const [forecastMap, setForecastMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const currentMonthDate = toMonthDate(currentYear, currentMonth);

      // 1. Fetch up to 13 past monthly targets to calculate MoM and projections
      const { data: targets, error } = await supabase
        .from('fiorc_monthly_targets')
        .select('*')
        .lte('month_year', currentMonthDate)
        .order('month_year', { ascending: false })
        .limit(13);

      if (error) {
        console.error('Error fetching analytics targets:', error);
        setLoading(false);
        return;
      }

      if (!targets || targets.length === 0) {
        setMomVariations([]);
        setProjectedNextMonth([]);
        setForecastMap({});
        setLoading(false);
        return;
      }

      // Current month target
      const currentTarget = targets.find(t => t.month_year === currentMonthDate) || targets[0];
      const prevTarget = targets.find(t => t.month_year < currentTarget.month_year);

      const currentCommitments = (currentTarget.commitments as unknown as CommitmentItem[]) || [];
      const prevCommitments = prevTarget ? ((prevTarget.commitments as unknown as CommitmentItem[]) || []) : [];

      // 2. MoM Variation calculation
      const variations: MoMItemResult[] = currentCommitments.map(c => {
        const canonicalC = getCanonicalCommitmentName(c.name);
        const matchingPrev = prevCommitments.find(p => getCanonicalCommitmentName(p.name) === canonicalC);
        const prevVal = matchingPrev ? matchingPrev.amount : null;
        const mom = calculateMoMVariation(c.amount, prevVal);
        return {
          name: canonicalC,
          currentAmount: c.amount,
          previousAmount: prevVal,
          text: mom.text,
          direction: mom.direction,
        };
      });

      setMomVariations(variations);

      // 3. Statistical Forecasting using historical weighted moving averages
      const historyByName: Record<string, number[]> = {};
      for (const t of targets) {
        const items = (t.commitments as unknown as CommitmentItem[]) || [];
        for (const item of items) {
          if (item.amount > 0) {
            const canonicalName = getCanonicalCommitmentName(item.name);
            // Exclude credit card fatura from forecasting motor
            if (canonicalName === 'Fatura do Cartão') continue;

            if (!historyByName[canonicalName]) historyByName[canonicalName] = [];
            historyByName[canonicalName].push(item.amount);
          }
        }
      }

      const map: Record<string, number> = {};
      for (const [key, hist] of Object.entries(historyByName)) {
        map[key] = calculateWeightedMovingAverage(hist);
      }
      setForecastMap(map);

      // Generate next month projections (excluding Fatura do Cartão)
      const projections: CommitmentItem[] = currentCommitments
        .filter(c => getCanonicalCommitmentName(c.name) !== 'Fatura do Cartão')
        .map(c => {
          const canonicalName = getCanonicalCommitmentName(c.name);
          const forecastedAmount = map[canonicalName] || c.amount;
          return {
            ...c,
            name: canonicalName,
            amount: forecastedAmount,
            is_paid: false,
          };
        });

      setProjectedNextMonth(projections);
    } catch (err) {
      console.error('Analytics computation error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const bulkImportHistoricalData = async (records: Array<{ month_year: string; commitments: CommitmentItem[] }>) => {
    setLoading(true);
    try {
      const payload: any[] = records.map(r => ({
        month_year: r.month_year,
        commitments: r.commitments as any,
        total_target: r.commitments.reduce((sum, c) => sum + (c.amount || 0), 0),
        credit_card_total: 0,
      }));

      const { error } = await supabase
        .from('fiorc_monthly_targets')
        .upsert(payload, { onConflict: 'month_year' });

      if (error) throw new Error(error.message);
      await fetchAnalytics();
    } catch (err) {
      console.error('Bulk historical import error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    momVariations,
    projectedNextMonth,
    forecastMap,
    loading,
    bulkImportHistoricalData,
    refetch: fetchAnalytics,
  };
}
