# Copilot Instructions for easy-q

## Project Overview

**easy-q** is an educational question management platform built with **Next.js 15** + **React 19** + **MongoDB** (Prisma). It enables users to create, organize, and manage exam question sets hierarchically (Board → Class → Book → Chapter → Lesson → Questions).

### Key Architecture Patterns

- **Frontend**: Next.js App Router (React Server Components + Client Components)
- **Authentication**: JWT tokens (25 days) + Cookies + Redux state management
- **Backend**: Next.js API routes with file-based routing (`src/app/apis/`)
- **Database**: MongoDB with Prisma ORM (Cascade deletes enforced)
- **State Management**: Redux Toolkit + RTK Query (with automatic caching)
- **UI Framework**: Tailwind CSS + Custom DaisyUI extensions
- **Form Handling**: React Hook Form + Yup validation (frontend & backend)

---

## Authentication & Authorization Flow

### Token Management
- **Generation**: `encrypt(userId, isAdmin, date, 30)` creates HS256 JWT valid for 30 days
- **Storage**: Token stored in `HttpOnly` cookies (via `js-cookie`) + Redux state
- **Verification**: Middleware validates tokens on protected routes (`/apis/user/*`, `/apis/admin/*`)
- **Auto-injection**: `baseApi.prepareHeaders()` automatically attaches `Authorization: Bearer {token}` to all API requests

### Protected Routes
- **AuthLayout** (`src/layouts/AuthLayout.tsx`): Wraps auth pages; redirects logged-in users to dashboard
- **DataLoader** (`src/app/DataLoader.tsx`): Auto-fetches user on app load; syncs Redux state
- **Middleware** (`src/middleware.ts`): Stacks `checkAuth` → `checkAdmin` for API route protection

**Key Files**: `src/redux/slices/authSlices.ts`, `src/app/apis/auth/login/route.ts`, `src/utils/JWT.ts`

---

## Redux State Management

### Store Structure
```typescript
RootState = {
  auth: {
    user: User | null,          // Current logged-in user
    token: string | undefined,  // JWT from cookies
  },
  [baseApi.reducerPath]: {      // RTK Query cache
    // All API responses cached here
  }
}
```

### Action Patterns
- **Login**: `dispatch(setToken(token))` + `dispatch(setMe(user))`
- **Logout**: `dispatch(clearUser())` (clears user, token, cookies)
- **API Data**: RTK Query auto-caches; use `useGetUserQuery()`, `useLoginMutation()`, etc.

**Dependency Rule**: Always include all variables used in `useEffect` in dependency array (e.g., `[user, router]` even if `router` rarely changes).

---

## API Route Structure

### File-Based Routing
- **URL** → **File Path** mapping is automatic in Next.js App Router
- `POST /apis/auth/login` → `src/app/apis/auth/login/route.ts` with `export { handler as POST }`
- Each `route.ts` file handles one endpoint; HTTP methods map to exported functions (`GET`, `POST`, `PUT`, `DELETE`)

### Route Handler Pattern
```typescript
const handler = catchAsync(async (req: NextRequest) => {
  // 1. Validate request body with Yup schema
  const data = await schema.validate(await req.json());
  
  // 2. Query database with Prisma
  const result = await prisma.model.findUnique({ where: {...} });
  
  // 3. Return response via successResponse() or throw Error
  return successResponse({ result });
});
export { handler as POST };
```

**Error Handling**: `catchAsync()` wraps handlers to catch errors and return `errorResponse()`; Yup validation errors throw automatically.

**Middleware**: Token extraction happens in `checkAuth` middleware; decoded payload available in headers as `USER` header.

---

## Database Schema

### Hierarchy Model
The schema enforces **Cascade Delete** throughout:
- **Board** (educational board) → **Classes** → **Books** → **Chapters** → **Lessons**
- **Questions** belong to Lesson + Category + optional Context
- **Options** belong to Questions + Category + optional Context/Lesson
- **QuestionSet** is the exam artifact combining Book/Class/Board + Questions

### Key Fields
- All IDs use MongoDB ObjectId with `@db.ObjectId`
- **numberType** enum: `roman | bangla | english | arabic` (for question numbering)
- Timestamps: `createAt`, `date` fields use `@default(now())`
- **Unique constraints**: email (Users), otp (OtpMail)

**Common Patterns**: 
- Relations use `fields: [...]` + `onDelete: Cascade`
- Nullable fields: `field: String?` or `field: Type?`
- Foreign keys use `@db.ObjectId` for MongoDB references

---

## Component & Form Patterns

### Shared Components
Located in `src/components/shared/`:
- **Input**, **TextArea**, **Button**, **Select**, **CheckBox**, **OTPInput**
- **Dialog** (modal wrapper), **Loader** (spinner)
- All use Tailwind + DaisyUI styling

### Form Validation
- **Frontend**: React Hook Form + Yup + `@hookform/resolvers/yup`
- **Backend**: Same Yup schema imported to API route for validation
- **Pattern**: Define schema once (`_validation.ts`), reuse on both client & server

**Example**:
```typescript
// _validation.ts
export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

// SignInForm.tsx (client)
const { register, handleSubmit, formState: { errors } } = useForm({ 
  resolver: yupResolver(loginSchema) 
});

// route.ts (server)
const data = await loginSchema.validate(await req.json());
```

---

## Development Workflow

### Key Commands
```bash
npm run dev           # Start dev server (localhost:3000)
npm run build         # Next.js build
npm run start         # Production server
npm run lint          # ESLint check
npm run migrate       # npx prisma generate + db push (MongoDB sync)
```

### Environment Setup
```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority"
SECRET=<jwt_secret_key>
EMAIL_USER=<sender_email>
EMAIL_PASS=<sender_password>
CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<secret>
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Prisma Workflow
- **Schema updates**: Edit `prisma/schema.prisma`
- **Sync to MongoDB**: `npm run migrate`
- **Generate types**: `npx prisma generate` (auto-included in migrate)
- **View DB**: `npx prisma studio`

---

## Common Patterns & Conventions

### Path Aliases
- Use `@/` prefix for `src/` imports (configured in `tsconfig.json`)
- Example: `import { Button } from "@/components/shared/Button"`

### Error Handling
- Always wrap async API handlers with `catchAsync()`
- Throw `Error("message")` to trigger `errorResponse()`
- Frontend: Use `toast.error()` for user-facing errors

### Styling
- **Tailwind first**: Use utility classes; minimal custom CSS
- **Colors**: Custom palette in `tailwind.config.ts` (primary: #5750F1, green, red, blue, etc.)
- **Typography**: Custom sizes (`heading-1` through `heading-6`, `body-sm`, `body-xs`)
- **Spacing**: Extensive custom spacing scale (4.5, 5.5, 6.5... up to 292.5px)

### Component Naming
- **Client Components**: Add `"use client"` at top
- **Server Components**: Default behavior (no directive needed)
- **API Routes**: Use `route.ts` with exported HTTP method functions
- **Utils**: Functional utilities in `src/utils/`; service-like logic in `src/redux/services/`

---

## File Organization

```
src/
├── app/
│   ├── (root)/              # Public pages
│   ├── admin/               # Admin dashboard routes
│   ├── auth/                # Auth pages (login, register, etc.)
│   ├── user/                # User dashboard routes
│   └── apis/                # Backend API routes (Next.js handlers)
├── components/
│   ├── shared/              # Reusable UI components
│   ├── Layouts/             # Page layout wrappers
│   └── Tables/, Charts/     # Domain-specific components
├── redux/
│   ├── baseApi.ts           # RTK Query setup (auto token injection)
│   ├── store.ts             # Redux store config
│   ├── slices/              # Redux reducers (authSlices, etc.)
│   └── services/            # RTK Query endpoints (authApi, userService, etc.)
├── utils/
│   ├── JWT.ts               # Token encryption/decryption
│   ├── catchAsync.ts        # Error-catching wrapper for handlers
│   ├── serverError.ts       # Response formatting
│   └── localStorage.ts      # Browser storage helpers
├── middleware/
│   ├── checkAuth.ts         # Token validation
│   └── checkAdmin.ts        # Admin role check
└── types/
    ├── apiTypes.ts          # API request/response types
    └── set-state-action-type.ts
```

---

## Testing & Debugging

### Common Issues

**Prisma Generation Errors**:
- Run `npm run migrate` after schema changes
- Ensure `DATABASE_URL` is correct and MongoDB connection is active
- Check `.env` file for proper URL format

**Token Expiration**:
- Tokens last 30 days from creation
- Middleware rejects expired tokens (returns 401)
- Frontend auto-redirects to login on 401

**RTK Query Caching**:
- Queries auto-cache; same request won't re-fetch unless cache invalidated
- Mutations can auto-invalidate cache with tags
- Use `currentData` (cached) vs `data` (fresh fetch) in hooks

### Helpful Debugging
- Check Redux state: Redux DevTools browser extension
- Check token: `Cookies.get("token")` in console
- Check API: Network tab shows `Authorization` header
- Check Prisma: `npx prisma studio` shows live MongoDB data

---

## When Adding New Features

1. **Database Model**: Add to `prisma/schema.prisma`, then `npm run migrate`
2. **API Route**: Create `src/app/apis/{domain}/{action}/route.ts` with handler + Yup validation
3. **Redux Service**: Add endpoint to `src/redux/services/` using RTK Query `builder.mutation/query()`
4. **Frontend Component**: Import hook (`useXxxMutation/Query`), handle loading/error states, dispatch Redux actions
5. **Authentication**: If protected, add token check in middleware or API route
6. **Styling**: Use Tailwind utilities; add custom colors/spacing to `tailwind.config.ts` if needed

---

## Key Dependencies

| Library | Purpose |
|---------|---------|
| `@reduxjs/toolkit` | State management |
| `@prisma/client` | Database ORM |
| `bcryptjs` | Password hashing |
| `jose` | JWT signing/verification |
| `yup` | Schema validation |
| `react-hook-form` | Form state management |
| `cloudinary` | Image uploads |
| `nodemailer` | Email sending |
| `tailwindcss` | Styling |
| `react-toastify` | Toast notifications |

