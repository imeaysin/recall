# Marketing landing template

Frontend-only Next.js 16 marketing / landing site for this monorepo template.

## Customize first

- Brand, URLs, emails: `@workspace/config/public` (`productConfig`)
- Home content & Pro pricing: `content/home.ts` + `lib/pricing.ts`
- Testimonials: `content/testimonials.ts`
- Chrome extension URL: `lib/chrome-extension.ts`

This template does **not** ship a docs site — keep product docs elsewhere (or add a new app) if you need them.

## Rules

- Preserve the landing page sections, responsive behavior, animations, and
  content hierarchy — swap copy/assets via the config files above.
- Do not add API routes, authentication, database code, storage, workflows, or
  product-specific backend packages into this app.
- Build controls and primitives with `@workspace/ui-shadcn`.
- Inherit fonts and theme tokens from `@workspace/ui-shadcn/globals.css`.
- Use semantic color and type-scale utilities; do not add raw colors or
  pixel-sized text.
- Apply `font-sans` on the document body so marketing fonts win over shared
  fallbacks (do not edit `packages/ui-shadcn` globals for this).
