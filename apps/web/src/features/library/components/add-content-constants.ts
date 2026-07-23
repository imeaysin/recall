export const ADD_CONTENT_TITLE = "Add Content"

export const ADD_CONTENT_DESCRIPTION =
  "Paste a link or upload a file. We'll summarize it, organize it, and make it chat-ready."

export const ADD_CONTENT_URL_PLACEHOLDER =
  "Paste a link: YouTube video, article, or web page"

export const ADD_CONTENT_WIKIPEDIA_PREFIX = "https://en.wikipedia.org/wiki/"

export const ADD_CONTENT_DROPZONE_HINT = "Drop a PDF here, or"
export const ADD_CONTENT_DROPZONE_BROWSE = "browse"

export const ADD_CONTENT_PDF_ACCEPT = "application/pdf,.pdf"

export const ADD_CONTENT_CREATE_LABEL = "Create"
export const ADD_CONTENT_CREATING_LABEL = "Creating…"
export const ADD_CONTENT_UPLOADING_LABEL = "Uploading…"

export enum AddContentMode {
  Link = "link",
  Wiki = "wiki",
  Pdf = "pdf",
}

export const ADD_CONTENT_EXAMPLES = [
  { id: "youtube", label: "YouTube video" },
  { id: "article", label: "News article" },
  { id: "pdf", label: "PDF" },
] as const
