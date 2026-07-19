import Pricing from "@/components/pricing"
import { ReadyToGetStarted } from "@/components/ready-to-get-started"
import { TextReveal } from "@/components/ui/text-reveal"
import { homeContent } from "@/content/home"
import Faq from "./faq"
import Features from "./features"
import Header from "./header"
import { HomePageSchema } from "./home-page-schema"
import HomeTestimonials from "./testimonials"

export function HomePage() {
  return (
    <>
      <HomePageSchema />
      <Header />
      <div className="flex flex-col gap-20 sm:gap-28 lg:gap-40">
        <Features />
        <HomeTestimonials />
        <Pricing />
      </div>
      <div className="mt-20 sm:mt-[120px] lg:mt-[180px]">
        <Faq />
      </div>
      <TextReveal className="mx-auto max-w-[600px] text-center leading-[1.2]">
        {homeContent.textReveal}
      </TextReveal>
      <ReadyToGetStarted />
    </>
  )
}
