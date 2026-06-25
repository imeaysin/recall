import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { Providers } from "@/app/providers"
import { router } from "@/app/router"
import "@/index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="relative isolate min-h-svh">
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </div>
  </StrictMode>
)
