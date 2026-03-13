import { z } from 'zod'

const searchPageParamsSchema = z.object({
  q: z.string().trim().max(120).optional().default(''),
  cat: z.string().trim().max(120).optional().nullable().default(null),
  tags: z.array(z.string().trim().min(1).max(120)).default([]),
  time: z.enum(['all', 'week', 'month']).default('all'),
  sort: z.enum(['relevance', 'newest', 'oldest', 'most-viewed']).default('relevance'),
  page: z.number().int().min(1).default(1),
})

export type SearchTimeFilter = z.infer<typeof searchPageParamsSchema>['time']
export type SearchSortOption = z.infer<typeof searchPageParamsSchema>['sort']

export interface SearchPageState {
  q: string
  cat: string | null
  tags: string[]
  time: SearchTimeFilter
  sort: SearchSortOption
  page: number
}

type SearchParamInput = URLSearchParams | Record<string, string | string[] | undefined>

function getValue(input: SearchParamInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined
  const value = input[key]
  return Array.isArray(value) ? value[0] : value
}

export function parseSearchPageParams(input: SearchParamInput): SearchPageState {
  const rawTags = getValue(input, 'tags')
  const rawPage = getValue(input, 'page')

  return searchPageParamsSchema.parse({
    q: getValue(input, 'q') ?? '',
    cat: getValue(input, 'cat') ?? null,
    tags: rawTags ? rawTags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
    time: getValue(input, 'time') ?? 'all',
    sort: getValue(input, 'sort') ?? 'relevance',
    page: rawPage ? Number(rawPage) : 1,
  })
}

export function serializeSearchPageParams(state: SearchPageState): string {
  const params = new URLSearchParams()
  if (state.q) params.set('q', state.q)
  if (state.cat) params.set('cat', state.cat)
  if (state.tags.length > 0) params.set('tags', state.tags.join(','))
  if (state.time !== 'all') params.set('time', state.time)
  if (state.sort !== 'relevance') params.set('sort', state.sort)
  if (state.page > 1) params.set('page', String(state.page))
  return params.toString()
}

export function getSearchDateFrom(time: SearchTimeFilter): string | undefined {
  const now = new Date()
  if (time === 'week') {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
  if (time === 'month') {
    const date = new Date(now)
    date.setMonth(date.getMonth() - 1)
    return date.toISOString()
  }
  return undefined
}

export function hasActiveSearchFilters(state: SearchPageState): boolean {
  return Boolean(
    state.q ||
      state.cat ||
      state.tags.length > 0 ||
      state.time !== 'all' ||
      state.sort !== 'relevance' ||
      state.page > 1
  )
}

export function getSearchStateKey(state: SearchPageState): string {
  return JSON.stringify(state)
}
