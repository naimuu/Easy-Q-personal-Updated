import { PREDEFINED_FEATURES } from "@/utils/features";
import { Package, PackageFeatures } from "@/types/package";

/**
 * Check if a user can access a specific feature
 */
export function canUseFeature(features: PackageFeatures, featureKey: string): boolean {
  return features[featureKey] === true;
}

/**
 * Get all locked features for a user
 */
export function getLockedFeatures(features: PackageFeatures): string[] {
  return PREDEFINED_FEATURES.filter((f) => !canUseFeature(features, f.key)).map((f) => f.key);
}

/**
 * Get all available features for a user
 */
export function getAvailableFeatures(features: PackageFeatures): string[] {
  return PREDEFINED_FEATURES.filter((f) => canUseFeature(features, f.key)).map((f) => f.key);
}

/**
 * Get feature info (name, category) by key
 */
export function getFeatureInfo(featureKey: string) {
  return PREDEFINED_FEATURES.find((f) => f.key === featureKey);
}

/**
 * Find which package has a specific feature
 * Returns the first package (by sortOrder) that has the feature
 */
export function findPackageWithFeature(
  packages: Package[],
  featureKey: string
): Package | null {
  return (
    packages.find((pkg) => {
      const features = pkg.features as PackageFeatures;
      return features[featureKey] === true;
    }) || null
  );
}

/**
 * Get suggested upgrade package
 * Returns the cheapest package that has the feature (after current)
 */
export function suggestUpgradePackage(
  packages: Package[],
  featureKey: string,
  currentPackageSlug?: string
): Package | null {
  // Sort by price ascending (free first, then cheapest)
  const sorted = [...packages]
    .filter((pkg) => {
      const features = pkg.features as PackageFeatures;
      return features[featureKey] === true;
    })
    .sort((a, b) => {
      // Free packages first
      if (a.slug === "free") return -1;
      if (b.slug === "free") return 1;
      // Then by price
      return a.price - b.price;
    });

  // Find first package that's not current
  return sorted.find((pkg) => pkg.slug !== currentPackageSlug) || null;
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(features: PackageFeatures, category: string) {
  return PREDEFINED_FEATURES.filter(
    (f) => f.category === category && features[f.key] === true
  );
}

/**
 * Format feature info for display
 */
export function formatFeatureDisplay(featureKey: string) {
  const info = getFeatureInfo(featureKey);
  return {
    key: featureKey,
    name: info?.name || featureKey,
    category: info?.category || "unknown",
  };
}
