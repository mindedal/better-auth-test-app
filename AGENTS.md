# AGENTS.md - Agentic Coding Guidelines

This document provides instructions for AI coding agents working on this codebase. Follow these guidelines to produce high-quality, consistent code that aligns with project conventions.

---

## Research First - Use Available Tools

### Context7 MCP (Required for Library Documentation)

**Always use Context7 to fetch up-to-date documentation before implementing features.** This ensures you're using current APIs and best practices.

```
# Key libraries to query via Context7:
- better-auth          # Authentication library
- prisma               # Database ORM
- next.js              # Framework (App Router)
- react-hook-form      # Form handling
- zod                  # Schema validation
- tailwindcss          # Styling (v4)
- radix-ui             # UI primitives
- sonner               # Toast notifications
```

**When to use Context7:**

- Before implementing any authentication feature → fetch better-auth docs
- Before modifying database schema → fetch Prisma docs
- Before creating new pages/routes → fetch Next.js App Router docs
- Before adding form validation → fetch zod + react-hook-form docs
- When unsure about component props → fetch relevant library docs

### Google Dev Tools / Web Search

Use web search for:

- Edge cases and error handling patterns
- Performance optimization techniques
- Security best practices
- Community solutions to common problems
- TypeScript advanced patterns

---

## 📚 Tech Stack Overview

| Category      | Technology            | Version        |
| ------------- | --------------------- | -------------- |
| Framework     | Next.js (App Router)  | 16.0.5         |
| Runtime       | React                 | 19.2.0         |
| Language      | TypeScript            | 5.x            |
| Auth          | better-auth           | ^1.4.3         |
| Database      | Prisma + PostgreSQL   | 7.0.1          |
| Cache         | Upstash Redis         | ^1.35.7        |
| Styling       | Tailwind CSS          | v4             |
| UI Components | shadcn/ui + Radix UI  | new-york style |
| Forms         | react-hook-form + zod | 7.x / 4.x      |
| Notifications | sonner                | ^2.0.7         |

---

## Project Structure

```
app/                          # Next.js App Router
├── layout.tsx                # Root layout (Server Component)
├── page.tsx                  # Landing page (Server Component)
├── globals.css               # Tailwind v4 config + CSS variables
├── api/auth/[...all]/        # better-auth API handler
├── dashboard/page.tsx        # Protected page (Server Component)
└── login/page.tsx            # Auth page (Client Component)

components/
├── dashboard/                # Feature-specific components
│   ├── navbar.tsx            # Navigation (Client)
│   ├── session-manager.tsx   # Session management (Client)
│   └── two-factor-switch.tsx # 2FA toggle (Client)
└── ui/                       # shadcn/ui components

lib/
├── auth.ts                   # better-auth server config (server-only)
├── auth-client.ts            # better-auth React client
├── prisma.ts                 # Prisma client singleton
├── redis.ts                  # Upstash Redis client
└── utils.ts                  # cn() utility function

prisma/
├── schema.prisma             # Database schema
└── migrations/               # Migration history
```

### Path Aliases

Use `@/*` for imports (maps to project root):

```typescript
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
```

---

## React Component Conventions

### Server vs Client Components

**Default to Server Components.** Only use Client Components when necessary.

| Use Server Component        | Use Client Component               |
| --------------------------- | ---------------------------------- |
| Data fetching               | useState, useEffect hooks          |
| Direct database access      | Event handlers (onClick, onChange) |
| Accessing backend resources | Browser APIs                       |
| Keeping secrets server-side | Interactivity                      |
| Large dependencies          | Real-time updates                  |

**Client Component Declaration:**

```typescript
"use client"; // Must be first line

import { useState } from "react";
// ... rest of component
```

### Import Organization

Order imports consistently:

```typescript
// 1. React/Next.js imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { toast } from "sonner";
import { useForm } from "react-hook-form";

// 3. Local components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Utilities and lib
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// 5. Types (often inline or at end)
import type { Session } from "better-auth";
```

---

## Authentication Patterns

### Server-Side Auth Check

```typescript
// In Server Components or API routes
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session) {
  redirect("/login");
}
```

### Client-Side Auth

```typescript
"use client";
import { authClient } from "@/lib/auth-client";

// Get session
const { data: session } = authClient.useSession();

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
});

// Sign out
await authClient.signOut();

// Two-factor operations
await authClient.twoFactor.enable({ password: "..." });
await authClient.twoFactor.verifyTotp({ code: "123456" });
```

### Auth Configuration Reference

- Server config: `lib/auth.ts` (uses `server-only` package)
- Client config: `lib/auth-client.ts`
- API route: `app/api/auth/[...all]/route.ts`

---

## Database Patterns

### Schema Location

All models defined in `prisma/schema.prisma`.

### Current Models

- **User** - Core user data, 2FA status, role
- **Session** - Auth sessions with device info
- **Account** - OAuth/credential accounts
- **Verification** - Email verification tokens
- **TwoFactor** - TOTP secrets and backup codes

### Migration Workflow

```bash
# After modifying schema.prisma:
npx prisma migrate dev --name descriptive_name

# Generate client after schema changes:
npx prisma generate

# View data in browser:
npx prisma studio
```

### Prisma Client Usage

```typescript
import { prisma } from "@/lib/prisma";

// Query example
const user = await prisma.user.findUnique({
  where: { email },
  include: { sessions: true },
});
```

**Note:** This project uses `@prisma/adapter-pg` with a connection pool. See `lib/prisma.ts` for setup.

---

## UI Component Guidelines

### shadcn/ui Configuration

- Style: `new-york`
- Base color: `neutral`
- Icon library: `lucide-react`
- CSS variables: enabled

### Adding New Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add form
```

### Component Patterns

**Using the `cn()` utility for class merging:**

```typescript
import { cn } from "@/lib/utils";

<div
  className={cn(
    "base-classes",
    condition && "conditional-classes",
    className // Allow override from props
  )}
/>;
```

**Using `cva` for variants (see `components/ui/button.tsx`):**

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva("base-classes", {
  variants: {
    variant: {
      default: "...",
      destructive: "...",
      outline: "...",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3",
      lg: "h-10 px-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});
```

### Toast Notifications

```typescript
import { toast } from "sonner";

toast.success("Operation completed");
toast.error("Something went wrong");
toast.loading("Processing...");
```

---

## Form Handling

### Pattern: Controlled Components with State

```typescript
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SimpleForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // ... submit logic
      toast.success("Success!");
    } catch (error) {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Loading..." : "Submit"}
      </Button>
    </form>
  );
}
```

### Pattern: react-hook-form + zod

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

export function ValidatedForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    // ... validated data
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* FormField components */}
      </form>
    </Form>
  );
}
```

---

## Styling Conventions

### Tailwind CSS v4

This project uses Tailwind v4 with PostCSS. Configuration is in `app/globals.css`.

**Key patterns:**

- CSS variables for colors (OKLCH color space)
- Dark mode via `.dark` class: `@custom-variant dark (&:is(.dark *))`
- Border radius via `--radius` variable

### Color Variables

Colors are defined as CSS variables in `globals.css`:

```css
--background: oklch(...);
--foreground: oklch(...);
--primary: oklch(...);
--primary-foreground: oklch(...);
/* etc. */
```

Use semantic color classes:

```html
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground">
    <p className="text-muted-foreground"></p>
  </button>
</div>
```

---

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# App URL (for trusted origins)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth secret (auto-generated by better-auth)
BETTER_AUTH_SECRET="..."
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build    # Runs: prisma generate && next build

# Start production server
npm run start

# Lint code
npm run lint

# Database commands
npx prisma migrate dev    # Create/apply migrations
npx prisma generate       # Regenerate client
npx prisma studio         # Visual database browser
```

---

## Pre-Implementation Checklist

Before implementing any feature:

1. [ ] **Query Context7** for relevant library documentation
2. [ ] **Search codebase** for similar existing patterns
3. [ ] **Check schema** if database changes needed
4. [ ] **Identify component type** (Server vs Client)
5. [ ] **Review existing UI components** in `components/ui/`

---

## Anti-Patterns to Avoid

| Don't                            | Do                                        |
| -------------------------------- | ----------------------------------------- |
| Use `"use client"` unnecessarily | Default to Server Components              |
| Fetch data in Client Components  | Fetch in Server Components, pass as props |
| Install new UI libraries         | Use existing shadcn/ui components         |
| Create custom auth logic         | Use `authClient` methods                  |
| Hardcode colors                  | Use CSS variable classes                  |
| Skip loading states              | Always handle loading/error states        |
| Ignore TypeScript errors         | Fix all type issues                       |

---

## Quick Reference Links

When using Context7, query these libraries:

| Feature        | Context7 Query                  |
| -------------- | ------------------------------- |
| Authentication | `better-auth`                   |
| Database       | `prisma`                        |
| Routing/Pages  | `next.js` (focus on App Router) |
| Forms          | `react-hook-form`               |
| Validation     | `zod`                           |
| UI Components  | `radix-ui` or `shadcn`          |
| Styling        | `tailwindcss`                   |
| Toasts         | `sonner`                        |

---

## Workflow for Common Tasks

### Adding a New Protected Page

1. Create `app/[route]/page.tsx` as Server Component
2. Add auth check with `auth.api.getSession()`
3. Redirect to `/login` if no session
4. Pass session data to Client Components as needed

### Adding a New API Endpoint

1. Create `app/api/[route]/route.ts`
2. Export `GET`, `POST`, etc. handlers
3. Validate input with zod
4. Check auth if needed
5. Return `NextResponse.json()`

### Adding a New UI Component

1. Check if shadcn/ui has it: `npx shadcn@latest add [component]`
2. If custom, follow existing patterns in `components/ui/`
3. Use `cva` for variants, `cn` for class merging
4. Export from component file with proper TypeScript types

### Modifying the Database

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description`
3. Update affected queries/components
4. Test with `npx prisma studio`

---

_Last updated: December 2025_
