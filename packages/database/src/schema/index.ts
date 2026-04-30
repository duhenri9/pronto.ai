// ============================================
// PRONTO.IA — Schema Re-exports
// ============================================

// Enums
export * from './enums';

// Tables
export { users, usersRelations } from './users';
export {
  trilhas,
  trilhasRelations,
  lessons,
  lessonsRelations,
  contentVersions,
  contentVersionsRelations,
} from './trilhas';
export {
  enrollments,
  enrollmentsRelations,
  lessonProgress,
  lessonProgressRelations,
  dailyCheckins,
  dailyCheckinsRelations,
} from './enrollment';
export {
  whatsappSessions,
  whatsappSessionsRelations,
  whatsappMessages,
  whatsappMessagesRelations,
  userMemory,
  userMemoryRelations,
  scheduledMessages,
  scheduledMessagesRelations,
} from './whatsapp';
export {
  llmCalls,
  llmCallsRelations,
  exerciseEvaluations,
  exerciseEvaluationsRelations,
} from './llm';
export { certificates, certificatesRelations } from './certificates';
export { outcomeReports, outcomeReportsRelations } from './outcomes';
export { payments, paymentsRelations } from './payments';
export { subscriptions, subscriptionsRelations } from './subscriptions';
export { partners } from './partners';
export { dailyMetrics, processedEvents } from './analytics';
export { auditLogs, auditLogsRelations } from './audit';
export { launchPhaseConfig } from './launch-phase';
export { verticalInterestSignups } from './vertical-interest';
