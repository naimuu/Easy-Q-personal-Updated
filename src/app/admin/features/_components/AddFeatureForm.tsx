"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import { PREDEFINED_FEATURES } from "@/utils/features";
import { useCreateFeatureMutation, useGetFeaturesQuery } from "@/redux/services/adminServices";

interface AddFeatureFormProps {
  close: () => void;
  onSuccess: () => void;
}

function AddFeatureForm({ close, onSuccess }: AddFeatureFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [createFeature] = useCreateFeatureMutation();
  const { data: existingFeatures = [] } = useGetFeaturesQuery();

  console.log("Existing Features:", existingFeatures);

  const existingKeys = existingFeatures.map((f: any) => f.key);

  console.log("Existing Feature Keys:", existingKeys);

  const toggleFeature = (key: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedFeatures.length === 0) {
      toast.error("Select at least one feature");
      return;
    }

    try {
      setIsLoading(true);

      for (const key of selectedFeatures) {
        const feature = PREDEFINED_FEATURES.find((f) => f.key === key);
        if (feature) {
          await createFeature({
            key: feature.key,
            name: feature.name,
            category: feature.category,
            isActive: true,
          }).unwrap();
        }
      }

      toast.success("Features created successfully!");
      onSuccess();
      close();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to create features");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="w-full max-w-6xl rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-6 text-2xl font-bold text-black">Create Features</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-3 block text-sm font-medium text-black">
            Select Features <span className="text-red-600">*</span>
            {selectedFeatures.length > 0 && (
              <span className="ml-2 text-xs text-bodydark2">
                ({selectedFeatures.length} selected)
              </span>
            )}
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PREDEFINED_FEATURES.map((feature) => {
              const isExisting = existingKeys.includes(feature.key);
              console.log("Rendering feature:", feature.key, "Is existing:", isExisting);
              const isSelected = selectedFeatures.includes(feature.key);

              return (
                <button
                  key={feature.key}
                  type="button"
                  onClick={() => !isExisting && toggleFeature(feature.key)}
                  disabled={isExisting}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    isExisting
                      ? "border-gray-300 bg-gray-100 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-primary bg-primary/5"
                      : "border-stroke hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isExisting ? "text-gray-500" : "text-black"}`}>
                        {feature.name}
                        {isExisting && <span className="ml-2 text-xs text-gray-500">(Exists)</span>}
                      </h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                          isExisting ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-700"
                        }`}>
                          {feature.category}
                        </span>
                        <code className={`inline-block rounded px-2 py-1 text-xs font-mono ${
                          isExisting ? "bg-gray-200 text-gray-600" : "bg-gray-100 text-gray-700"
                        }`}>
                          {feature.key}
                        </code>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => !isExisting && toggleFeature(feature.key)}
                      disabled={isExisting}
                      className="mt-1 h-5 w-5 cursor-pointer disabled:opacity-50"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            disabled={selectedFeatures.length === 0}
            className="flex-1 bg-primary text-white disabled:bg-bodydark2"
          >
            Create {selectedFeatures.length > 0 && selectedFeatures.length} Feature
            {selectedFeatures.length !== 1 ? "s" : ""}
          </Button>
            <Button type="button" onClick={close} className="flex-1 bg-gray-200 text-black">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AddFeatureForm;
