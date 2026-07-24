import type { TransactionCategory } from '@fi/types';

// ---- Category sets ----

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'session',
  'private_lesson',
  'study_group',
  'workshop',
  'performance',
  'freelance_dev',
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'housing_rent',
  'housing_condo',
  'utilities',
  'variable_expense',
  'savings_goal',
  'investment',
  'emergency_fund',
];

// ---- Labels ----

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  housing_rent:    'Aluguel',
  housing_condo:   'Condomínio',
  utilities:       'Serviços',
  variable_expense:'Gasto Variável',
  savings_goal:    'Economia',
  investment:      'Investimento',
  emergency_fund:  'Reserva de Emergência',
  session:         'Sessão',
  private_lesson:  'Aula Particular',
  study_group:     'Grupo de Estudo',
  workshop:        'Workshop',
  performance:     'Performance',
  freelance_dev:   'Dev Freelance',
};

// ---- Icons ----

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  housing_rent:    '🏠',
  housing_condo:   '🏢',
  utilities:       '💡',
  variable_expense:'💳',
  savings_goal:    '🏦',
  investment:      '📈',
  emergency_fund:  '🛡️',
  session:         '🎭',
  private_lesson:  '🎓',
  study_group:     '👥',
  workshop:        '⚡',
  performance:     '🎪',
  freelance_dev:   '💻',
};

// ---- Formatters ----

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');

export const formatMonthYear = (year: number, month: number): string =>
  new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

/** Returns 'YYYY-MM-01' for the given year/month. */
export const toMonthDate = (year: number, month: number): string =>
  `${year}-${String(month).padStart(2, '0')}-01`;
