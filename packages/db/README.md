# @workspace/db

MongoDB connection for **theo**, via Mongoose.

## Usage

```typescript
import { connectDb, getDb } from "@workspace/db"

await connectDb()
```

`getDb()` and `getMongoClient()` expose the native MongoDB handle and client from the shared Mongoose connection (single pool per instance).

## Auth migrations

```bash
pnpm --filter @workspace/auth db:migrate
```
