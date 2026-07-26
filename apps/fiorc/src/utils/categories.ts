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
  'housing',
  'food_grocery',
  'food_delivery',
  'transport_public',
  'transport_app',
  'health',
  'education',
  'leisure',
  'business',
  'investment',
  'unforeseen',
  'pet',
];

// ---- Labels ----

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  housing: 'Moradia',
  food_grocery: 'Mercado',
  food_delivery: 'Restaurante / Delivery',
  transport_public: 'Transporte Público',
  transport_app: 'Uber / Carona',
  health: 'Saúde',
  education: 'Educação',
  leisure: 'Lazer & Assinaturas',
  business: 'Profissional / Negócios',
  investment: 'Investimento & Reserva',
  unforeseen: 'Imprevistos & Manutenção',
  session: 'Sessão',
  private_lesson: 'Aula Particular',
  study_group: 'Grupo de Estudos',
  workshop: 'Workshop',
  performance: 'Performance',
  freelance_dev: 'Freelance (Dev)',
  pet: 'Pets',
};

// ---- Icons ----

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  housing: '🏠',
  food_grocery: '🛒',
  food_delivery: '🍔',
  transport_public: '🚌',
  transport_app: '🚗',
  health: '💊',
  education: '📚',
  leisure: '🍿',
  business: '💼',
  investment: '📈',
  unforeseen: '🛠️',
  session: '💆',
  private_lesson: '🎓',
  study_group: '👥',
  workshop: '🎪',
  performance: '🎭',
  freelance_dev: '💻',
  pet: '🐾',
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
