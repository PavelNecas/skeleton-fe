import Image from 'next/image'
import type { ImageContentBlock } from '@skeleton-fe/sdk-elastic'

import { getImageUrl } from '@/core/utils/image'

export interface ImageBlockProps {
  block: ImageContentBlock
}

export function ImageBlock({ block }: ImageBlockProps) {
  const imageUrl = getImageUrl(block.imageId)

  if (!imageUrl) {
    return null
  }

  return (
    <div className="relative w-full overflow-hidden rounded-lg">
      <Image
        src={imageUrl}
        alt=""
        width={1200}
        height={630}
        className="w-full object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />
    </div>
  )
}
