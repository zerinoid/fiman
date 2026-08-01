import type { CommitmentItem, CommitmentType, SplitRuleType, ReceivablesBreakdown } from '@fi/types';

export interface SplitResult {
  userCalculatedShare: number;
  receivables: ReceivablesBreakdown;
  splitLabel: string;
}

export function calculateSplitShare(
  amount: number,
  rule: SplitRuleType = 'none',
  activeRoommatesCount: 2 | 3 = 3
): SplitResult {
  const total = Number(amount) || 0;

  switch (rule) {
    case 'weighted_rent': {
      if (activeRoommatesCount === 3) {
        const userShare = Math.round(total * 0.31 * 100) / 100;
        const rmB = Math.round(total * 0.345 * 100) / 100;
        const rmC = Math.round(total * 0.345 * 100) / 100;
        return {
          userCalculatedShare: userShare,
          receivables: { roommate_b: rmB, roommate_c: rmC },
          splitLabel: 'Aluguel (31% você | 34.5% B | 34.5% C)',
        };
      } else {
        // 2 roommates (quarto vago -> user pays 31% + 34.5% = 65.5%)
        const userShare = Math.round(total * 0.655 * 100) / 100;
        const rmB = Math.round(total * 0.345 * 100) / 100;
        return {
          userCalculatedShare: userShare,
          receivables: { roommate_b: rmB, roommate_c: 0 },
          splitLabel: 'Aluguel (65.5% você com quarto vago | 34.5% B)',
        };
      }
    }

    case 'equal_roommates': {
      const count = activeRoommatesCount;
      const share = Math.round((total / count) * 100) / 100;
      if (count === 3) {
        return {
          userCalculatedShare: share,
          receivables: { roommate_b: share, roommate_c: share },
          splitLabel: 'Moradia (33.3% por morador)',
        };
      } else {
        return {
          userCalculatedShare: share,
          receivables: { roommate_b: share, roommate_c: 0 },
          splitLabel: 'Moradia (50% por morador - vago)',
        };
      }
    }

    case 'mobile_shared': {
      const share = Math.round(total * 0.5 * 100) / 100;
      return {
        userCalculatedShare: share,
        receivables: { mother: share },
        splitLabel: 'TIM Celular (50% você | 50% Mãe)',
      };
    }

    case 'none':
    default: {
      return {
        userCalculatedShare: total,
        receivables: {},
        splitLabel: 'Integral (100% você)',
      };
    }
  }
}

/**
  Infers split rule and category type from commitment name.
 */
export function inferSplitRuleAndCategory(name: string): { splitRule: SplitRuleType; categoryType: CommitmentType } {
  const lower = name.toLowerCase();

  if (lower.includes('aluguel') || lower.includes('condomínio') || lower.includes('condominio')) {
    return { splitRule: 'weighted_rent', categoryType: 'fixed' };
  }
  if (lower.includes('luz') || lower.includes('energia') || lower.includes('claro') || lower.includes('internet') || lower.includes('limpeza')) {
    return { splitRule: 'equal_roommates', categoryType: 'fixed' };
  }
  if (lower.includes('tim') || lower.includes('celular')) {
    return { splitRule: 'mobile_shared', categoryType: 'fixed' };
  }
  if (lower.includes('reserva') || lower.includes('emergência') || lower.includes('emergencia') || lower.includes('investimento') || lower.includes('quarto vago')) {
    return { splitRule: 'none', categoryType: 'toggleable' };
  }
  if (lower.includes('curso') || lower.includes('workshop') || lower.includes('estudo')) {
    return { splitRule: 'none', categoryType: 'variable' };
  }

  return { splitRule: 'none', categoryType: 'fixed' };
}

/**
 * Computes aggregated receivables owed to the user for current commitments.
 */
export function calculateTotalReceivables(commitments: CommitmentItem[], activeRoommatesCount: 2 | 3 = 3) {
  let roommateB = 0;
  let roommateC = 0;
  let mother = 0;

  for (const c of commitments) {
    if (c.is_active === false) continue;
    const rule = c.split_rule || inferSplitRuleAndCategory(c.name).splitRule;
    const split = calculateSplitShare(c.amount, rule, activeRoommatesCount);

    if (split.receivables.roommate_b) roommateB += split.receivables.roommate_b;
    if (split.receivables.roommate_c) roommateC += split.receivables.roommate_c;
    if (split.receivables.mother) mother += split.receivables.mother;
  }

  return {
    roommate_b: Math.round(roommateB * 100) / 100,
    roommate_c: Math.round(roommateC * 100) / 100,
    mother: Math.round(mother * 100) / 100,
    total: Math.round((roommateB + roommateC + mother) * 100) / 100,
  };
}

/**
 * Calculates Month-over-Month percentage variation.
 */
export function calculateMoMVariation(current: number, previous: number | null): { percentage: number | null; text: string; direction: 'up' | 'down' | 'flat' } {
  if (previous === null || previous === 0) {
    return { percentage: null, text: '—', direction: 'flat' };
  }
  const diff = current - previous;
  const pct = Math.round((diff / previous) * 1000) / 10;
  if (pct > 0) {
    return { percentage: pct, text: `+${pct}%`, direction: 'up' };
  } else if (pct < 0) {
    return { percentage: pct, text: `${pct}%`, direction: 'down' };
  }
  return { percentage: 0, text: '0%', direction: 'flat' };
}

/**
 * Statistical Forecasting Engine: Weighted Moving Average
 * Weights recent months higher (e.g., weights [0.5, 0.3, 0.2] for 3 past months).
 */
export function calculateWeightedMovingAverage(history: number[]): number {
  if (!history || history.length === 0) return 0;
  if (history.length === 1) return history[0];

  const n = Math.min(history.length, 6); // Up to 6 recent values
  const recentValues = history.slice(0, n); // Assumes history is sorted newest to oldest

  // Generate linearly decreasing weights: n, n-1, ..., 1
  let weightSum = 0;
  let weightedTotal = 0;
  for (let i = 0; i < n; i++) {
    const w = n - i;
    weightSum += w;
    weightedTotal += recentValues[i] * w;
  }

  return Math.round((weightedTotal / weightSum) * 100) / 100;
}
