import Image from 'next/image'

import type { HighlightContentBlock } from '@skeleton-fe/sdk-elastic'

import { getImageUrl } from '@/core/utils/image'

export interface HighlightBlockProps {
  block: HighlightContentBlock
}

export function HighlightBlock({ block }: HighlightBlockProps) {
  return (
    <section className="py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item, index) => {
          const imageUrl = getImageUrl(item.imageId)

          return (
            <div
              key={index}
              className="flex flex-col gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
            >
              {imageUrl && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={imageUrl}
                    alt={item.title}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold">{item.title}</h3>
              {item.text && <p className="text-sm text-muted-foreground">{item.text}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}
