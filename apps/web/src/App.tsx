import { Suspense } from "react"
import { Link, Route, BrowserRouter, Routes } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { PageNotFound } from "@workspace/ui/components/page-not-found"
import { AppProviders } from "@workspace/ui/providers/app-providers"
import { AppErrorBoundary } from "@workspace/ui/providers/app-error-boundary"
import { HomePage } from "./pages/home"

function App() {
  return (
    <AppProviders>
      <AppErrorBoundary>
        <Suspense fallback={<PageLoading />}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="*"
                element={
                  <PageNotFound
                    action={
                      <Button render={<Link to="/" />}>Go home</Button>
                    }
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </Suspense>
      </AppErrorBoundary>
    </AppProviders>
  )
}

export default App
