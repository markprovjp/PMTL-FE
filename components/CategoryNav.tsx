'use client'
// ─────────────────────────────────────────────────────────────
//  components/CategoryNav.tsx
//  "The Knowledge Map" Concept — 2 Column Mega Menu
// ─────────────────────────────────────────────────────────────
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDownIcon, BookIcon } from './icons/ZenIcons';
import {
  ShieldCheck,
  HeartPulse,
  Users,
  Sparkles,
  Moon,
  Scroll,
  BookOpen,
  ArrowRight,
  Zap,
  Leaf,
  Compass,
  Star,
  Award
} from 'lucide-react'
import { getCategoriesClient } from '@/lib/api/categories-client'
import type { Category, CategoryTree } from '@/types/strapi'

// ─── Helpers ──────────────────────────────────────────────────

// Build tree from flat list
function buildCategoryTree(flat: Category[]): CategoryTree[] {
  const map = new Map<number, CategoryTree>()
  for (const cat of flat) {
    map.set(cat.id, { ...cat, children: [], depth: 0 } as CategoryTree)
  }
  const roots: CategoryTree[] = []
  for (const node of Array.from(map.values())) {
    if (node.parent?.id && map.has(node.parent.id)) {
      const parentNode = map.get(node.parent.id)!
      node.depth = parentNode.depth + 1
      parentNode.children.push(node)
    } else {
      roots.push(node)
    }
  }
  const sort = (arr: CategoryTree[]) => {
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    arr.forEach((n) => sort(n.children as CategoryTree[]))
  }
  sort(roots)
  return roots
}

// Icon Mapping based on category names or slugs
const getIconForCategory = (name: string, slug: string) => {
  const n = name.toLowerCase()
  const s = slug.toLowerCase()
  if (s.includes('phap-bao') || n.includes('pháp bảo')) return ShieldCheck
  if (s.includes('suc-khoe') || n.includes('sức khỏe') || n.includes('bệnh')) return HeartPulse
  if (s.includes('hon-nhan') || n.includes('hôn nhân') || n.includes('vợ chồng')) return Users
  if (s.includes('phong-thuy') || n.includes('phong thủy')) return Sparkles
  if (s.includes('giac-mo') || n.includes('giấc mơ')) return Moon
  if (s.includes('an-chay') || n.includes('ăn chay')) return Leaf
  if (s.includes('niem-kinh') || n.includes('niệm kinh')) return Zap
  if (s.includes('su-nghiep') || n.includes('sự nghiệp')) return Compass
  if (s.includes('kien-thuc') || n.includes('kiến thức')) return BookOpen
  if (s.includes('le-phat') || n.includes('lễ phật')) return Award
  return Scroll
}

// ─── Sub-Item Grid Node ──────────────────────────────────────
const CategoryDetailNode = ({ node, onNavigate }: { node: CategoryTree, onNavigate: () => void }) => {
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col space-y-3">
      <Link
        href={`/category/${node.slug}`}
        onClick={onNavigate}
        className="group flex flex-col pointer-events-auto"
      >
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-foreground group-hover:text-gold transition-colors">
            {node.name}
          </span>
          <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-gold" />
        </div>
        {node.description && (
          <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed italic line-clamp-2">
            Ghi chú: {node.description}
          </p>
        )}
      </Link>

      {hasChildren && (
        <ul className="ml-1 pl-4 border-l border-gold/10 space-y-2">
          {node.children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/category/${child.slug}`}
                onClick={onNavigate}
                className="text-sm text-muted-foreground hover:text-gold transition-colors block"
              >
                {child.name}
              </Link>
              {child.description && (
                <p className="text-[10px] text-muted-foreground/60 italic mt-0.5">
                  {child.description}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main Category Dropdown ──────────────────────────────────
export default function CategoryNav({ onClose }: { onClose?: () => void }) {
  const [tree, setTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeRootId, setActiveRootId] = useState<number | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategoriesClient()
        if (!categories || categories.length === 0) {
          setError('Chưa có khai thị nào được cấu hình')
        } else {
          const builtTree = buildCategoryTree(categories)
          setTree(builtTree)
          if (builtTree.length > 0) setActiveRootId(builtTree[0].id)
          setError(null)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
        setError('Không thể tải danh sách khai thị')
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const activeRoot = useMemo(() => tree.find(r => r.id === activeRootId), [tree, activeRootId])

  if (loading) return (
    <div className="p-12 flex items-center justify-center min-h-[400px]">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error || tree.length === 0) return (
    <div className="p-12 text-center text-sm text-muted-foreground italic">
      {error || 'Chưa có khai thị nào được cấu hình'}
    </div>
  )

  return (
    <div className="overflow-hidden bg-white dark:bg-[#0f0f0f]">
      <div className="container mx-auto flex h-[580px]">

        {/* SIDEBAR (Left) - Using a solid subtle background */}
        <aside className="w-[400px] shrink-0 border-r border-border/50 overflow-y-auto custom-scrollbar bg-[#f8f9fa] dark:bg-[#151515] py-8 px-4">
          <div className="space-y-1.5">
            {tree.map((root) => {
              const Icon = getIconForCategory(root.name, root.slug)
              const isActive = activeRootId === root.id
              return (
                <button
                  key={root.id}
                  onMouseEnter={() => setActiveRootId(root.id)}
                  onClick={() => setActiveRootId(root.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group relative
                    ${isActive
                      ? 'bg-gold text-black shadow-lg shadow-gold/20'
                      : 'text-foreground/70 hover:bg-gold/10 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground'
                    }`}
                >
                  <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-black/10 text-black' : 'bg-secondary dark:bg-card group-hover:bg-gold/20 group-hover:text-gold'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start min-w-0">
                    <span className={`text-[13px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-black' : 'group-hover:text-foreground'}`}>
                      {root.name}
                    </span>
                    {root.description && (
                      <span className={`text-[10px] truncate w-full text-left font-medium ${isActive ? 'text-black/60' : 'text-muted-foreground'}`}>
                        {root.description}
                      </span>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute right-2 w-1.5 h-6 bg-black/20 rounded-full"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </aside>

        {/* CONTENT AREA (Right) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar py-10 px-12 relative bg-white dark:bg-[#0f0f0f]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRootId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeRoot && (
                <div className="max-w-4xl">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-10 pb-6 border-b border-gold/10">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-display font-medium text-foreground flex items-center gap-3">
                        {activeRoot.name}
                        <ShieldCheck className="w-6 h-6 text-gold" />
                      </h2>
                      <p className="text-sm text-muted-foreground italic max-w-xl font-medium">
                        {activeRoot.description || `Khám phá các khai thị và hướng dẫn về chủ đề ${activeRoot.name}.`}
                      </p>
                    </div>
                    <Link
                      href={`/category/${activeRoot.slug}`}
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-full bg-gold text-black text-[11px] font-bold uppercase tracking-widest hover:bg-gold/90 transition-all shadow-md shadow-gold/10"
                    >
                      Xem tất cả
                    </Link>
                  </div>

                  {/* Children Grid */}
                  {activeRoot.children.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
                      {activeRoot.children.map((child) => (
                        <CategoryDetailNode
                          key={child.id}
                          node={child}
                          onNavigate={() => onClose?.()}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground/30">
                      <Scroll className="w-16 h-16 mb-4 opacity-20" />
                      <p className="text-sm font-medium">Nội dung đang được ban biên tập tổng hợp...</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

// ─── Mobile Accordion Node (Stay original but styled) ─────────
const MobileTreeNode = ({
  node,
  depth = 0,
  onNavigate,
}: {
  node: CategoryTree
  depth?: number
  onNavigate: () => void
}) => {
  const [open, setOpen] = useState(false)
  const hasChildren = node.children.length > 0
  const Icon = getIconForCategory(node.name, node.slug)

  return (
    <div className="overflow-hidden">
      <div className={`flex items-center justify-between group transition-colors px-2 ${depth === 0 ? 'bg-secondary/20 rounded-xl mb-1' : 'ml-4 border-l border-gold/10'}`}>
        <Link
          href={`/category/${node.slug}`}
          onClick={onNavigate}
          className={`flex items-center gap-3 flex-1 py-3 px-2 rounded-lg hover:text-gold transition-all group ${depth === 0 ? 'font-bold text-foreground text-sm uppercase tracking-wide' : 'text-sm text-muted-foreground'}`}
        >
          {depth === 0 && <Icon className="w-4 h-4 text-gold" />}
          <div className="flex flex-col">
            <span>{node.name}</span>
            {node.description && (
              <span className="text-[10px] text-muted-foreground/60 italic leading-tight mt-0.5">
                {node.description}
              </span>
            )}
          </div>
        </Link>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-muted-foreground hover:text-gold rounded-full transition-colors"
          >
            <motion.svg
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </motion.svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {hasChildren && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <MobileTreeNode key={child.id} node={child} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Mobile Flat List ─────────────────────────────────────────
export function CategoryNavMobile({ onClose }: { onClose: () => void }) {
  const [tree, setTree] = useState<CategoryTree[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getCategoriesClient()
        if (categories && categories.length > 0) setTree(buildCategoryTree(categories))
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) return (
    <div className="py-8 flex justify-center">
      <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-1 p-2">
      {tree.map((root) => (
        <MobileTreeNode key={root.id} node={root} depth={0} onNavigate={onClose} />
      ))}
    </div>
  )
}
