"use client";

import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteFeatureMutation,
  useGetFeaturesQuery,
  useUpdateFeatureMutation,
} from "@/redux/services/adminServices";
import { Feature } from "@/types/feature";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import AddFeatureForm from "./AddFeatureForm";

function FeatureList() {
  const [isOpen, setIsOpen] = useState(false);
  const [newFeatureKeys, setNewFeatureKeys] = useState<string[]>([]);
  const { data: features = [], isLoading, refetch } = useGetFeaturesQuery();
  const [deleteFeature] = useDeleteFeatureMutation();
  const [updateFeature] = useUpdateFeatureMutation();

  // Auto-remove "new" highlight after 5 seconds
  React.useEffect(() => {
    if (newFeatureKeys.length > 0) {
      const timer = setTimeout(() => {
        setNewFeatureKeys([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newFeatureKeys]);

  const handleAddSuccess = (createdKeys?: string[]) => {
    if (createdKeys) {
      setNewFeatureKeys(createdKeys);
    }
    refetch();
    setIsOpen(false);
    toast.success("Features created!");
  };

  const handleDelete = async (featureId: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) {
      return;
    }

    try {
      await deleteFeature(featureId).unwrap();
      toast.success("Feature deleted successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete feature");
    }
  };

  const handleToggleStatus = async (feature: Feature) => {
    try {
      await updateFeature({
        id: feature.id,
        data: { isActive: !feature.isActive },
      }).unwrap();
      toast.success(
        `Feature ${!feature.isActive ? "activated" : "deactivated"}!`,
      );
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update feature");
    }
  };

  const isNewFeature = (featureKey: string) => {
    return newFeatureKeys.includes(featureKey);
  };

  if (isLoading) return <Loader />;

  return (
    <ModalLayout
      modalSize="6xl"
      modalComponent={
        <AddFeatureForm
          close={() => {
            setIsOpen(false);
          }}
          onSuccess={handleAddSuccess}
        />
      }
      onChange={() => {
        setIsOpen(false);
      }}
      isOpen={isOpen}
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-1">
        <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-7 sm:py-5 xl:px-8.5">
          <h3 className="text-title-md2 font-bold text-black">
            Total Features: {features.length}
          </h3>
          <Button onClick={() => setIsOpen(true)} className="w-auto">
            Add New Feature
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
              <TableHead className="min-w-[150px] pl-5 sm:pl-6 xl:pl-7.5">
                Feature Key
              </TableHead>
              <TableHead className="min-w-[150px]">Feature Name</TableHead>
              <TableHead className="min-w-[100px]">Category</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[120px]">Created At</TableHead>
              <TableHead className="pr-5 text-right sm:pr-6 xl:pr-7.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.length > 0 ? (
              features.map((feature) => {
                const isNew = isNewFeature(feature.key);
                return (
                  <TableRow
                    key={feature.id}
                    className={`text-base font-medium transition-all ${
                      isNew
                        ? "animate-pulse bg-green-100"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <TableCell className="pl-5 sm:pl-6 xl:pl-7.5">
                      <code
                        className={`rounded px-2.5 py-1 text-sm font-semibold ${
                          isNew
                            ? "bg-green-200 text-green-900"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {feature.key}
                      </code>
                    </TableCell>
                    <TableCell
                      className={`${
                        isNew
                          ? "font-bold text-black"
                          : "font-medium text-gray-700"
                      }`}
                    >
                      {feature.name}
                      {isNew && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-200 px-2 py-0.5 text-xs font-semibold text-green-900">
                          NEW
                        </span>
                      )}
                    </TableCell>
                    <TableCell
                      className={`${
                        isNew ? "font-medium text-black" : "text-gray-700"
                      }`}
                    >
                      <span className="capitalize">
                        {feature.category || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          feature.isActive
                            ? "bg-green-200 text-green-900"
                            : "bg-red-200 text-red-900"
                        }`}
                      >
                        {feature.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`${
                        isNew ? "font-medium text-black" : "text-gray-700"
                      }`}
                    >
                      {new Date(feature.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="pr-5 text-right sm:pr-6 xl:pr-7.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(feature.id)}
                          className="rounded-lg bg-red-200 p-2 text-red-900 transition-colors hover:bg-red-300"
                          title="Delete feature"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center">
                  <p className="text-bodydark2">No features found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ModalLayout>
  );
}

export default FeatureList;
