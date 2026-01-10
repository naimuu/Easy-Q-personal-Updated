/\*\*

- FEATURE ACCESS CONTROL IMPLEMENTATION SUMMARY
- =============================================
-
- This document outlines the complete frontend feature gating system
- integrated into the easy-q create-question module.
  \*/

// ============================================
// 1. CORE HOOK: useFeatureAccess
// ============================================
// Location: src/hooks/use-feature-access.ts
//
// Purpose: Centralized feature access management
// Returns:
// - hasFeature(key): Check if user has access to feature
// - getFeatures(): Get all available features
// - getLimits(): Get all limits
// - package: Current user package
// - isFree: Whether user is on free plan
// - isActive: Whether subscription is active
//
// Usage:
// const { hasFeature, package } = useFeatureAccess();
// if (!hasFeature('dragAndDrop')) showModal();

// ============================================
// 2. FEATURE LOCKED MODAL
// ============================================
// Location: src/components/shared/FeatureLockedModal.tsx
//
// Generic modal shown when user tries locked feature
// Shows:
// - Feature name & lock icon
// - Current package
// - Recommended upgrade package (with pricing)
// - Upgrade link
//
// Usage:
// <FeatureLockedModal
// isOpen={isOpen}
// featureName="Drag and Drop"
// featureKey="draganddrop"
// currentPackage={package}
// suggestedUpgradePackage={upgraded}
// />

// ============================================
// 3. HELPER UTILITIES
// ============================================
// Location: src/utils/feature-helpers.ts
//
// Available functions:
// - canUseFeature(features, key): boolean
// - getLockedFeatures(features): string[]
// - getAvailableFeatures(features): string[]
// - getFeatureInfo(key): FeatureInfo
// - findPackageWithFeature(packages, key): Package
// - suggestUpgradePackage(packages, key, current): Package
// - getFeaturesByCategory(features, category): Feature[]
// - hasReachedLimit(usage, limit): boolean

// ============================================
// 4. FEATURE LOCK BADGE
// ============================================
// Location: src/components/shared/FeatureLockBadge.tsx
//
// Small visual indicator for locked features
// Shows lock icon + "Locked" text
//
// Usage:
// <FeatureLockBadge
// show={!hasFeature('dragAndDrop')}
// featureName="Drag and Drop"
// />

// ============================================
// 5. INTEGRATION IN AddQuestion
// ============================================
//
// Added to AddQuestion component:
//
// a) Feature checks on load:
// const { hasFeature, package } = useFeatureAccess();
// const canDragDrop = hasFeature("draganddrop");
// const canEdit = hasFeature("editandcustomize");
// const canAddQuestions = hasFeature("addingquestions");
//
// b) Modal state management:
// const [lockedFeatureModal, setLockedFeatureModal] = useState({...})
//
// c) Drag-drop gating:
// <ReactSortable disabled={!editable || !canDragDrop} ... />
// onStart={() => {
// if (!canDragDrop) showModal("Drag and Drop");
// }}
//
// d) Pass features to children:
// <CategoryList canAddQuestions={canAddQuestions} ... />
// <LineBasedView disabled={!editable || !canEdit} ... />

// ============================================
// 6. FEATURE GATING IN CategoryList
// ============================================
//
// Props added:
// - canAddQuestions: boolean
// - onLockedFeature: (feature, key) => void
//
// Logic:
// In addQuestion() method:
// if (!canAddQuestions) {
// onLockedFeature("Adding Questions", "addingquestions");
// return;
// }

// ============================================
// 7. FEATURE GATING IN View Components
// ============================================
//
// Example: LineBasedView
//
// Props added:
// - onLockedFeature: (feature, key) => void
//
// Logic:
// - Numbering dropdown checks feature before change
// - If !canEdit, calls onLockedFeature callback
// - Parent decides whether to show modal/toast

// ============================================
// FEATURE KEYS IN SYSTEM
// ============================================
//
// From src/utils/features.ts:
// 1. "creatingquestions" - Create questions from books
// 2. "addingquestions" - Add existing questions to sets
// 3. "search" - Search questions
// 4. "highlight" - Highlight questions
// 5. "filter" - Filter questions
// 4. "addingmarks" - Add marks/numbering
// 5. "editandcustomize" - Edit & customize questions
// 6. "draganddrop" - Drag-drop to reorder
// 7. "preview" - Preview question set
// 8. "pdfexport" - Export to PDF
// 9. "docsexport" - Export to DOCX
// 10. "cloudsync" - Cloud sync functionality

// ============================================
// DATA FLOW
// ============================================
//
// 1. Component mounts
// └─> useFeatureAccess() queries subscription
//
// 2. User attempts action (e.g., drag)
// └─> Check hasFeature()
// ├─> Allowed: Execute action
// └─> Denied: Call onLockedFeature()
//
// 3. onLockedFeature() triggered
// └─> Set modal state
// └─> Show FeatureLockedModal
//
// 4. User sees:
// └─> Feature name + lock icon
// └─> Current package
// └─> Recommended upgrade + pricing
// └─> "Upgrade Now" button
// └─> Links to /user/subscriptions

// ============================================
// NEXT STEPS / TODO
// ============================================
//
// 1. Add backend validation in API routes
// - POST /apis/user/create-question should check feature access
// - Use checkFeatureAccess() middleware
//
// 2. Implement other view components gating
// - WordBaseView
// - TableBasedView
// - ObjectiveBasedView
// - PassageBasedQuestion
// - NoCategoryView
//
// 3. Add limit checking
// - Track questions created
// - Check against limit in package
// - Show "limit reached" modal
//
// 4. Test feature gating
// - Create test packages with different features
// - Verify each feature restriction works
// - Test upgrade flow
//
// 5. UI improvements
// - Add loading state while checking features
// - Disable buttons instead of showing modal
// - Add tooltips on hover for locked features
//
// 6. Export features gating
// - Check "pdfexport" before render print page
// - Check "docsexport" before DOCX export
// - Backend validation on export API routes

// ============================================
// ARCHITECTURE BENEFITS
// ============================================
//
// ✓ Reusable: Same hook/modal/helpers work for all features
// ✓ Scalable: Add new features without refactoring
// ✓ Maintainable: Single source of truth (useFeatureAccess)
// ✓ Type-safe: Full TypeScript support
// ✓ Performant: Memoized, uses RTK Query caching
// ✓ User-friendly: Consistent UI/UX across app
// ✓ Secure: Backend validation required for real protection
