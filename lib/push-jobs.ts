import { createPushJob } from '@/lib/push-server'
import { processNextPushJob } from '@/lib/push-worker'

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
    const created = await createPushJob({
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

    await dispatchQueueUntil(created.data.documentId)
  } catch (error) {
    console.error('[push enqueue]', error)
  }
}

export async function dispatchQueueUntil(targetJobDocumentId?: string) {
  let matchedTarget = false

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const result = await processNextPushJob()
      if (!result) break
      if (!targetJobDocumentId) {
        if (result.completed) return result
        continue
      }

      if (result.jobDocumentId === targetJobDocumentId) {
        matchedTarget = true
        if (result.completed) return result
      } else if (matchedTarget && result.jobDocumentId !== targetJobDocumentId) {
        break
      }
    } catch (error) {
      console.error('[push dispatch]', error)
    }
  }

  return null
}
