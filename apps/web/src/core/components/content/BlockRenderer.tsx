import type { ContentBlock, Editable } from '@skeleton-fe/sdk-elastic'

import { CrossroadBlock } from './CrossroadBlock'
import { HighlightBlock } from './HighlightBlock'
import { ImageBlock } from './ImageBlock'
import { RichTextBlock } from './RichTextBlock'

export interface BlockRendererProps {
  blocks: (Editable | ContentBlock)[]
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  const sorted = [...blocks].sort((a, b) => a.order - b.order)

  return (
    <>
      {sorted.map((block, index) => {
        switch (block.type) {
          case 'rich-text':
            return <RichTextBlock key={index} block={block} />
          case 'crossroad-block':
            return <CrossroadBlock key={index} block={block} />
          case 'highlight':
            return <HighlightBlock key={index} block={block} />
          case 'image':
            return <ImageBlock key={index} block={block} />
          default:
            return null
        }
      })}
    </>
  )
}
