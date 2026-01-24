# Question Set Usage Tracking

This document explains how question set usage is tracked and limited based on user subscriptions.

## How It Works

### 1. **Automatic Tracking on Creation**

When a user creates a new question set, the `trackQuestionSetUsage()` function is called:

```typescript
// In src/app/apis/user/create-question/route.ts
const usageTracking = await trackQuestionSetUsage(user.id);
```

**What happens:**
- Finds the user's active subscription (not expired, `isActive: true`)
- Gets their package limit (`Package.numberOfQuestions`)
- Reads current `Subscription.usageCount.questionSetsCreated`
- Increments by 1
- Checks if limit is reached
- Throws error if limit exceeded
- Updates the subscription record with new usage count

### 2. **Data Structure**

**Package Model:**
```typescript
Package {
  numberOfQuestions: Int  // e.g., 155 - max sets user can create
  limits: Json           // Reserved for future use
}
```

**Subscription Model:**
```typescript
Subscription {
  usageCount: Json  // e.g., { questionSetsCreated: 5, lastUpdated: "2025-12-08T..." }
}
```

### 3. **API Response**

When a question set is created successfully:

```json
{
  "success": true,
  "result": {
    "questionSet": { ... },
    "usage": {
      "success": true,
      "currentUsage": 5,
      "limit": 155,
      "remaining": 150
    }
  }
}
```

## Usage Tracking Functions

### `trackQuestionSetUsage(userId: string)`

Called when a question set is created. Increments usage.

**Returns:**
```typescript
{
  success: boolean,
  currentUsage: number,      // How many sets created so far
  limit: number,             // Max allowed from package
  remaining: number          // How many left
}
```

**Throws error if:**
- No active subscription found
- Limit reached

### `getUserUsage(userId: string)`

Gets current usage without incrementing.

**Returns:**
```typescript
{
  questionSetsCreated: number,
  limit: number,
  remaining: number,
  percentage: number,        // 0-100
  subscription: Subscription // Full subscription object
}
```

### `resetSubscriptionUsage(subscriptionId: string)`

Resets usage when subscription renews (monthly/yearly).

**Usage:**
```typescript
// When subscription renews
await resetSubscriptionUsage(subscriptionId);
```

## Frontend Integration

### Hook: `useQuota()`

```typescript
const { remaining, limit, percentage, isNearLimit } = useQuota();

// remaining: 150 (how many left)
// limit: 155 (total allowed)
// percentage: 3 (how much used)
// isNearLimit: false (true when >= 80% used)
```

### Component: `QuotaWarning`

Shows warning when user is near their limit (80%+):

```tsx
import QuotaWarning from "@/components/shared/QuotaWarning";

export default function CreateQuestion() {
  return (
    <>
      <QuotaWarning />
      {/* rest of component */}
    </>
  );
}
```

**Example output:**
```
⚠️ Quota Warning
You have created 124 out of 155 question sets (80% used). Only 31 remaining.
[Upgrade]
```

## Error Handling

If user exceeds limit when trying to create a question set:

```json
{
  "success": false,
  "message": "You have reached your question set limit (155). Please upgrade your package."
}
```

Frontend should show this error and prompt user to upgrade.

## Example: Check Before Creating

```typescript
// Frontend
const { hasFeature, questionLimit } = useFeatureAccess();
const { remaining } = useQuota();

if (remaining === 0) {
  toast.error("You've reached your question set limit. Upgrade to continue.");
  return;
}

// Create question set...
```

## Future Enhancements

1. **Daily/Weekly Reset**: Add `resetFrequency` to Package model
2. **Multiple Limits**: Track different metrics (sets, questions, storage)
3. **Billing Cycles**: Reset usage on subscription renewal date
4. **Analytics**: Add dashboard showing usage trends
5. **Proactive Alerts**: Email user when approaching limit

## Database Schema Notes

```prisma
model Subscription {
  // ... other fields
  usageCount Json?  // { questionSetsCreated: 5, lastUpdated: "..." }
}

model Package {
  numberOfQuestions Int   // Limit for this package
  limits Json?          // For future use (per-month limits, etc.)
}
```

**Important:** 
- `usageCount` is stored as flexible JSON to allow multiple metrics
- Reset logic should run on subscription renewal (not implemented yet)
- Free tier should also have a limit (set in Package)
