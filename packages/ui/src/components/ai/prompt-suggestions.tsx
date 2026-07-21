import { SparklesIcon } from "lucide-react"

interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

export function PromptSuggestions(props: PromptSuggestionsProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-11 items-center justify-center rounded-2xl border bg-muted/40 text-foreground/80">
          <SparklesIcon className="size-5" aria-hidden />
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
          {props.label}
        </h2>
        <p className="max-w-md text-sm text-pretty text-muted-foreground">
          Ask across your saved sources, or pick a starting point below.
        </p>
      </div>
      <div className="grid w-full gap-2.5 sm:grid-cols-3">
        {props.suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => props.append({ role: "user", content: suggestion })}
            className="rounded-2xl border border-border/80 bg-card/40 px-4 py-3.5 text-left text-sm leading-snug text-foreground/90 shadow-sm transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-border hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}
