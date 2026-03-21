# SDK Packages

## sdk-elastic (`packages/sdk-elastic`)

ES client and typed value objects for all Elasticsearch indices.

### Structure

```
sdk-elastic/
├── src/
│   ├── client.ts         # ElasticClient class (connection, auth, search helpers)
│   ├── types.ts          # Shared polymorphic types
│   ├── indices/
│   │   ├── routes.ts     # Route VO + RoutesIndex query builder
│   │   ├── pages.ts      # Page VO + PagesIndex query builder
│   │   ├── articles.ts   # Article VO + ArticlesIndex query builder
│   │   ├── navigations.ts
│   │   ├── sites.ts
│   │   ├── snippets.ts
│   │   ├── links.ts
│   │   └── hardlinks.ts
│   └── index.ts          # Public API exports
├── __tests__/
└── package.json
```

### ES Client

```typescript
class ElasticClient {
  constructor(config: { url: string; username: string; password: string })

  // Core methods
  search<T>(index: string, query: object): Promise<T[]>
  searchOne<T>(index: string, query: object): Promise<T | null>

  // Index accessors
  routes: RoutesIndex
  pages: PagesIndex
  articles: ArticlesIndex
  navigations: NavigationsIndex
  sites: SitesIndex
  snippets: SnippetsIndex
  links: LinksIndex
  hardlinks: HardlinksIndex
}
```

### Index Naming Convention

`{sitePrefix}_{baseName}_{locale}`

- Site prefix derived from domain: `skeleton.localhost` → `skeleton_localhost`
- Locale appended for localized indices: `skeleton_localhost_pages_cs`
- Non-localized indices (navigations, sites, routes): `skeleton_localhost_navigations`

### Shared Types (types.ts)

**Property** — polymorphic, discriminated by `type`:
- `TextProperty` (`type: 'text' | 'select'`) — `name`, `value`
- `BoolProperty` (`type: 'bool'`) — `name`, `valueBool`
- `RelationProperty` (`type: 'document' | 'asset' | 'object'`) — `name`, `id`, `path`

**Editable** — polymorphic, for documents (pages, snippets, emails):
- `RichTextEditable` (`type: 'rich-text'`) — `order`, `content`
- `CrossroadBlockEditable` (`type: 'crossroad-block'`) — `order`, `items[]`

**ContentBlock** — polymorphic, for objects (articles):
- `CrossroadContentBlock` (`type: 'crossroad-block'`) — `order`, `items[]` (with `reverseContent`)
- `HighlightContentBlock` (`type: 'highlight'`) — `order`, `items[]`
- `ImageContentBlock` (`type: 'image'`) — `order`, `imageId`

### Key Query Builders

**RoutesIndex:**
- `findByPath(sitePrefix, path)` → search `{sitePrefix}_routes` WHERE path + published
- `findByAlias(sitePrefix, path)` → nested query on aliases array
- `findTranslations(sitePrefix, sourceId)` → all routes with same sourceId

**PagesIndex:**
- `findById(sitePrefix, locale, id)` → search `{sitePrefix}_pages_{locale}` WHERE id

**ArticlesIndex:**
- `findById(sitePrefix, locale, id)` → search `{sitePrefix}_articles_{locale}` WHERE id

**NavigationsIndex:**
- `getByName(sitePrefix, menuDocumentName)` → search `{sitePrefix}_navigations` WHERE menuDocumentName

**SitesIndex:**
- `findByDomain(sitePrefix, domain)` → search `{sitePrefix}_sites` WHERE mainDomain

### Schema Reference

Full ES schemas: `.claude/temp/structure.json`
Runtime: `GET /api/search/schemas` on backend

---

## sdk-pimcore (`packages/sdk-pimcore`)

HTTP client for Pimcore REST API.

### Structure

```
sdk-pimcore/
├── src/
│   ├── client.ts         # PimcoreClient class (base URL, auth interceptors)
│   ├── auth.ts           # AuthClient (login, refresh, client credentials)
│   ├── endpoints/        # Future endpoint wrappers
│   ├── types.ts          # TokenResponse, LoginCredentials
│   └── index.ts
├── __tests__/
└── package.json
```

### Auth Endpoints

**Customer login** — `POST /api/auth/login`
- Request: `{ email: string, password: string }`
- Response: `{ token_type: "Bearer", expires_in: 3600, access_token: "<JWT>", refresh_token: "<40-char hex>" }`

**M2M client credentials** — `POST /token`
- Request: `{ grant_type: "client_credentials", client_id, client_secret }`
- Response: same TokenResponse structure

### Backend API Reference

- API docs: `http://skeleton.localhost/api/docs/`
- Backend uses OAuth2 scopes: `read:products`, `write:orders`, `read:customers`, `manage:customers`
