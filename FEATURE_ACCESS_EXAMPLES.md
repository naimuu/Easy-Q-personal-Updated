/\*\*

- QUICK REFERENCE: Using Feature Access in Components
- ====================================================
  \*/

// ============================================
// EXAMPLE 1: Simple Feature Check
// ============================================
import { useFeatureAccess } from "@/hooks/use-feature-access";

function MyComponent() {
const { hasFeature, package: pkg } = useFeatureAccess();

if (!hasFeature("dragAndDrop")) {
return <p>Upgrade to unlock drag & drop</p>;
}

return <div>Drag & drop enabled!</div>;
}

// ============================================
// EXAMPLE 2: Show Modal on Locked Feature
// ============================================
import FeatureLockedModal from "@/components/shared/FeatureLockedModal";
import { suggestUpgradePackage } from "@/utils/feature-helpers";

function MyComponent() {
const { hasFeature, package: pkg } = useFeatureAccess();
const [showModal, setShowModal] = useState(false);

const handleDragStart = () => {
if (!hasFeature("dragAndDrop")) {
setShowModal(true);
return;
}
// Do drag logic
};

return (
<>
<button onMouseDown={handleDragStart}>Drag me</button>

      <FeatureLockedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName="Drag and Drop"
        featureKey="draganddrop"
        currentPackage={pkg}
        suggestedUpgradePackage={suggestUpgradePackage(
          [pkg],
          "draganddrop",
          pkg?.slug
        )}
      />
    </>

);
}

// ============================================
// EXAMPLE 3: Helper Functions
// ============================================
import {
canUseFeature,
getLockedFeatures,
findPackageWithFeature
} from "@/utils/feature-helpers";

function MyComponent() {
const { getFeatures } = useFeatureAccess();
const features = getFeatures();

// Check single feature
const canExport = canUseFeature(features, "pdfexport");

// Get all locked features
const locked = getLockedFeatures(features);
console.log("Locked features:", locked);

// Show only available features
return (
<ul>
{["pdfexport", "docsexport", "draganddrop"].map(key => (
canUseFeature(features, key) && (
<li key={key}>{key}</li>
)
))}
</ul>
);
}

// ============================================
// EXAMPLE 4: Disable Component While Locked
// ============================================
import FeatureLockBadge from "@/components/shared/FeatureLockBadge";

function MyComponent() {
const { hasFeature } = useFeatureAccess();
const isLocked = !hasFeature("editandcustomize");

return (
<div>
<div className="relative">
<button disabled={isLocked}>Edit Question</button>
<FeatureLockBadge 
          show={isLocked}
          featureName="Edit and Customize"
        />
</div>
</div>
);
}

// ============================================
// EXAMPLE 5: Parent-Child Feature Passing
// ============================================
// Parent
function ParentComponent() {
const { hasFeature } = useFeatureAccess();
const [modal, setModal] = useState(null);

return (
<ChildComponent
canEdit={hasFeature("editandcustomize")}
onLockedFeature={(name, key) => {
setModal({ name, key });
}}
/>
);
}

// Child
function ChildComponent({ canEdit, onLockedFeature }) {
const handleEdit = () => {
if (!canEdit) {
onLockedFeature("Edit and Customize", "editandcustomize");
return;
}
// Do edit logic
};
}

// ============================================
// EXAMPLE 6: Multiple Features
// ============================================
function MyComponent() {
const { hasFeature } = useFeatureAccess();

const features = {
canEdit: hasFeature("editandcustomize"),
canDrag: hasFeature("draganddrop"),
canAdd: hasFeature("addingquestions"),
canExport: hasFeature("pdfexport"),
};

return (
<div>
<button disabled={!features.canEdit}>Edit</button>
<button disabled={!features.canDrag}>Sort</button>
<button disabled={!features.canAdd}>Add</button>
<button disabled={!features.canExport}>Export</button>
</div>
);
}

// ============================================
// FEATURE KEYS CONSTANT
// ============================================
// Save to src/constants/features.ts

export const FEATURE_KEYS = {
CREATE_QUESTIONS: "creatingquestions",
ADD_QUESTIONS: "addingquestions",
SEARCH: "search",
HIGHLIGHT: "highlight",
FILTER: "filter",
ADD_MARKS: "addingmarks",
EDIT_CUSTOMIZE: "editandcustomize",
DRAG_DROP: "draganddrop",
PREVIEW: "preview",
PDF_EXPORT: "pdfexport",
DOCS_EXPORT: "docsexport",
CLOUD_SYNC: "cloudsync",
} as const;

// Usage:
import { FEATURE_KEYS } from "@/constants/features";
const { hasFeature } = useFeatureAccess();
if (!hasFeature(FEATURE_KEYS.DRAG_DROP)) showModal();

// ============================================
// LOADING & ERROR HANDLING
// ============================================
function MyComponent() {
const {
hasFeature,
isLoading,
error,
package: pkg
} = useFeatureAccess();

if (isLoading) {
return <Loader />;
}

if (error) {
return <p className="text-red-500">Failed to load subscription</p>;
}

if (!pkg) {
return <p>No active subscription</p>;
}

return (
<div>
Currently on: {pkg.displayName}
Drag & Drop: {hasFeature("draganddrop") ? "✓" : "✗"}
</div>
);
}
