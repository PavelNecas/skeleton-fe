import type { HighlightContentBlock } from '@skeleton-fe/sdk-elastic'

import { PimcoreImage } from '@/core/components/PimcoreImage'

export interface HighlightBlockProps {
  block: HighlightContentBlock
}

export function HighlightBlock({ block }: HighlightBlockProps) {
  return (
    <section className="py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
          >
            {item.image && (
              <div className="relative aspect-video w-full">
                <PimcoreImage image={item.image} className="rounded-md object-cover w-full h-full" />
              </div>
            )}
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {item.text && <p className="text-sm text-muted-foreground">{item.text}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
