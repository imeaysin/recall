const MS_PER_DAY = 24 * 60 * 60 * 1000

export function chatDayGroupLabel(iso: string, now = new Date()): string {
  const day = startOfLocalDay(new Date(iso)).getTime()
  const today = startOfLocalDay(now).getTime()
  const deltaDays = Math.round((today - day) / MS_PER_DAY)

  if (deltaDays <= 0) return "Today"
  if (deltaDays === 1) return "Yesterday"
  return "Earlier"
}

function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}
