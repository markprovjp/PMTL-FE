import { createPushJob } from '@/lib/push-server'

interface EnqueuePushJobInput {
  kind: string
  title: string
  body: string
  url?: string
  tag?: string
  payload?: Record<string, unknown>
  chunkSize?: number
}

export async function enqueuePushJobSafe(input: EnqueuePushJobInput) {
  try {
    await createPushJob({
      kind: input.kind,
      status: 'pending',
      title: input.title,
      body: input.body,
      url: input.url || '/shares',
      tag: input.tag || input.kind,
      payload: input.payload || {},
      chunkSize: Math.max(1, Math.min(500, Number(input.chunkSize) || 100)),
      cursor: 0,
      targetedCount: 0,
      processedCount: 0,
      successCount: 0,
      failedCount: 0,
      invalidCount: 0,
      lastError: null,
      startedAt: null,
      finishedAt: null,
    })
  } catch (error) {
    console.error('[push enqueue]', error)
  }
}

export async function dispatchQueueUntil(targetJobDocumentId?: string) {
  void targetJobDocumentId
  return null
}
