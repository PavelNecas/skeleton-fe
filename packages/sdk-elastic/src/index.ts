// Client
export { ElasticClient } from './client'
export type { ElasticClientConfig, SearchWithTotalResult } from './client'

// Shared types
export type {
  Property,
  TextProperty,
  BoolProperty,
  RelationProperty,
  ImageSource,
  PimcoreImage,
  Editable,
  RichTextEditable,
  CrossroadBlockEditable,
  CrossroadBlockItem,
  ContentBlock,
  CrossroadContentBlock,
  HighlightContentBlock,
  ImageContentBlock,
  CrossroadContentItem,
  HighlightContentItem,
  TechnicalData,
  PageTechnicalData,
  NavigationData,
} from './types'

// Index classes and interfaces
export { RoutesIndex } from './indices/routes'
export type { Route, RouteAlias, TranslationLink as RouteTranslationLink } from './indices/routes'

export { SitesIndex } from './indices/sites'
export type { Site, LocalizedErrorDocument } from './indices/sites'

export { PagesIndex } from './indices/pages'
export type { Page } from './indices/pages'

export { ArticlesIndex } from './indices/articles'
export type {
  Article,
  ArticleCategory,
  ArticleImages,
  ArticleListingParams,
  ArticleListingResult,
} from './indices/articles'

export { NavigationsIndex } from './indices/navigations'
export type { Navigation, NavigationNode } from './indices/navigations'

export { SnippetsIndex } from './indices/snippets'
export type { Snippet } from './indices/snippets'

export { LinksIndex } from './indices/links'
export type { Link, LinkData } from './indices/links'

export { HardlinksIndex } from './indices/hardlinks'
export type { Hardlink, SourceData } from './indices/hardlinks'
