// ============================================
// PRONTO.IA — Shared Type Definitions
// ============================================

// ---- Auth ----
export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  COMPANY_USER = 'COMPANY_USER',
}

// ---- Verticals ----
export enum Vertical {
  SALAO = 'SALAO',
  FOOD_SERVICE = 'FOOD_SERVICE',
  HOME_SERVICE = 'HOME_SERVICE',
}

export const VERTICAL_LABELS: Record<Vertical, string> = {
  [Vertical.SALAO]: 'Salão de Beleza & Estética',
  [Vertical.FOOD_SERVICE]: 'Food Service Local',
  [Vertical.HOME_SERVICE]: 'Prestadores de Serviço',
};

export const VERTICAL_PERSONAS: Record<Vertical, { name: string; slug: string }> = {
  [Vertical.SALAO]: { name: 'Bia', slug: 'bia' },
  [Vertical.FOOD_SERVICE]: { name: 'Léo', slug: 'leo' },
  [Vertical.HOME_SERVICE]: { name: 'Tião', slug: 'tiao' },
};

// ---- Trilhas ----
export enum TrilhaLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

// ---- Enrollment ----
export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  CANCELLED = 'CANCELLED',
}

export enum EnrollmentSource {
  ORGANIC = 'ORGANIC',
  B2G_CONTRACT = 'B2G_CONTRACT',
  B2B_PARTNER = 'B2B_PARTNER',
  AFFILIATE = 'AFFILIATE',
  REFERRAL = 'REFERRAL',
}

// ---- API Response ----
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  perPage: number;
}

// ---- WhatsApp ----
export interface WhatsAppIncomingMessage {
  from: string;
  body: string;
  messageId: string;
  timestamp: string;
  profileName?: string;
}

export interface WhatsAppOutgoingMessage {
  to: string;
  body: string;
  type: 'text' | 'audio' | 'interactive';
  audioUrl?: string;
  interactive?: Record<string, unknown>;
}

// ---- Maria Persona ----
export interface MariaMessage {
  text: string;
  persona: 'maria' | 'bia' | 'leo' | 'tiao';
  emoji?: string;
  lessonId?: string;
  exercisePrompt?: string;
}

// ---- Outcome ----
export interface OutcomeReport {
  userId: string;
  trilhaId: string;
  revenueBeforeCents: number | null;
  revenueAfterCents: number | null;
  deltaCents: number | null;
  deltaPercent: number | null;
  reportedAt: Date;
}
