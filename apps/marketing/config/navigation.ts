import { productConfig } from "@workspace/config/public"

export type NavLink = {
  title: string
  description: string
  href: string
  external?: boolean
}

export type FooterNavLink = {
  href: string
  label: string
  external?: boolean
}

/** Features mega-menu columns */
export const featureNavLinks: NavLink[] = [
  {
    title: "Overview",
    description: "Everything included in the product",
    href: "/features",
  },
  {
    title: "Download",
    description: "Get the desktop apps",
    href: "/download",
  },
  {
    title: "Pricing",
    description: "Simple plans that scale with you",
    href: "/pricing",
  },
  {
    title: "Migrate",
    description: "Bring your library from another tool",
    href: "/migrate",
  },
]

/** Resources mega-menu columns */
export const resourceNavLinks: NavLink[] = [
  {
    title: "Blog",
    description: "Updates, guides, and product notes",
    href: "/blog",
  },
  {
    title: "About",
    description: `Why we built ${productConfig.name}`,
    href: "/about",
  },
  {
    title: "Testimonials",
    description: "What teams are saying",
    href: "/testimonials",
  },
  {
    title: "Support",
    description: "Get help when you need it",
    href: "/support",
  },
  {
    title: "FAQ",
    description: "Common questions answered",
    href: "/faq",
  },
  {
    title: "GitHub",
    description: "Open source on GitHub",
    href: productConfig.repositoryUrl,
    external: true,
  },
]

export const footerNavigation = {
  features: [
    { href: "/features", label: "Overview" },
    { href: "/download", label: "Download" },
    { href: "/pricing", label: "Pricing" },
    { href: "/migrate", label: "Migrate" },
  ] satisfies FooterNavLink[],
  product: [
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/download", label: "Download" },
    { href: "/testimonials", label: "Customer stories" },
  ] satisfies FooterNavLink[],
  company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/support", label: "Support" },
  ] satisfies FooterNavLink[],
  resources: [
    { href: "/faq", label: "FAQ" },
    { href: "/migrate", label: "Migrate" },
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ] satisfies FooterNavLink[],
} as const

export const socialLinks = {
  twitter: "https://x.com/theo",
  linkedin: "https://www.linkedin.com/",
  github: productConfig.repositoryUrl,
  discord: "https://discord.gg/y8gdQ3WRN3",
  status: productConfig.siteUrl,
} as const

export const featurePrefetchRoutes = featureNavLinks.map((l) => l.href)
export const resourcePrefetchRoutes = resourceNavLinks
  .filter((l) => !l.external)
  .map((l) => l.href)
