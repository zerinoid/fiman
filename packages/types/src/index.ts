// ============================================================
// @fi/types — Shared Domain Interfaces & Enums
// Single source of truth for all FI Ecosystem data shapes.
// ============================================================

// ----------------------------------------------------------
// ENUMS
// ----------------------------------------------------------

export type UserRoleType = 'admin' | 'collaborator';

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
  | 'housing'         // Moradia
  | 'food_grocery'    // Alimentação - Mercado
  | 'food_delivery'   // Alimentação - Restaurante/Delivery
  | 'transport_public'// Transporte Público
  | 'transport_app'   // Transporte Aplicativo
  | 'health'          // Saúde
  | 'education'       // Educação
  | 'leisure'         // Lazer & Assinaturas
  | 'business'        // Profissional / Negócios
  | 'investment'      // Investimento & Reserva
  | 'unforeseen'      // Imprevistos / Manutenção
  // Incomes
  | 'session'
  | 'private_lesson'
  | 'study_group'
  | 'workshop'
  | 'performance'
  | 'freelance_dev';

// ----------------------------------------------------------
// CORE / AUTH
// ----------------------------------------------------------

/** Linked 1:1 to auth.users — carries the app-level role. */
export interface Profile {
  id: string; // UUID — references auth.users.id
  full_name: string;
  role: UserRoleType;
  created_at: string; // ISO 8601
}

/**
 * Central Person entity.
 * A single record can be a student, a client, or both.
 * All apps reference people.id as the FK anchor.
 */
export interface Person {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  is_student: boolean;
  is_client: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------
// FIORC — Personal Budget & Cash Flow
// ----------------------------------------------------------

export interface CommitmentItem {
  id: string;         // UUID
  name: string;       // e.g., "Conta de Luz", "Aluguel"
  amount: number;     // e.g., 150.00
  due_day: number;    // 1-31
  is_paid: boolean;
}

/** Monthly budget target snapshot — tied to a specific month/year. */
export interface MonthlyTarget {
  id: string;
  month_year: string;       // YYYY-MM-01
  commitments: CommitmentItem[];
  credit_card_total: number;
  total_target: number;
  notes: string | null;
  created_at: string;
}

/** A single financial income or expense event. */
export interface Transaction {
  id: string;
  person_id: string | null; // FK → people.id
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  due_date: string; // DATE string 'YYYY-MM-DD'
  paid_at: string | null; // YYYY-MM-DD
  is_projection: boolean;
  is_credit_card: boolean;
  installment_index: number;
  total_installments: number;
  description: string | null;
  parent_id?: string | null; // FK -> fiorc_transactions.id
  created_at: string;
}

/** Parsed boleto data from a rent PDF/image (OCR extraction). */
export interface RentBoleto {
  id: string;
  month_year: string;
  rent_amount: number;
  condo_measured: number;
  condo_credit_prev_month: number;
  /** Generated column: rent_amount + condo_measured + condo_credit_prev_month */
  total_payable: number;
  file_path: string | null;
  raw_ocr_json: Record<string, unknown> | null;
  created_at: string;
}

// ----------------------------------------------------------
// FIALN — Student Tracking
// ----------------------------------------------------------

/** Extended profile for a person who is a student (Shibari). */
export interface StudentProfile {
  id: string;
  person_id: string; // FK → people.id (UNIQUE)
  strengths: string | null;
  dificulties: string | null; // matches PRD typo intentionally
  growth_pathway: string | null;
  financial_status: string | null;
  created_at: string;
}

/** A single private lesson record for a student. */
export interface Lesson {
  id: string;
  person_id: string; // FK → people.id
  lesson_date: string; // ISO 8601 timestamp
  duration_hours: number;
  location: string;
  topics_covered: string;
  performance_notes: string | null;
  action_items: string | null;
  created_at: string;
}

// ----------------------------------------------------------
// FITEO — Class Systems & Lesson Planning
// ----------------------------------------------------------

/** A scheduled or planned class session. */
export interface ClassSchedule {
  id: string;
  class_date: string; // ISO 8601 timestamp
  proposed_theme: string;
  /** Editable by collaborators — meeting minutes / class notes */
  minutes_and_notes: string | null;
  is_planned: boolean;
  created_at: string;
}

/** Attendance record linking a person to a class session. */
export interface Attendance {
  id: string;
  class_id: string; // FK → fiteo_class_schedules.id
  person_id: string; // FK → people.id
  present: boolean;
  payment_type: 'quarterly_plan' | 'single_class' | 'private_lesson' | null;
  transaction_id: string | null; // FK → fiorc_transactions.id
  created_at: string;
}

// ----------------------------------------------------------
// FIATT — Client Session Records
// ----------------------------------------------------------

/** Sensitive health / anamnesis record for a client. */
export interface ClientRecord {
  id: string;
  person_id: string; // FK → people.id (UNIQUE)
  medical_history: string | null;
  physiological_notes: string | null;
  pathologies: string | null;
  emergency_contact: string | null;
  created_at: string;
}

/** A single client session (Shibari / artistic session). */
export interface Session {
  id: string;
  person_id: string; // FK → people.id
  session_date: string; // ISO 8601 timestamp
  incidents: string | null;
  feedback_received: string | null;
  transaction_id: string | null; // FK → fiorc_transactions.id
  created_at: string;
}
