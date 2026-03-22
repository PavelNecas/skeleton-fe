import type { RichTextEditable } from '@skeleton-fe/sdk-elastic'

export interface RichTextBlockProps {
  block: RichTextEditable
}

export function RichTextBlock({ block }: RichTextBlockProps) {
  return (
    <div
      className="prose prose-neutral max-w-none"
      dangerouslySetInnerHTML={{ __html: block.content }}
    />
  )
}
