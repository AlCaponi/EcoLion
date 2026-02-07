# Agents Guide — Eco-Löwe

## Adding a New API Endpoint

When adding a new endpoint to the project, update **both** the frontend API layer and the api-tests contract. Follow these steps in order:

### 1. Define the DTO type

Add the TypeScript interface to **two** files (they must stay in sync):

- `eco-loewe-pwa/src/shared/api/types.ts` — frontend source of truth
- `api-tests/src/contracts/types.ts` — test contract copy

```typescript
export interface MyNewDTO {
  id: string;
  name: string;
  value: number;
}
```

### 2. Add the Zod validation schema

File: `api-tests/src/contracts/schemas.ts`

```typescript
export const MyNewSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  value: z.number().nonnegative(),
});
```

### 3. Add the frontend endpoint function

File: `eco-loewe-pwa/src/shared/api/endpoints.ts`

```typescript
export const Api = {
  // ... existing endpoints ...
  myNew: () => apiRequest<MyNewDTO>("/v1/my-new"),
};
```

### 4. Add fixture / seed data

Create: `api-tests/src/fixtures/my-new.fixture.ts`

```typescript
import type { MyNewDTO } from "../contracts/types.ts";

export const myNewItems: MyNewDTO[] = [
  { id: "item-1", name: "Example", value: 42 },
];
```

Then export it from `api-tests/src/fixtures/index.ts`:

```typescript
export { myNewItems } from "./my-new.fixture.ts";
```

### 5. Write the contract test

Create: `api-tests/src/tests/my-new.test.ts`

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import type { ApiClient } from "../client/api-client.ts";
import { createTestContext } from "../helpers/test-context.ts";
import { MyNewSchema } from "../contracts/schemas.ts";
import type { MyNewDTO } from "../contracts/types.ts";

describe("GET /v1/my-new", () => {
  let client: ApiClient;

  beforeAll(async () => {
    const ctx = await createTestContext("MyNewTestUser");
    client = ctx.client;
  });

  it("should return 200", async () => {
    const { status } = await client.get<MyNewDTO>("/v1/my-new");
    expect(status).toBe(200);
  });

  it("should match the schema", async () => {
    const { data } = await client.get<MyNewDTO>("/v1/my-new");
    const result = MyNewSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
});
```

### 6. Run the tests

```bash
# Run all tests
docker compose --profile test run --rm api-tests

# Run just your new test
docker compose --profile test run --rm api-tests npx vitest run --testPathPattern my-new
```

No configuration changes are needed — vitest auto-discovers `*.test.ts` files.

---

## Running Services

```bash
# Frontend only
docker compose up --build

# Frontend + run tests once
docker compose --profile test up --build

# Run tests in isolation
docker compose --profile test run --rm api-tests

# Seed the backend with sample data
docker compose --profile test run --rm api-tests npm run test:seed
```

## Key DTOs

### DashboardDTO
The dashboard returns a `sustainabilityScore` (abstract score, not raw CO2) and a `lion` object with:
- `mood` — `"sad" | "neutral" | "happy"`
- `activityMode` — `"sleeping" | "idle" | "walking" | "riding"`
- `accessories` — flat array of equipped item IDs (e.g. `["hat-cap", "acc-sunglasses"]`)
- `coins` — currency for buying new accessories

### AssetDTO
Each visual accessory is backed by an `AssetDTO` loaded from the assets endpoint:
- `GET /v1/assets/:id` → single `AssetDTO`
- `GET /v1/assets?ids=a,b,c` → `AssetDTO[]`

Categories: `"glasses" | "hats" | "scarfs" | "earrings" | "outfits" | "decor"`

## Project Structure

```
claude1-repo/
├── docker-compose.yml          # Orchestrates all services
├── deploy.sh                   # Auto-deploy on new commits (cron)
├── eco-loewe-pwa/              # React frontend (Vite + TypeScript)
│   └── src/shared/api/         # API client, endpoints, DTO types
├── api-tests/                  # API contract tests (Vitest + Zod)
│   └── src/
│       ├── client/             # HTTP client + auth helpers
│       ├── contracts/          # DTO types + Zod schemas
│       ├── fixtures/           # Seed / sample data
│       ├── helpers/            # Test context + seeding utilities
│       └── tests/              # Test files (auto-discovered)
└── agents.md                   # This file
```
