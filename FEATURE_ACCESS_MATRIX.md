# Feature Access Matrix - Current Implementation

## Overview

The system has 10 predefined features that can be gated based on user's subscription package. Currently, only **3 features** are actively gated in the frontend.

---

## All Defined Features

### Editing Features

| Feature Key         | Name (Bangla)               | Status       |
| ------------------- | --------------------------- | ------------ |
| `creatingquestions` | মূল বই থেকে প্রশ্ন তৈরি     | ❌ Not gated |
| `addingquestions`   | প্রশ্ন যোগ করা              | ✅ **GATED** |
| `search`            | প্রশ্ন সার্চ                | ❌ Not gated |
| `highlight`         | হাইলাইট                     | ❌ Not gated |
| `filter`            | ফিল্টার                     | ❌ Not gated |
| `addingmarks`       | মার্কস / নম্বরিং যুক্ত করুন | ❌ Not gated |
| `editandcustomize`  | এডিট ও কাস্টমাইজ            | ✅ **GATED** |
| `draganddrop`       | ড্রাগ এন্ড ড্রপ             | ✅ **GATED** |

### View Features

| Feature Key | Name (Bangla) | Status       |
| ----------- | ------------- | ------------ |
| `preview`   | প্রিভিউ       | ❌ Not gated |

### Export Features

| Feature Key  | Name (Bangla)  | Status       |
| ------------ | -------------- | ------------ |
| `pdfexport`  | PDF/প্রিন্ট    | ❌ Not gated |
| `docsexport` | DOCX এক্সপোর্ট | ❌ Not gated |

### Storage Features

| Feature Key | Name (Bangla) | Status       |
| ----------- | ------------- | ------------ |
| `cloudsync` | ক্লাউড সিঙ্ক  | ❌ Not gated |

---

## Currently Gated Features (3/10)

### 1. **Drag and Drop** (`draganddrop`)

- **Location**: `src/app/user/create-question/AddQuestion.tsx`
- **Check**: `const canDragDrop = hasFeature("draganddrop")`
- **Behavior**:
  - Disables drag-drop functionality when feature is locked
  - Shows FeatureLockedModal when user tries to drag
  - Button disabled: `disabled={!editable || !canDragDrop}`

### 2. **Edit and Customize** (`editandcustomize`)

- **Location**: `src/app/user/create-question/AddQuestion.tsx`
- **Check**: `const canEdit = hasFeature("editandcustomize")`
- **Behavior**:
  - Disables edit/customize buttons when locked
  - Button disabled: `disabled={!editable || !canEdit}`

### 3. **Adding Questions** (`addingquestions`)

- **Location**: `src/app/user/create-question/CategoryList.tsx`
- **Check**: `canAddQuestions?: boolean` (passed as prop)
- **Behavior**:
  - Prevents adding new questions when feature is locked
  - Triggers `onLockedFeature` callback
  - Shows modal with feature lock message

---

## Not Yet Gated Features (7/10)

These features are defined but NOT enforced in the UI:

### 📝 Editing Features

- `creatingquestions` - Creating questions from main book
- `search` - Search functionality
- `highlight` - Highlight functionality
- `filter` - Filter functionality
- `addingmarks` - Adding marks/numbering

### 👁️ View Features

- `preview` - Preview functionality

### 📤 Export Features

- `pdfexport` - PDF/Print export
- `docsexport` - DOCX export

### ☁️ Storage Features

- `cloudsync` - Cloud synchronization

---

## Feature Check Implementation

### Hook: `useFeatureAccess()`

```typescript
const {
  hasFeature, // Function to check if user has feature
  getFeatures, // Get all available features
  package, // Current user's package
  questionLimit, // Question set limit
  isFree, // Is user on free plan
  isActive, // Is subscription active
} = useFeatureAccess();
```

### Usage Pattern

```typescript
// Check single feature
const canDragDrop = hasFeature("draganddrop");

// Use in conditional rendering
{canDragDrop ? <DragDropUI /> : <LockedUI />}

// Use in button disabled state
<button disabled={!canDragDrop}>Drag</button>

// Show modal on locked feature
if (!canDragDrop) {
  setLockedFeatureModal({
    isOpen: true,
    feature: "Drag and Drop",
    featureKey: "draganddrop",
  });
}
```

---

## Components Used for Feature Gating

### 1. **FeatureLockedModal**

- **File**: `src/components/shared/FeatureLockedModal.tsx`
- **Purpose**: Shows modal when user tries to use locked feature
- **Props**: `isOpen`, `onClose`, `featureName`, `featureKey`, `currentPackage`, `suggestedUpgradePackage`

### 2. **FeatureLockBadge**

- **File**: `src/components/shared/FeatureLockBadge.tsx`
- **Purpose**: Visual lock indicator on UI
- **Usage**: `<FeatureLockBadge show={!hasFeature} featureName="Feature Name" />`

### 3. **QuotaWarning**

- **File**: `src/components/shared/QuotaWarning.tsx`
- **Purpose**: Shows warning when user reaches 80% of question set quota

### 4. **QuotaExceededModal**

- **File**: `src/components/shared/QuotaExceededModal.tsx`
- **Purpose**: Shows modal when user reaches maximum question set limit

---

## How to Add Gating for More Features

### Example: Gate "Search and Highlight" Feature

**Step 1**: Check if feature is available

```typescript
const canSearch = hasFeature("search");
const canHighlight = hasFeature("highlight");
const canFilter = hasFeature("filter");
```

**Step 2**: Disable UI when feature is locked

```typescript
<button
  disabled={!canSearch}
  onClick={() => {
    if (!canSearch) {
      setLockedFeatureModal({
        isOpen: true,
        feature: "Search and Highlight",
        { featureKey: "search", enabled: true },
        { featureKey: "highlight", enabled: true },
        { featureKey: "filter", enabled: true },
      });
      return;
    }
    // Perform search
  }}
>
  🔍 Search
</button>
```

**Step 3**: Show modal when feature is accessed

```typescript
<FeatureLockedModal
  isOpen={lockedFeatureModal.isOpen}
  onClose={() => setLockedFeatureModal({...})}
  featureName={lockedFeatureModal.feature}
  featureKey={lockedFeatureModal.featureKey}
  currentPackage={userPackage}
/>
```

---

## Feature Definitions File

**Location**: `src/utils/features.ts`

Contains `PREDEFINED_FEATURES` array with all 10 features. Update this to add new features or modify feature properties.

---

## Backend Enforcement

**Note**: Feature gating is currently enforced only in the **frontend**. For production security, implement backend checks in API routes:

- Add `checkFeatureAccess` middleware to relevant routes
- Verify feature access before allowing operations
- Example: Check `draganddrop` feature before allowing drag-drop API calls

---

## Summary

**Currently Gated**: 3/10 features

- ✅ Drag and Drop
- ✅ Edit and Customize
- ✅ Adding Questions

**Ready to Gate**: 7/10 features

- Search and Highlight
- Adding Marks
- Preview
- PDF Export
- DOCX Export
- Cloud Sync
- Creating Questions

All infrastructure is in place for rapid feature gating implementation!
