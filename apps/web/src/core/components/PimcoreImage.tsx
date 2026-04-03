import type { PimcoreImage as PimcoreImageType } from '@skeleton-fe/sdk-elastic'

interface Props {
  image: PimcoreImageType
  className?: string
}

function prefixSrcset(base: string, srcset: string): string {
  return srcset
    .split(',')
    .map((entry) => {
      const match = entry.trim().match(/^(.+)\s+([\d.]+[wx])$/)
      if (!match) {
        return `${base}${entry.trim()}`
      }
      return `${base}${match[1]!} ${match[2]!}`
    })
    .join(', ')
}

export function PimcoreImage({ image, className }: Props) {
  const base = process.env.PIMCORE_BACKEND_URL ?? ''

  return (
    <picture>
      {image.sources
        .filter((source) => Boolean(source.srcset))
        .map((source, index) => (
          <source
            key={index}
            type={source.type}
            srcSet={prefixSrcset(base, source.srcset)}
            {...(source.media !== null ? { media: source.media } : {})}
          />
        ))}
      <img
        src={`${base}${image.src}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className={className}
      />
    </picture>
  )
}
