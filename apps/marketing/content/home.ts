import { productConfig } from "@workspace/config/public"
import { proPricing } from "../lib/pricing"

/** Homepage + pricing copy for the landing template. Edit here first. */
export const homeContent = {
  hero: {
    announcement: {
      text: "Early adopter pricing — lock in your discount",
      href: "/pricing",
    },
    title: productConfig.tagline,
    description: productConfig.description,
    cta: {
      primary: `Get ${productConfig.name} Pro`,
      freeNote: "Free to start. No credit card required.",
    },
    migrate: {
      label: "Coming from another tool?",
      href: "/migrate",
    },
    trustedBy: "Trusted by teams and creators",
  },
  textReveal: "Build. Launch. Grow.",
  features: {
    title: "Built for how you actually work",
    subtitle:
      "Every feature is designed to save time and keep your workflow clean.",
    items: [
      {
        title: "Your data, your rules",
        description: `Keep content local, use ${productConfig.name} Cloud, or connect your own storage. You're never locked in.`,
        artboard: "storageoptions",
        artClassName: "mx-auto h-[220px] w-full max-w-[350px]",
      },
      {
        title: "Privacy by default",
        description:
          "Share when you need to, stay private when you don't. Password-protect sensitive links or keep everything offline.",
        artboard: "privacyfirst",
        artClassName: "mx-auto h-[220px] w-full max-w-[560px]",
      },
      {
        title: "Collaboration that moves",
        description:
          "Comments, reactions, and searchable transcripts keep conversations going without another meeting.",
        artboard: "collab",
        artClassName: "mx-auto h-[220px] w-full max-w-[500px]",
      },
      {
        title: "Cross-platform for your team",
        description:
          "Native apps for macOS and Windows that feel at home on each platform.",
        artboard: "platformsupport",
        artClassName: "mx-auto h-[220px] w-full max-w-[500px]",
      },
      {
        title: "Quality that looks professional",
        description:
          "High-resolution capture and smart compression so files stay sharp without being huge.",
        artboard: "videocapture",
        artClassName: "mx-auto h-[220px] w-full max-w-[420px]",
      },
      {
        title: "Open and customizable",
        description: `Fork ${productConfig.name}, contribute features you need, or self-host for complete control.`,
        artboard: "everyone",
        artClassName: "mx-auto h-[220px] w-full max-w-[600px]",
      },
      {
        title: `Speed up with ${productConfig.name} AI`,
        description:
          "Auto-generated titles, summaries, chapters, and transcriptions for every share.",
        // Rive artboard name is Cap-era; renaming breaks the animation.
        artboard: "capai",
        artClassName: "mx-auto h-[220px] w-full max-w-[550px]",
      },
    ],
  },
  testimonials: {
    title: "Loved by builders, trusted by teams",
    subtitle: `Join teams who use ${productConfig.name} for clear, visual communication.`,
    cta: "Read more testimonials",
  },
  pricing: {
    title: "Simple, honest pricing",
    subtitle:
      "Start free, upgrade when you need more. Early adopter pricing locked in forever.",
    lovedBy: "Trusted by teams and creators",
    commercial: {
      title: "Desktop License",
      description: `A commercial license for the ${productConfig.name} desktop app — unlimited local capture and editing.`,
      features: [
        "Commercial usage rights",
        "Unlimited local recordings & editing",
        "Full desktop editor",
        "Limited cloud shareable links / month",
        "Export to common formats",
        "Community support",
      ],
      cta: "Get Desktop License",
      pricing: { yearly: 29, lifetime: 58 },
      labels: {
        licenses: "License type",
        yearly: "Annual",
        lifetime: "One-time",
      },
    },
    pro: {
      badge: "Best value",
      title: `${productConfig.name} Pro`,
      description:
        "Everything in Desktop plus unlimited cloud features for sharing and collaboration.",
      features: [
        "Everything in Desktop License",
        "Unlimited cloud storage & bandwidth",
        "Auto-generated titles, summaries, chapters, and transcriptions",
        "Custom domain (app.yourdomain.com)",
        "Password protected shares",
        "Viewer analytics & engagement",
        "Team workspaces",
        "Bring-your-own storage",
        "Priority support & early features",
      ],
      cta: "Get Started",
      pricing: {
        annual: proPricing.annualMonthly,
        monthly: proPricing.monthly,
      },
      labels: {
        users: "Per user",
        monthly: "Monthly",
        annually: "Annual (save 32%)",
      },
    },
  },
  faq: {
    title: "Questions? We've got answers.",
    items: [
      {
        question: `What is the difference between ${productConfig.name} Pro and Desktop License?`,
        answer: `${productConfig.name} Pro includes everything in the Desktop License plus cloud features for sharing and collaboration. Desktop License grants commercial usage rights for a single user.`,
      },
      {
        question: "Is there a free version?",
        answer: `Yes. ${productConfig.name} is free for personal use. Upgrade to ${productConfig.name} Pro when you need unlimited cloud sharing and team features.`,
      },
      {
        question: "How long can I record on the free version?",
        answer: `Local recording on the free plan is unlimited. Cloud share links have a length limit until you upgrade to ${productConfig.name} Pro.`,
      },
      {
        question: `How does ${productConfig.name} AI work?`,
        answer: `${productConfig.name} AI generates titles, summaries, chapters, and transcriptions. It's included with ${productConfig.name} Pro with no usage limits.`,
      },
      {
        question: `How is ${productConfig.name} different from closed SaaS tools?`,
        answer: `${productConfig.name} is open source, supports custom storage, works offline in the desktop app, and lets you own your content.`,
      },
      {
        question: "What happens to my content if I cancel?",
        answer:
          "Your content is yours. If you cancel Pro, existing shares remain active and you can export everything. Downgrade to free to keep working locally, or self-host to maintain all features.",
      },
      {
        question: "Do you offer team plans?",
        answer: `Yes. ${productConfig.name} Pro includes team workspaces for organizing content, permissions, and collaboration. Volume discounts are available for larger teams.`,
      },
      {
        question: "Which platforms do you support?",
        answer:
          "Native desktop apps for macOS (Apple Silicon & Intel) and Windows. View shareable links from anywhere.",
      },
      {
        question: `Can I use ${productConfig.name} for commercial purposes?`,
        answer: `Yes. Any paid plan (Desktop License or ${productConfig.name} Pro) includes full commercial usage rights. The free version is for personal use only.`,
      },
      {
        question: "Is my data secure?",
        answer: `Security is core to ${productConfig.name}. As an open source project, the code is auditable. Bring-your-own storage and self-hosting keep data under your control.`,
      },
      {
        question: "What about compliance?",
        answer: `${productConfig.name} Pro lets you bring your own storage for regional requirements. Self-hosting gives full control for stricter compliance needs.`,
      },
    ],
  },
  readyToGetStarted: {
    title: "Ready when you are",
    download: "Download for free",
    pro: `Get ${productConfig.name} Pro`,
  },
} as const
