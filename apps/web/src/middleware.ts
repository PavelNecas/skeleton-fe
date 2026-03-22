import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { handleAuthMiddleware } from './lib/auth/middleware'
import { detectLocale } from './lib/locale'
import { resolveRoute } from './lib/route-resolver'
import { resolveSite } from './lib/site-resolver'
import { getTemplateName } from './lib/template-registry'
import type { RouteInfo } from './lib/types'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') ?? request.nextUrl.hostname

  // 1. Site detection
  const site = await resolveSite(hostname)

  // 2. Locale detection
  const { locale, resolvedPath } = detectLocale(pathname, site.availableLocales, site.defaultLocale)

  // 3. Auth check (skip /login and /api/ paths)
  if (!pathname.startsWith('/login') && !pathname.startsWith('/api/')) {
    const authResponse = await handleAuthMiddleware(request)
    if (authResponse !== null) {
      return authResponse
    }
  }

  // 4. Route resolution (skip for /login pages)
  if (pathname.startsWith('/login')) {
    return NextResponse.next()
  }

  const routeResult = await resolveRoute(site.prefix, resolvedPath, locale)

  if (routeResult.kind === 'redirect') {
    // Reconstruct the canonical URL with locale prefix if needed
    const canonicalPath: string =
      locale !== site.defaultLocale
        ? `/${locale}${routeResult.destination}`
        : routeResult.destination

    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = canonicalPath
    return NextResponse.redirect(redirectUrl, { status: routeResult.statusCode })
  }

  if (routeResult.kind === 'not-found') {
    // Rewrite to the catch-all; page will render a 404
    const rewriteUrl = request.nextUrl.clone()
    rewriteUrl.pathname = pathname
    return NextResponse.rewrite(rewriteUrl, {
      headers: {
        'x-site-prefix': site.prefix,
        'x-locale': locale,
        'x-default-locale': site.defaultLocale,
        'x-route': '{}',
        'x-template': '',
        'x-not-found': '1',
      },
    })
  }

  // 5. Build route info header
  const routeInfo: RouteInfo = {
    sourceId: routeResult.sourceId,
    sourceType: routeResult.sourceType,
    controllerTemplate: routeResult.controllerTemplate,
    translationLinks: routeResult.translationLinks,
  }

  const templateName =
    getTemplateName(routeResult.controllerTemplate) ?? routeResult.controllerTemplate

  // 5. Rewrite with headers so the catch-all page can read them
  const rewriteUrl = request.nextUrl.clone()
  return NextResponse.rewrite(rewriteUrl, {
    headers: {
      'x-site-prefix': site.prefix,
      'x-locale': locale,
      'x-default-locale': site.defaultLocale,
      'x-route': JSON.stringify(routeInfo),
      'x-template': templateName,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico, sitemap.xml, robots.txt
     * - API routes
     * - Public folder files (png, jpg, svg, …)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf|eot|css|js)$).*)',
  ],
}
