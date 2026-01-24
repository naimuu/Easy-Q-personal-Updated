"use client";

import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Loader from "@/components/shared/Loader";
import {
  useCreatePackageMutation,
  useGetFeaturesQuery,
  useUpdatePackageMutation,
} from "@/redux/services/adminServices";
import { Feature } from "@/types/feature.d";
import {
  CreatePackageRequest,
  Package,
  UpdatePackageRequest,
} from "@/types/package";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AddPackageFormProps {
  close: () => void;
  onSuccess: () => void;
  defaultValue?: Package;
}

function AddPackageForm({
  close,
  onSuccess,
  defaultValue,
}: AddPackageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePackageRequest>({
    name: "",
    slug: "",
    numberOfQuestions: 0,
    displayName: "",
    price: 0,
    offerPrice: undefined,
    currency: "BDT",
    duration: "monthly",
    isActive: true,
    features: {},
    limits: {},
    sortOrder: 1,
  });

  const [createPackage] = useCreatePackageMutation();
  const [updatePackage] = useUpdatePackageMutation();
  const { data: allFeatures = [] } = useGetFeaturesQuery();

  // Update form data when defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setFormData({
        name: defaultValue.name,
        slug: defaultValue.slug,
        numberOfQuestions: defaultValue.numberOfQuestions,
        displayName: defaultValue.displayName,
        price: defaultValue.price,
        offerPrice: defaultValue.offerPrice || undefined,
        currency: defaultValue.currency,
        duration: defaultValue.duration,
        isActive: defaultValue.isActive,
        features: defaultValue.features || {},
        limits: defaultValue.limits || {},
        sortOrder: defaultValue.sortOrder,
      });
    } else {
      // Reset form for new package
      setFormData({
        name: "",
        slug: "",
        numberOfQuestions: 0,
        displayName: "",
        price: 0,
        offerPrice: undefined,
        currency: "BDT",
        duration: "monthly",
        isActive: true,
        features: {},
        limits: {},
        sortOrder: 1,
      });
    }
  }, [defaultValue]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
    }));
  };

  const toggleFeature = (featureKey: string) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features[featureKey],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Package name is required");
      return;
    }
    if (!formData.slug.trim()) {
      toast.error("Package slug is required");
      return;
    }
    if (!formData.displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    if (
      formData.price === undefined ||
      formData.price === null ||
      typeof formData.price !== "number" ||
      formData.price < 0
    ) {
      toast.error("Price is required and must be 0 or greater");
      return;
    }
    if (
      formData.offerPrice !== undefined &&
      formData.offerPrice !== null &&
      (typeof formData.offerPrice !== "number" || formData.offerPrice < 0)
    ) {
      toast.error("Offer Price must be a valid number (0 or greater)");
      return;
    }

    try {
      setIsLoading(true);

      // Filter out invalid features that don't exist in allFeatures
      const validFeatureKeys = allFeatures.map((f) => f.key);
      const cleanedFeatures = Object.fromEntries(
        Object.entries(formData.features).filter(([key]) =>
          validFeatureKeys.includes(key),
        ),
      );

      const dataToSubmit = {
        ...formData,
        features: cleanedFeatures,
      };

      if (defaultValue) {
        await updatePackage({
          id: defaultValue.id,
          data: dataToSubmit as UpdatePackageRequest,
        }).unwrap();
      } else {
        await createPackage(dataToSubmit).unwrap();
      }

      onSuccess();
      close();
    } catch (error: any) {
      toast.error(
        error?.data?.message || error?.message || "Failed to save package",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full p-6">
      <h2 className="mb-6 text-2xl font-bold text-black">
        {defaultValue ? "Edit Package" : "Create Package"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Package Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="name"
              label="Package Name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Free, Basic"
              required
            />
            <Input
              name="slug"
              label="Slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="e.g., free, basic"
              required
            />
          </div>

          <Input
            name="displayName"
            label="Display Name"
            value={formData.displayName}
            onChange={handleInputChange}
            placeholder="e.g., Free Plan"
            required
          />

          <Input
            name="numberOfQuestions"
            label="Number of Questions"
            type="number"
            value={formData.numberOfQuestions}
            onChange={handleInputChange}
            placeholder="e.g., 1000"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              name="price"
              label="Price"
              type="number"
              value={formData.price === undefined ? "" : formData.price}
              onChange={handleInputChange}
              placeholder="0"
            />
            <Input
              name="offerPrice"
              label="Offer Price (Optional)"
              type="number"
              value={formData.offerPrice || ""}
              onChange={handleInputChange}
              placeholder="Leave empty for no offer"
              step="0.01"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-black">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full rounded border border-stroke bg-white px-4 py-2"
              >
                <option value="BDT">BDT</option>
                <option value="USD">USD</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-5 w-5 cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-black"
            >
              Active
            </label>
          </div>
        </div>

        {/* Features Selection */}
        <div className="border-t pt-4">
          <label className="mb-3 block text-sm font-medium text-black">
            Select Features
          </label>
          <div className="grid max-h-48 grid-cols-2 gap-3 overflow-y-auto">
            {allFeatures.map((feature: Feature) => (
              <label
                key={feature.key}
                className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.features[feature.key] || false}
                  onChange={() => toggleFeature(feature.key)}
                  className="h-4 w-4 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-black">
                    {feature.name}
                  </div>
                  <code className="text-xs text-gray-500">{feature.key}</code>
                </div>
              </label>
            ))}
          </div>
          {allFeatures.length === 0 && (
            <p className="text-sm text-orange-600">No features available</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <Button type="submit" className="flex-1 bg-primary text-white">
            {defaultValue ? "Update Package" : "Create Package"}
          </Button>
          <Button
            type="button"
            onClick={close}
            className="bg-bodydark2 flex-1 text-black"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddPackageForm;
