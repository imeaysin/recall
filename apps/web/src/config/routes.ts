/** Layout + page segments — single source for React Router and URL building. */
export const routeSegments = {
  auth: {
    root: "auth",
    signIn: "sign-in",
    signOut: "sign-out",
  },
  app: {
    root: "app",
    dashboard: "dashboard",
    library: "library",
    libraryTrash: "trash",
    libraryContent: ":contentId",
    chat: "chat",
    topics: "topics",
    uploads: "uploads",
    settings: "settings",
  },
} as const

function toPath(...parts: string[]) {
  return `/${parts.join("/")}`
}

/** Full app URLs — for `<Link>`, `navigate()`, and auth callbacks. */
export const routes = {
  home: "/",
  signIn: toPath(routeSegments.auth.root, routeSegments.auth.signIn),
  signOut: toPath(routeSegments.auth.root, routeSegments.auth.signOut),
  dashboard: toPath(routeSegments.app.root, routeSegments.app.dashboard),
  library: toPath(routeSegments.app.root, routeSegments.app.library),
  libraryTrash: toPath(
    routeSegments.app.root,
    routeSegments.app.library,
    routeSegments.app.libraryTrash
  ),
  libraryDetail: (contentId: string) =>
    toPath(routeSegments.app.root, routeSegments.app.library, contentId),
  chat: toPath(routeSegments.app.root, routeSegments.app.chat),
  chatDetail: (chatId: string) =>
    toPath(routeSegments.app.root, routeSegments.app.chat, chatId),
  topics: toPath(routeSegments.app.root, routeSegments.app.topics),
  uploads: toPath(routeSegments.app.root, routeSegments.app.uploads),
  settings: toPath(routeSegments.app.root, routeSegments.app.settings),
  settingsAccount: toPath(
    routeSegments.app.root,
    routeSegments.app.settings,
    "account"
  ),
  settingsSecurity: toPath(
    routeSegments.app.root,
    routeSegments.app.settings,
    "security"
  ),
} as const

export const defaultAuthenticatedRoute = routes.library

export function absoluteAppUrl(path: string): string {
  if (typeof window === "undefined") return path
  return new URL(path, window.location.origin).href
}
