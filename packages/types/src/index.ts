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
  | 'freelance_dev'
  | 'pet';

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

export type CommitmentType = 'fixed' | 'optional' | 'occasional';
export type SplitRuleType = 'none' | 'equal_roommates' | 'weighted_rent' | 'mobile_shared';

export interface ReceivablesBreakdown {
  roommate_b?: number;
  roommate_c?: number;
  mother?: number;
  [key: string]: number | undefined;
}

export interface CommitmentItem {
  id: string;         // UUID
  name: string;       // e.g., "Conta de Luz", "Aluguel"
  amount: number;     // Total bill amount (e.g., 150.00)
  due_day: number;    // 1-31
  is_paid: boolean;
  category_type?: CommitmentType;
  split_rule?: SplitRuleType;
  user_calculated_share?: number;
  receivables?: ReceivablesBreakdown;
  is_active?: boolean;
  is_manually_set?: boolean;
  transaction_id?: string | null;
}

export interface HouseSettings {
  id?: string;
  user_id?: string;
  active_roommates_count: 2 | 3;
  updated_at?: string;
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

export type PaymentRecipient = 'foraisso' | 'shibarihouse';
export type PaymentMethod = 'pix' | 'credit';

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
  received_by?: PaymentRecipient | null;
  enrollment_id?: string | null;
  created_at: string;
  transaction_datetime?: string | null;
  tags?: string[];
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

export type ModalityType = 'monthly_group' | 'quarterly_group' | 'private_bundle' | 'single_group' | 'single_private';
export type EnrollmentStatus = 'active' | 'paused' | 'cancelled' | 'completed';
export type BundleStatus = 'active' | 'completed' | 'cancelled';

export interface GroupClassroom {
  id: string;
  name: string;
  weekday: number; // 1 = Mon, 3 = Wed
  level: string;
  description: string | null;
  created_at: string;
}

export interface StudentEnrollment {
  id: string;
  person_id: string;
  group_id: string | null;
  modality: ModalityType;
  status: EnrollmentStatus;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_partner?: boolean;
  partner_details?: string | null;
  received_by?: PaymentRecipient | null;
  payment_method?: PaymentMethod | null;
  created_at: string;
  updated_at: string;
  group?: GroupClassroom | null;
}

/** Lesson bundle for private classes */
export interface LessonBundle {
  id: string;
  person_id: string;
  name: string;
  total_lessons: number;
  used_lessons: number;
  price: number;
  status: BundleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

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
  bundle_id?: string | null; // FK -> fialn_lesson_bundles.id
  lesson_date: string; // ISO 8601 timestamp
  duration_hours: number;
  location: string;
  topics_covered: string;
  performance_notes: string | null;
  action_items: string | null;
  created_at: string;
  bundle?: LessonBundle | null;
}

// ----------------------------------------------------------
// FITEO — Class Systems & Lesson Planning
// ----------------------------------------------------------

/** A FITEO course track (e.g. Teoria das Cordas, Sobre Nós). */
export interface CourseTrack {
  id: string;
  title: string;        // 'Teoria das Cordas' | 'Sobre Nós'
  schedule_day: string; // 'Monday' | 'Wednesday'
  skill_level: string;  // 'Intermediate' | 'Beginner' | 'Advanced'
  active: boolean;
  created_at: string;
}

/** A scheduled or planned class session. */
export interface ClassSchedule {
  id: string;
  /** FK → fiteo_courses.id — which track this class belongs to. */
  course_id: string | null;
  class_date: string; // ISO 8601 timestamp
  proposed_theme: string; // Theme Title
  /** Detailed description of the proposed theme, exercises, or outline. */
  theme_description: string | null;
  /** Editable by collaborators — meeting minutes / class notes */
  minutes_and_notes: string | null;
  is_planned: boolean;
  /** Array of technique tags addressed in the class (dynamically added/searchable). */
  techniques?: string[] | null;
  /** Flag for interesting photo content for social media/disclosure. */
  has_photo_content?: boolean | null;
  /** Flag for interesting video content for social media/disclosure. */
  has_video_content?: boolean | null;
  /** Flag for featured/exceptional classes ("Aula Destaque"). */
  is_highlighted?: boolean | null;
  created_at: string;
  /** Joined course track (available when fetched with select('*, course:fiteo_courses(*)')). */
  course?: CourseTrack | null;
}

/** Attendance record linking a person to a class session. */
export interface Attendance {
  id: string;
  class_id: string; // FK → fiteo_class_schedules.id
  person_id: string; // FK → people.id
  /** FK → fialn_enrollments.id — presence is tied to an active enrollment, not a payment event. */
  enrollment_id: string | null;
  present: boolean;
  notes: string | null;
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
