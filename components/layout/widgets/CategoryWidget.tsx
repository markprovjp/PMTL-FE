// components/layout/widgets/CategoryWidget.tsx — Server component
// Compact category list for sidebar (top-level only)
import Link from 'next/link'
import { TagIcon } from 'lucide-react'
import { getCategories, buildCategoryTree } from '@/lib/api/categories'

export default async function CategoryWidget() {
  let topLevel: ReturnType<typeof buildCategoryTree> = []
  try {
    const flat = await getCategories()
    const tree = buildCategoryTree(flat)
    topLevel = tree.slice(0, 12) // max 12 top-level for sidebar
  } catch {
    return null
  }

  if (topLevel.length === 0) return null

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Chủ đề
      </h3>
      <ul className="space-y-1">
        {topLevel.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/category/${cat.slug}`}
              className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm text-foreground/80 hover:text-gold hover:bg-gold/5 transition-all group"
            >
              <TagIcon className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-gold/60 shrink-0 transition-colors" />
              <span className="truncate">{cat.name}</span>
              {cat.children.length > 0 && (
                <span className="ml-auto text-[10px] text-muted-foreground/40">
                  +{cat.children.length}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
