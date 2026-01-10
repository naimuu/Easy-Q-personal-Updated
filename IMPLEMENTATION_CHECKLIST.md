/**
 * FILES CREATED & MODIFIED
 * ========================
 */

// ============================================
// NEW FILES CREATED
// ============================================

1. src/hooks/use-feature-access.ts
   - Core hook for feature access checking
   - Returns: hasFeature(), getFeatures(), getLimits(), package, isFree, isActive
   - Integrates with useGetActiveSubscriptionQuery()

2. src/components/shared/FeatureLockedModal.tsx
   - Reusable modal for locked features
   - Shows feature name, current package, upgrade suggestion
   - Links to /user/subscriptions

3. src/utils/feature-helpers.ts
   - Utility functions for feature management
   - Functions: canUseFeature, getLockedFeatures, findPackageWithFeature, etc.

4. src/components/shared/FeatureLockBadge.tsx
   - Small visual badge showing feature is locked
   - Shows lock icon + "Locked" text

5. FEATURE_ACCESS_IMPLEMENTATION.md
   - Comprehensive implementation documentation
   - Architecture overview
   - Data flow explanation

6. FEATURE_ACCESS_EXAMPLES.md
   - Quick reference with 6+ examples
   - Copy-paste ready code samples
   - Best practices

// ============================================
// FILES MODIFIED
// ============================================

1. src/app/user/create-question/AddQuestion.tsx
   
   Changes:
   - Import useFeatureAccess hook
   - Import FeatureLockedModal component
   - Import suggestUpgradePackage helper
   - Add feature access state management
   - Add canDragDrop, canEdit, canAddQuestions checks
   - Pass features to CategoryList
   - Pass onLockedFeature callback to LineBasedView
   - Add drag-drop feature gating with onStart callback
   - Render FeatureLockedModal

2. src/app/user/create-question/CategoryList.tsx
   
   Changes:
   - Add canAddQuestions prop (default: true)
   - Add onLockedFeature callback prop
   - Check canAddQuestions in addQuestion() method
   - Call onLockedFeature if adding questions is locked

3. src/app/user/create-question/components/LineBasedView.tsx
   
   Changes:
   - Add onLockedFeature prop
   - Update numbering dropdown onChange
   - Check canEdit feature before changing numbering
   - Call onLockedFeature if customize is locked

// ============================================
// IMPORTS ADDED
// ============================================

AddQuestion.tsx:
  import { useFeatureAccess } from "@/hooks/use-feature-access";
  import FeatureLockedModal from "@/components/shared/FeatureLockedModal";
  import { suggestUpgradePackage } from "@/utils/feature-helpers";

LineBasedView.tsx:
  (Added onLockedFeature callback)

CategoryList.tsx:
  (Added feature-related props and checks)

// ============================================
// STATE MANAGEMENT ADDED
// ============================================

AddQuestion component:
  const { hasFeature, package: userPackage, isLoading: featureLoading } = useFeatureAccess();
  
  const [lockedFeatureModal, setLockedFeatureModal] = useState({
    isOpen: false,
    feature: "",
    featureKey: "",
  });
  
  const canDragDrop = hasFeature("draganddrop");
  const canEdit = hasFeature("editandcustomize");
  const canAddQuestions = hasFeature("addingquestions");

// ============================================
// COMPONENT TREE & DATA FLOW
// ============================================

AddQuestion
├─ useFeatureAccess() hook
│  └─ Returns feature access state
├─ Feature Modal State
│  └─ Managed by useState
├─ CategoryList
│  ├─ canAddQuestions={canAddQuestions}
│  └─ onLockedFeature callback
├─ ReactSortable (Groups)
│  ├─ disabled={!editable || !canDragDrop}
│  └─ onStart={showModalIfLocked}
├─ LineBasedView
│  ├─ disabled={!editable || !canEdit}
│  └─ onLockedFeature callback
├─ [Other View Components]
│  └─ (To be updated similarly)
└─ FeatureLockedModal
   ├─ currentPackage
   └─ suggestedUpgradePackage

// ============================================
// TESTING CHECKLIST
// ============================================

Test Cases to verify:

1. Free user tries to drag-drop
   ✓ Should be disabled
   ✓ Clicking should show modal
   ✓ Modal shows upgrade option

2. Free user tries to change numbering
   ✓ Dropdown should be disabled
   ✓ Should show locked modal

3. Free user tries to add questions
   ✓ Should show modal on button click
   ✓ Modal shows appropriate upgrade package

4. Paid user (features enabled)
   ✓ All features should work normally
   ✓ Drag-drop enabled
   ✓ Numbering dropdown enabled
   ✓ Can add questions

5. Modal interaction
   ✓ "Upgrade Now" button links to /user/subscriptions
   ✓ "Close" button closes modal
   ✓ Modal shows current package name
   ✓ Modal shows pricing of upgrade package

6. Loading state
   ✓ While features are loading, should show safe defaults
   ✓ Error state should gracefully degrade

// ============================================
// NEXT IMPLEMENTATION PHASE
// ============================================

Remaining tasks for complete feature gating:

1. Update other view components:
   - WordBaseView
   - TableBasedView
   - ObjectiveBasedView
   - PassageBasedQuestion
   - NoCategoryView

2. Backend validation:
   - Add checkFeatureAccess() to API routes
   - Validate feature access server-side
   - Return 403 if feature not allowed

3. Export features:
   - Gate PDF export button
   - Gate DOCX export button
   - Check features in print/export API routes

4. Limit checking:
   - Implement checkLimitAccess() client-side
   - Track question count
   - Show limit reached modal

5. Cloud sync:
   - Gate auto-save based on cloudsync feature
   - Show sync status for paid users only

6. Polish:
   - Add loading skeleton while checking features
   - Improve modal UX/copy
   - Add analytics/tracking for locked feature attempts

// ============================================
// ENVIRONMENT & CONFIGURATION
// ============================================

No env vars needed - uses existing:
  - Redux store
  - RTK Query
  - Subscription endpoint (/apis/user/subscribe)

Database already has:
  - Package.features (JSON)
  - Subscription model with package relation
  - Feature model for feature definitions
