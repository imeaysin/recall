"use client"

import { Button } from "@/components/product-ui"
import { WhenVisible } from "@/components/ui/when-visible"
import { homeContent } from "@/content/home"
import { Fit, Layout, useRive } from "@/lib/rive"

function FeatureRive({ artboard }: { artboard: string }) {
  const { RiveComponent } = useRive({
    src: "/rive/bento.riv",
    artboard,
    animations: ["in"],
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain }),
  })

  return <RiveComponent className="h-full w-full" />
}

function FeatureCard({
  title,
  description,
  artboard,
  artClassName,
}: (typeof homeContent.features.items)[number]) {
  return (
    <div className="flex flex-col gap-8 rounded-2xl border border-border/80 bg-card/60 p-6 text-left md:gap-10 md:p-8">
      <WhenVisible className={artClassName}>
        <FeatureRive artboard={artboard} />
      </WhenVisible>
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-base text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export default function Features() {
  const { title, subtitle, items } = homeContent.features

  return (
    <div className="mx-auto max-w-6xl px-5 text-center">
      <p className="mb-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Features
      </p>
      <h2 className="mb-3 text-3xl font-medium tracking-tight text-balance text-foreground md:text-4xl">
        {title}
      </h2>
      <p className="mx-auto w-full max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
        {subtitle}
      </p>

      <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-14 md:gap-4 lg:grid-cols-3">
        {items.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      <div className="mt-10">
        <Button
          href="/features"
          variant="outline"
          size="lg"
          className="inline-flex font-medium"
        >
          View all features
        </Button>
      </div>
    </div>
  )
}
