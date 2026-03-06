// components/hub/HubBlockRenderer.tsx
// Renderer với spacing rhythm — visual cadence, không flat space-y-4
import type { HubBlock } from '@/types/strapi'
import RichTextBlock from './blocks/RichTextBlock'
import PostListManualBlock from './blocks/PostListManualBlock'
import PostListAutoBlock from './blocks/PostListAutoBlock'
import DownloadGridBlock from './blocks/DownloadGridBlock'

interface HubBlockRendererProps {
  blocks?: HubBlock[]
}

export default function HubBlockRenderer({ blocks }: HubBlockRendererProps) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="space-y-16">
      {blocks.map((block, index) => {
        // Thêm visual anchor giữa các block (trừ block đầu)
        const divider = index > 0 ? (
          <div className="flex items-center gap-4 mb-10">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
            <span className="text-gold/30 text-xs">✦</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
          </div>
        ) : null

        switch (block.__component) {
          case 'blocks.rich-text':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <RichTextBlock content={block.content} />
              </div>
            )

          case 'blocks.post-list-manual':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <PostListManualBlock
                  heading={block.heading}
                  description={block.description}
                  posts={block.posts}
                />
              </div>
            )

          case 'blocks.post-list-auto':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <PostListAutoBlock
                  heading={block.heading}
                  description={block.description}
                  category={block.category}
                  count={block.count}
                />
              </div>
            )

          case 'blocks.download-grid':
            return (
              <div key={`block-${block.id}`}>
                {divider}
                <DownloadGridBlock
                  heading={block.heading}
                  description={block.description}
                  downloads={block.downloads}
                />
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}
