declare module "pdf-parse" {
  type PdfInfo = {
    Title?: string
    Author?: string
  }

  type PdfData = {
    text: string
    info?: PdfInfo
    numpages?: number
  }

  function pdfParse(
    dataBuffer: Buffer,
    options?: Record<string, unknown>
  ): Promise<PdfData>

  export default pdfParse
}
