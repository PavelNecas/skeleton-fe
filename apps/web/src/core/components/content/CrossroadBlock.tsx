import Link from 'next/link'
import type { CrossroadBlockEditable, CrossroadContentBlock } from '@skeleton-fe/sdk-elastic'

import { PimcoreImage } from '@/core/components/PimcoreImage'

export interface CrossroadBlockProps {
  block: CrossroadBlockEditable | CrossroadContentBlock
}

export function CrossroadBlock({ block }: CrossroadBlockProps) {
  return (
    <section className="py-8">
      <div className="space-y-12">
        {block.items.map((item, index) => {
          const reverse =
            'reverseContent' in item ? item.reverseContent : item.imagePosition === 'right'

          return (
            <div
              key={index}
              className={`flex flex-col gap-8 md:flex-row md:items-center ${
                reverse ? 'md:flex-row-reverse' : ''
              }`}
            >
              {item.image && (
                <div className="relative aspect-video w-full md:w-1/2">
                  <PimcoreImage
                    image={item.image}
                    className="rounded-lg object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-4">
                <h3 className="text-2xl font-semibold">{item.title}</h3>
                {item.text && <p className="text-muted-foreground">{item.text}</p>}
                {item.linkHref && item.linkText && (
                  <Link
                    href={item.linkHref}
                    className="inline-flex w-fit rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    {item.linkText}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
