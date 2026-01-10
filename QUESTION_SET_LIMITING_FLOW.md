/# Question Set Limiting Flow

This document explains the complete flow of how question set limits are enforced in the system.

---

## 1. Overview

```
User Subscription with Package (e.g., 155 question sets allowed)
         ↓
User clicks "Create Question Set"
         ↓
ExamInfo form is submitted
         ↓
API: POST /user/create-question
         ↓
Check limit via trackQuestionSetUsage()
         ↓
Limit exceeded? → ❌ Reject (error message)
Limit not reached? → ✅ Create & increment counter
         ↓
Update Subscription.usageCount
         ↓
Return to UI with usage info
         ↓
QuotaWarning shows remaining quota
```

---

## 2. Data Model

### Package (Database)
```typescript
Package {
  id: string
  name: string
  numberOfQuestions: Int          // ← THE LIMIT (e.g., 155)
  displayName: string
  price: Float
  features: Json                  // Feature flags like "dragAndDrop": true
  limits: Json                    // Reserved for future use
}
```

### Subscription (Database)
```typescript
Subscription {
  id: string
  userId: string
  packageId: string
  package: Package                // Related package with numberOfQuestions
  paymentId: string
  startDate: DateTime
  endDate: DateTime
  isActive: Boolean
  usageCount: Json                // ← TRACKS CURRENT USAGE
                                  // Example: { questionSetsCreated: 5, lastUpdated: "..." }
  createdAt: DateTime
}
```

### Example Data
```json
{
  "subscription": {
    "id": "693519ea2d7330fd199d7839",
    "userId": "68860135a4e502cb45f12e46",
    "packageId": "6930257c45a77088a8139d2a",
    "isActive": true,
    "usageCount": {
      "questionSetsCreated": 5,
      "lastUpdated": "2025-12-08T10:30:00Z"
    },
    "package": {
      "numberOfQuestions": 155,
      "displayName": "নতুন পযাকেজ"
    }
  }
}
```

**In this example:**
- User can create: **155 question sets** (from package)
- User has created: **5 question sets** (from usageCount)
- User can still create: **150 more** (155 - 5)

---

## 3. Complete Flow (Step by Step)

### Step 1: User Navigates to Create Question Set
```tsx
// Location: /user/create-question
// File: src/app/user/create-question/ExamInfo.tsx

User clicks "Create Question Set"
  ↓
ExamInfo component opens with form
  ↓
User fills: Exam name, Duration, Marks, Language, Subject
  ↓
User clicks "Submit"
```

### Step 2: Frontend - ExamInfo Calls API
```typescript
// File: src/app/user/create-question/ExamInfo.tsx

const payload = {
  boardId: data.boardId,
  classId: data.classId,
  bookId: data.bookId,
  instituteId: data.instituteId,
  examName: selectedExam?.label || manualExamName,
  durationHour: hour,
  durationMinute: minute,
  totalMarks: marks,
  type: lang,
  subject: subject,
  className,
};

const res = await createExm(payload as any).unwrap();
// This calls: POST /apis/user/create-question
```

### Step 3: Backend - Validate Limit (BEFORE Creating)
```typescript
// File: src/app/apis/user/create-question/route.ts

const createQuestion = catchAsync(async (req: NextRequest) => {
  const data = await questionSchema.validate(await req.json());
  const { user } = await authenticateUserWithSession(req);
  
  // ⭐ STEP 1: CHECK LIMIT (BEFORE creating anything)
  const usageTracking = await trackQuestionSetUsage(user.id);
  // This function will throw error if limit is exceeded!
  
  // If we reach here, limit is OK, proceed to create
  let exam = await prisma.exams.create({...});
  
  // ⭐ STEP 2: CREATE question set
  const q = await prisma.question_set.create({...});
  
  // ⭐ STEP 3: RETURN result with usage info
  return successResponse({
    questionSet: q,
    usage: usageTracking,  // { success: true, currentUsage: 6, limit: 155, remaining: 149 }
  });
});
```

### Step 4: Limit Checking Logic
```typescript
// File: src/utils/trackSubscriptionUsage.ts

export async function trackQuestionSetUsage(userId: string) {
  // ⭐ STEP 1: Find user's active subscription
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      isActive: true,
      endDate: { gt: new Date() },  // Not expired
    },
    include: { package: true },
  });

  if (!subscription) {
    return null;  // No subscription = no sets allowed
  }

  // ⭐ STEP 2: Get current usage
  const currentUsage = (subscription.usageCount || {}) as Record<string, any>;
  const questionSetsCreated = currentUsage.questionSetsCreated || 0;
  // Example: questionSetsCreated = 5

  // ⭐ STEP 3: Get package limit
  const packageLimit = subscription.package?.numberOfQuestions;
  // Example: packageLimit = 155

  // ⭐ STEP 4: CHECK THE LIMIT
  if (packageLimit && questionSetsCreated >= packageLimit) {
    // User has reached limit!
    throw new Error(
      `You have reached your question set limit (${packageLimit}). Please upgrade your package.`
    );
  }
  // If questionSetsCreated (5) < packageLimit (155) → PASS ✅

  // ⭐ STEP 5: INCREMENT counter
  const updatedUsage = {
    ...currentUsage,
    questionSetsCreated: questionSetsCreated + 1,  // 5 → 6
    lastUpdated: new Date().toISOString(),
  };

  // ⭐ STEP 6: UPDATE database
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { usageCount: updatedUsage },
  });

  // ⭐ STEP 7: RETURN usage info
  return {
    success: true,
    currentUsage: 6,        // Now 6 sets created
    limit: 155,             // Total allowed
    remaining: 149,         // 155 - 6 = 149 left
  };
}
```

### Step 5: Frontend - Handle Response
```typescript
// File: src/app/user/create-question/ExamInfo.tsx

try {
  const res = await createExm(payload as any).unwrap();
  
  // Success! Question set created
  toast.success("Exam created successfully!");
  
  // Extract the ID from response
  const questionSetId = res.questionSet?.id;
  
  // Redirect to editor
  router.push(
    `/user/create-question?page=3&set_id=${questionSetId}&bookId=${bookId}`
  );
  
} catch (err: any) {
  // If limit exceeded, this error is caught here
  toast.error(err?.data?.message);
  // Error message: "You have reached your question set limit (155). Please upgrade your package."
  // ❌ User stays on form, cannot proceed
}
```

### Step 6: Frontend - Display Quota Warning
```typescript
// File: src/components/shared/QuotaWarning.tsx

export default function QuotaWarning() {
  const { remaining, limit, percentage, isNearLimit } = useQuota();
  
  // Hook reads from subscription data
  // remaining = 149
  // limit = 155
  // percentage = 4% (used 6 out of 155)
  
  if (isNearLimit) {  // Shows when >= 80% used
    return (
      <div className="bg-amber-50 border border-amber-300 p-4">
        <h3>Quota Warning</h3>
        <p>You have created <strong>6</strong> out of <strong>155</strong> question sets (4% used).</p>
        <p>Only <strong>149</strong> remaining.</p>
      </div>
    );
  }
  
  return null;  // Hide if under 80%
}
```

---

## 4. API Response Examples

### Success Response (Limit Not Reached)
```json
{
  "success": true,
  "result": {
    "questionSet": {
      "id": "6930257c45a77088a8139d2e",
      "userId": "68860135a4e502cb45f12e46",
      "examName": "Physics Final",
      "bookId": "6930257c45a77088a8139d2a",
      "durationHour": "2",
      "durationMinute": "30",
      "totalMarks": "100",
      "createdAt": "2025-12-08T15:45:00Z"
    },
    "usage": {
      "success": true,
      "currentUsage": 6,
      "limit": 155,
      "remaining": 149
    }
  }
}
```

### Error Response (Limit Exceeded)
```json
{
  "success": false,
  "message": "You have reached your question set limit (155). Please upgrade your package.",
  "statusCode": 400
}
```

---

## 5. Usage Tracking Data Flow

### In Database
```
Subscription Record (MongoDB):
{
  "_id": ObjectId("693519ea2d7330fd199d7839"),
  "userId": "68860135a4e502cb45f12e46",
  "packageId": "6930257c45a77088a8139d2a",
  "usageCount": {
    "questionSetsCreated": 0      ← Starts at 0
  }
}

User creates 1st set → questionSetsCreated = 1
User creates 2nd set → questionSetsCreated = 2
User creates 3rd set → questionSetsCreated = 3
...
User creates 155th set → questionSetsCreated = 155
User tries to create 156th set → ❌ ERROR (limit reached)
```

### In Redis Cache (RTK Query)
```typescript
// useGetActiveSubscriptionQuery() caches this
{
  subscription: {...},
  package: {
    numberOfQuestions: 155
  },
  features: {...},
  isActive: true,
  isFree: false
}

// useQuota() reads from this cache
const usageCount = subscription.usageCount.questionSetsCreated  // 155
const limit = package.numberOfQuestions                          // 155
const remaining = limit - usageCount                             // 0
```

---

## 6. Visualization: State Transitions

```
Package: 155 sets allowed

User creates set #1
Subscription.usageCount.questionSetsCreated: 0 → 1
Remaining: 154

User creates set #2
Subscription.usageCount.questionSetsCreated: 1 → 2
Remaining: 153

...

User creates set #154
Subscription.usageCount.questionSetsCreated: 153 → 154
Remaining: 1

User creates set #155
Subscription.usageCount.questionSetsCreated: 154 → 155
Remaining: 0

User tries to create set #156
Check: 155 >= 155 ? YES
❌ THROW ERROR: "You have reached your question set limit (155)."
Subscription.usageCount.questionSetsCreated: 155 (UNCHANGED)
Remaining: 0
```

---

## 7. Key Components & Functions

| Component/Function | Purpose | Location |
|---|---|---|
| `trackQuestionSetUsage()` | Check limit, increment counter | `src/utils/trackSubscriptionUsage.ts` |
| `getUserUsage()` | Get current usage without changing | `src/utils/trackSubscriptionUsage.ts` |
| `useQuota()` | Frontend hook to display quota | `src/hooks/use-quota.ts` |
| `QuotaWarning` | Component showing warning at 80%+ | `src/components/shared/QuotaWarning.tsx` |
| `useFeatureAccess()` | Includes `questionLimit` from package | `src/hooks/use-feature-access.ts` |
| `createQuestion()` | API route that checks limit first | `src/app/apis/user/create-question/route.ts` |

---

## 8. Error Handling

### When Limit is Exceeded

**Frontend sees:**
```
Toast Error: "You have reached your question set limit (155). Please upgrade your package."
Form stays visible
User cannot proceed
Button to redirect to /user/subscriptions to upgrade
```

**Backend throws:**
```typescript
throw new Error(
  `You have reached your question set limit (${packageLimit}). Please upgrade your package.`
);
```

**catchAsync() catches and returns:**
```json
{
  "success": false,
  "message": "You have reached your question set limit (155). Please upgrade your package.",
  "statusCode": 400
}
```

---

## 9. Subscription Renewal (Future)

When a user's subscription renews (monthly/yearly), the usage counter should reset:

```typescript
export async function resetSubscriptionUsage(subscriptionId: string) {
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      usageCount: {
        questionSetsCreated: 0,
        lastReset: new Date().toISOString(),
      },
    },
  });
}

// Called when: Subscription starts or renews
```

**NOT IMPLEMENTED YET** - Currently, usage persists for the entire subscription duration.

---

## 10. Example User Journey

**User A - Free Package (5 sets)**
```
Subscribes to Free package (5 question sets allowed)
Creates set #1 → usageCount = 1, remaining = 4 ✅
Creates set #2 → usageCount = 2, remaining = 3 ✅
Creates set #3 → usageCount = 3, remaining = 2 ✅
Creates set #4 → usageCount = 4, remaining = 1 ✅
Creates set #5 → usageCount = 5, remaining = 0 ✅
Tries to create set #6 → ❌ ERROR: Limit reached

User upgrades to Premium (155 sets)
Subscription renewed, BUT usageCount NOT reset (current bug)
usageCount = 5, remaining = 150 ✅ (can create 150 more)
```

**User B - Premium Package (155 sets)**
```
Subscribes to Premium package (155 question sets allowed)
Creates sets #1-10 → usageCount = 10, remaining = 145 ✅
Creates sets #11-50 → usageCount = 50, remaining = 105 ✅
QuotaWarning appears (at 80% = 124 sets) → usageCount = 124, remaining = 31 ⚠️
Creates sets #125-155 → usageCount = 155, remaining = 0 ✅
Tries to create set #156 → ❌ ERROR: Limit reached
```

---

## Summary

**Question set limiting works by:**

1. ✅ **On Create**: Call `trackQuestionSetUsage()` BEFORE creating
2. ✅ **Check**: Compare current usage against package limit
3. ✅ **Reject/Accept**: Throw error if limit reached, increment if OK
4. ✅ **Update**: Save new usage count to `Subscription.usageCount`
5. ✅ **Display**: Show quota warning when 80%+ used
6. ✅ **Prevent**: User cannot exceed limit (enforced at API level)

The limit is enforced at the **backend API level**, not just frontend, so users cannot bypass it.
