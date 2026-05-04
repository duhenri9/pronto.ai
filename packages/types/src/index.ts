// ============================================
// PRONTO.IA — Shared Type Definitions
// ============================================

// ---- Auth ----
export interface AuthPayload {
  userId: string;
  phone: string;
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
  TECH_SERVICE = 'TECH_SERVICE',
}

export const VERTICAL_LABELS: Record<Vertical, string> = {
  [Vertical.SALAO]: 'Salão de Beleza & Estética',
  [Vertical.FOOD_SERVICE]: 'Food Service Local',
  [Vertical.HOME_SERVICE]: 'Prestadores de Serviço',
  [Vertical.TECH_SERVICE]: 'TI & Tecnologia',
};

export const VERTICAL_PERSONAS: Record<Vertical, { name: string; slug: string }> = {
  [Vertical.SALAO]: { name: 'Bia', slug: 'bia' },
  [Vertical.FOOD_SERVICE]: { name: 'Léo', slug: 'leo' },
  [Vertical.HOME_SERVICE]: { name: 'Tião', slug: 'tiao' },
  [Vertical.TECH_SERVICE]: { name: 'Zé', slug: 'ze' },
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
  persona: 'maria' | 'bia' | 'leo' | 'tiao' | 'ze-da-ti';
  emoji?: string;
  lessonId?: string;
  exercisePrompt?: string;
}

// ---- Donations ----
export interface DonationRequest {
  amount: number;
  method: 'PIX' | 'CREDIT_CARD';
}

export interface DonationResponse {
  donationId: string;
  pixCode?: string;
  qrCode?: string;
  status: 'pending' | 'completed' | 'failed';
}

// ---- Anthropic Claude ----
export const ANTHROPIC_MODELS = {
  HAIKU: 'claude-haiku-4-5-20251001',
  SONNET: 'claude-sonnet-4-5-20250514',
} as const;

export type AnthropicModel = (typeof ANTHROPIC_MODELS)[keyof typeof ANTHROPIC_MODELS];

export interface LLMConfig {
  model: AnthropicModel;
  maxTokens: number;
  temperature?: number;
}

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  model: ANTHROPIC_MODELS.HAIKU,
  maxTokens: 800,
  temperature: 0.7,
};

export const EVALUATION_LLM_CONFIG: LLMConfig = {
  model: ANTHROPIC_MODELS.SONNET,
  maxTokens: 600,
  temperature: 0.3,
};

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

// ---- User Memory ----
export enum MemoryType {
  PREFERENCE = 'preference',
  CONTEXT = 'context',
  CONVERSATION_SUMMARY = 'conversation_summary',
  BUSINESS_INFO = 'business_info',
  ONBOARDING_DATA = 'onboarding_data',
}

// ---- LGPD ----
export const LGPD_CONSENT_VERSION = '1.0.0';


// ---- AbacatePay Webhooks ----
export interface AbacateWebhookJob {
  rawBody: string;
  signature: string;
  payload: Record<string, unknown>;
}