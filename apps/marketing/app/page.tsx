import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { StartPage } from "@/components/home/startpage"

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <StartPage />
      <Footer />
    </div>
  )
}
