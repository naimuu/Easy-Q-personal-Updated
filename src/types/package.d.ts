export interface PackageFeatures {
  [key: string]: boolean;
}

export interface PackageLimits {
  questionSetsPerMonth?: number;
  storageGB?: number;
  collaborators?: number;
  [key: string]: number | undefined;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  displayName: string;
  price: number;
  offerPrice?: number | null;
  currency: string;
  numberOfQuestions: number;
  duration: "monthly" | "yearly" | "lifetime";
  isActive: boolean;
  features: PackageFeatures;
  limits: PackageLimits;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePackageRequest {
  name: string;
  slug: string;
  displayName: string;
  price: number;
  offerPrice?: number | null;
  numberOfQuestions: number;
  currency?: string;
  duration: "monthly" | "yearly" | "lifetime";
  isActive?: boolean;
  features: PackageFeatures;
  limits?: PackageLimits;
  sortOrder?: number;
}

export interface UpdatePackageRequest {
  name?: string;
  slug?: string;
  displayName?: string;
  price?: number;
  offerPrice?: number | null;
  currency?: string;
  numberOfQuestions?: number;
  duration?: "monthly" | "yearly" | "lifetime";
  isActive?: boolean;
  features?: PackageFeatures;
  limits?: PackageLimits;
  sortOrder?: number;
}

export interface PackageResponse {
  result: Package;
  message?: string;
}

export interface PackagesListResponse {
  result: Package[];
}
