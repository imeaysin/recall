import React from "react"

export interface NavItem {
  title?: string
  href: string
  disabled?: boolean
  external?: boolean
  icon?: React.ElementType
  label: string
  description?: string
}

export const appPrefetchRoutes: string[] = []
export const featurePrefetchRoutes: string[] = []
export const headerFeatureLinks: NavItem[] = []
export const headerResourceLinksCol1: NavItem[] = []
export const headerResourceLinksCol2: NavItem[] = []
export const headerResourceLinks: NavItem[] = []

export const footerNavigation = {
  features: [] as NavItem[],
  product: [] as NavItem[],
  company: [] as NavItem[],
  resources: [] as NavItem[],
}

export const socialLinks = {
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
  api: "https://api.example.com",
  status: "https://status.example.com",
}
