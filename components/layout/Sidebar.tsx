// components/layout/Sidebar.tsx — Server component
// CMS-configurable sidebar: conditionally renders widgets based on SidebarConfig
import { Suspense } from 'react'
import { getSidebarConfig } from '@/lib/api/sidebar'
import SearchWidget from './widgets/SearchWidget'
import CategoryWidget from './widgets/CategoryWidget'
import ArchiveWidget from './widgets/ArchiveWidget'
import LatestCommentsWidget from './widgets/LatestCommentsWidget'
import DownloadLinksWidget from './widgets/DownloadLinksWidget'
import SocialLinksWidget from './widgets/SocialLinksWidget'

// Fallback: show all widgets if CMS config is unavailable
const DEFAULT_CONFIG = {
  showSearch: true,
  showCategoryTree: true,
  showArchive: true,
  showLatestComments: true,
  showDownloadLinks: false,
  downloadLinks: [],
  socialLinks: [],
  qrImages: null,
}

export default async function Sidebar() {
  const config = (await getSidebarConfig()) ?? DEFAULT_CONFIG

  return (
    <aside className="hidden lg:block w-72 shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Search */}
        {config.showSearch && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <SearchWidget />
          </div>
        )}

        {/* Category tree */}
        {config.showCategoryTree && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-xl" />}>
              <CategoryWidget />
            </Suspense>
          </div>
        )}

        {/* Archive */}
        {config.showArchive && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-xl" />}>
              <ArchiveWidget />
            </Suspense>
          </div>
        )}

        {/* Latest comments */}
        {config.showLatestComments && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <Suspense fallback={<div className="h-20 animate-pulse bg-muted rounded-xl" />}>
              <LatestCommentsWidget />
            </Suspense>
          </div>
        )}

        {/* Download links */}
        {config.showDownloadLinks && config.downloadLinks?.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <DownloadLinksWidget links={config.downloadLinks} />
          </div>
        )}

        {/* Social links + QR */}
        {(config.socialLinks?.length > 0 || config.qrImages?.length) && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <SocialLinksWidget
              socialLinks={config.socialLinks ?? []}
              qrImages={config.qrImages}
            />
          </div>
        )}
      </div>
    </aside>
  )
}
