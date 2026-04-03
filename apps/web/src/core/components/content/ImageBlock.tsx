import type { ImageContentBlock } from '@skeleton-fe/sdk-elastic'

import { PimcoreImage } from '@/core/components/PimcoreImage'

export interface ImageBlockProps {
  block: ImageContentBlock
}

export function ImageBlock({ block }: ImageBlockProps) {
  if (!block.image) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <PimcoreImage image={block.image} className="w-full object-cover" />
    </div>
  )
}
