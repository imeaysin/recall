# @workspace/db

MongoDB connection for **theo**, via Mongoose.

## Usage

```typescript
import { connectDb, getDb } from "@workspace/db"

await connectDb()
```

`getDb()` exposes the native MongoDB handle used by Better Auth.

## Auth migrations

```bash
pnpm --filter @workspace/auth db:migrate
```
