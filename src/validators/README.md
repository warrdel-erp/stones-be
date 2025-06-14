# Validators

This directory contains Zod validation schemas for request validation across the application.

## Structure

- `advancedDeposit.validator.ts` - Validation schemas for advanced deposit operations
- `index.ts` - Exports all validators for clean imports

## Usage

### 1. Create a validator schema

```typescript
// validators/example.validator.ts
import { z } from "zod";

export const createExampleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  age: z.number().int().positive("Age must be positive"),
});

export type CreateExampleInput = z.infer<typeof createExampleSchema>;
```

### 2. Use in routes

```typescript
// routes/example.routes.ts
import { validateRequest } from "../middleware/validationMiddleware";
import { createExampleSchema } from "../validators";

router.post("/", validateRequest(createExampleSchema), controller.createExample);
```

### 3. Use typed input in controller

```typescript
// controllers/example.controller.ts
import { CreateExampleInput } from "../validators";

export const createExampleHandler = async (req: Request, res: Response) => {
  const data: CreateExampleInput = req.body; // Now typed and validated
  // ... rest of the logic
};
```

## Benefits

- **Type Safety**: Automatic TypeScript types from Zod schemas
- **Runtime Validation**: Validates request data before reaching controllers
- **Consistent Error Messages**: Standardized validation error responses
- **Reusable**: Validation schemas can be reused across different endpoints
- **Maintainable**: Centralized validation logic in dedicated files
