interface PromptSuggestionsProps {
  label: string
  append: (message: { role: "user"; content: string }) => void
  suggestions: string[]
}

export function PromptSuggestions({
  label,
  append,
  suggestions,
}: PromptSuggestionsProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-1">
      <h2 className="text-center text-2xl font-semibold tracking-tight">
        {label}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => append({ role: "user", content: suggestion })}
            className="rounded-xl border bg-background p-4 text-left text-sm transition-colors hover:bg-muted"
          >
            <p className="leading-snug">{suggestion}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
