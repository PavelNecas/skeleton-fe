// ============================================================
// Property — polymorphic, discriminated by `type`
// ============================================================

export interface TextProperty {
  type: 'text' | 'select'
  name: string
  value: string
}

export interface BoolProperty {
  type: 'bool'
  name: string
  valueBool: boolean
}

export interface RelationProperty {
  type: 'document' | 'asset' | 'object'
  name: string
  id: number | null
  path: string | null
}

export type Property = TextProperty | BoolProperty | RelationProperty

// ============================================================
// Image — responsive image data from Pimcore thumbnails
// ============================================================

export interface ImageSource {
  type: string
  srcset: string
  media: string | null
}

export interface PimcoreImage {
  src: string
  alt: string
  sources: ImageSource[]
  width: number
  height: number
}

// ============================================================
// Editable — polymorphic, for documents (pages, snippets, emails)
// ============================================================

export interface CrossroadBlockItem {
  title: string
  text: string
  imagePosition: string
  linkHref: string | null
  linkText: string | null
  image: PimcoreImage | null
}

export interface RichTextEditable {
  type: 'rich-text'
  order: number
  content: string
}

export interface CrossroadBlockEditable {
  type: 'crossroad-block'
  order: number
  items: CrossroadBlockItem[]
}

export type Editable = RichTextEditable | CrossroadBlockEditable

// ============================================================
// ContentBlock — polymorphic, for objects (articles)
// ============================================================

export interface CrossroadContentItem {
  title: string
  text: string
  reverseContent: boolean
  linkHref: string | null
  linkText: string | null
  image: PimcoreImage | null
}

export interface HighlightContentItem {
  title: string
  text: string
  image: PimcoreImage | null
}

export interface CrossroadContentBlock {
  type: 'crossroad-block'
  order: number
  items: CrossroadContentItem[]
}

export interface HighlightContentBlock {
  type: 'highlight'
  order: number
  items: HighlightContentItem[]
}

export interface ImageContentBlock {
  type: 'image'
  order: number
  image: PimcoreImage | null
}

export type ContentBlock = CrossroadContentBlock | HighlightContentBlock | ImageContentBlock

// ============================================================
// TechnicalData — for pages and snippets
// ============================================================

export interface TechnicalData {
  controller: string | null
  template: string | null
  contentMainDocumentId: number | null
}

export interface PageTechnicalData extends TechnicalData {
  staticGeneratorEnabled: boolean
  staticGeneratorLifetime: number | null
}

// ============================================================
// NavigationData — for pages, links, hardlinks
// ============================================================

export interface NavigationData {
  name: string | null
  title: string | null
  cssClass: string | null
  target: string | null
  anchor: string | null
  parameters: string | null
  exclude: boolean
  relation: string | null
  accesskey: string | null
  tabindex: string | null
}
