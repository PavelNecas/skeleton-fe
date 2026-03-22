import Link from 'next/link'

export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps {
  siteName: string
  links?: FooterLink[]
}

export function Footer({ siteName, links = [] }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          &copy; {year} {siteName}. All rights reserved.
        </p>
        {links.length > 0 && (
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center gap-4">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  )
}
