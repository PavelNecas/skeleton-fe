# UI Components

## Overview

UI is split into two layers:
- **`packages/ui`** — shared primitives (shadcn/ui based), reusable across all apps
- **`apps/web/src/core/components`** — app-specific components (layout, content blocks, shared)

## packages/ui (shadcn/ui)

shadcn/ui components copied into the project (not npm dependency — we own the code). Built on Radix UI (accessibility) + Tailwind CSS (styling).

### Available Components

Base: Button, Input, Textarea, Select, Checkbox, Slider
Overlay: Dialog, Sheet, Popover, Tooltip
Forms: Form (react-hook-form + zod), Label
Data: Card, Badge, Tabs, Table
Navigation: NavigationMenu, DropdownMenu, Breadcrumb
Feedback: Toast (Sonner), Alert

### Theming

shadcn/ui uses CSS variables for theming. Base variables defined in `globals.css`, per-site overrides in `styles/themes/{site}.css`:

```css
:root {
  --primary: 222 47% 11%;
  --background: 0 0% 100%;
  --radius: 0.5rem;
}
```

### Utility

`cn()` helper (from `packages/ui/src/lib/utils.ts`) — merges Tailwind classes with conflict resolution via `tailwind-merge` + `clsx`.

## Core Components (`apps/web/src/core/components`)

### Layout (`core/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Header` | Site logo, navigation, language switcher |
| `Footer` | Footer navigation, copyright |
| `Navigation` | Recursive rendering of NavigationNode tree from ES |
| `LanguageSwitcher` | Builds localized URLs from route.translationLinks |

### Content Blocks (`core/components/content/`)

Renderers for editables (documents) and contentBlocks (articles) from ES.

| Component | ES type | Key props |
|-----------|---------|-----------|
| `BlockRenderer` | — | Dispatcher: sorts by `order`, switches on `type` → component |
| `RichTextBlock` | `rich-text` | `content` (HTML string) |
| `CrossroadBlock` | `crossroad-block` | `items[]` with title, text, imagePosition/reverseContent, link, imageId |
| `HighlightBlock` | `highlight` | `items[]` with title, text, imageId |
| `ImageBlock` | `image` | `imageId` |

**BlockRenderer pattern:**
```tsx
function BlockRenderer({ blocks }: { blocks: (Editable | ContentBlock)[] }) {
  return blocks
    .sort((a, b) => a.order - b.order)
    .map(block => {
      switch (block.type) {
        case 'rich-text': return <RichTextBlock {...block} />
        case 'crossroad-block': return <CrossroadBlock {...block} />
        case 'highlight': return <HighlightBlock {...block} />
        case 'image': return <ImageBlock {...block} />
      }
    })
}
```

### Shared (`core/components/shared/`)

| Component | Purpose |
|-----------|---------|
| `SEOHead` | Generates title, description, hreflang tags from route data |
| `Breadcrumbs` | Path-based breadcrumb generation |

### Layouts (`core/layouts/`)

| Layout | Purpose |
|--------|---------|
| `MainLayout` | Header + Navigation + main content + Footer. Fetches navigation from ES. |

## Component Conventions

- **Server Components by default** — only add `'use client'` for interactivity
- **Props interfaces** — define alongside component, export for testing
- **Tailwind only** — no CSS modules, no styled-components
- **Accessible** — Radix handles ARIA, keyboard nav; verify with content blocks too
