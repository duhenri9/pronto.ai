// ============================================
// PRONTO.IA — Dynamic Context Builder
// ============================================
// Builds the UserContext object from database records
// to fill the ---DYNAMIC--- section of persona prompts.

import { db, eq, desc, users, whatsappSessions, whatsappMessages, userMemory, enrollments, lessons } from '@pronto-ia/database';
import type { UserContext } from '@pronto-ia/llm';

interface BuildContextOptions {
  userId: string;
  sessionId?: string;
  lessonId?: string;
}

export async function buildDynamicContext(options: BuildContextOptions): Promise<UserContext> {
  const { userId, sessionId, lessonId } = options;

  // Fetch user + session in parallel
  const [userRows, sessionRows] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    sessionId
      ? db.select().from(whatsappSessions).where(eq(whatsappSessions.id, sessionId)).limit(1)
      : Promise.resolve([]),
  ]);

  const user = userRows[0];
  const session = sessionRows[0];

  if (!user) return {};

  // Resolve current track and lesson
  let currentTrack = '';
  let currentLesson = '';

  if (lessonId) {
    const lessonRows = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
    currentLesson = lessonRows[0]?.title ?? '';
  }

  const enrollmentRows = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.userId, userId))
    .limit(1);

  if (enrollmentRows.length > 0) {
    currentTrack = enrollmentRows[0].trilhaId ?? '';
  }

  // Fetch relevant long-term memories
  const memories = await db
    .select()
    .from(userMemory)
    .where(eq(userMemory.userId, userId))
    .limit(10);

  const relevantMemories = memories
    .map((m: { key: string | null; value: string | null }) => `- ${m.key ?? ''}: ${m.value ?? ''}`)
    .join('\n');

  // Fetch last 20 messages for conversation history
  const recentMessages = await db
    .select()
    .from(whatsappMessages)
    .where(eq(whatsappMessages.userId, userId))
    .orderBy(desc(whatsappMessages.createdAt))
    .limit(20);

  const conversationHistory = recentMessages
    .reverse()
    .filter((m: { textContent: string | null }) => m.textContent)
    .map((m: { direction: unknown; textContent: string | null }) => `${m.direction === 'inbound' ? 'Usuário' : 'Maria'}: ${m.textContent!}`)
    .join('\n');

  return {
    display_name: user.displayName ?? user.name,
    lifecycle_state: user.lifecycleState,
    pending_action: user.pendingAction ?? '',
    vertical: user.vertical ?? '',
    current_track: currentTrack,
    current_lesson: currentLesson,
    last_active_at: session?.lastMessageAt?.toISOString() ?? user.updatedAt.toISOString(),
    relevant_memories: relevantMemories || 'Nenhuma memória registrada.',
    conversation_history: conversationHistory || 'Primeira conversa.',
  };
}
