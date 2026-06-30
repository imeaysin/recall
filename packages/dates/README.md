# @workspace/dates

Centralized date utilities for **Theo**, powered by **date-fns**.

## Usage

```typescript
import { formatDate, DATE_FORMATS } from "@workspace/dates"

const full = formatDate(new Date())
const iso = formatDate(new Date(), DATE_FORMATS.ISO)
```

```typescript
import { relativeTime } from "@workspace/dates"

const text = relativeTime("2026-05-10")
```

Part of the Theo monorepo template.
