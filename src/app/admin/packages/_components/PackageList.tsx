"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import ModalLayout from "@/components/Layouts/ModalLayout";
import { Trash2, Edit2 } from "lucide-react";
import { Package } from "@/types/package";
import {
  useGetPackagesForAdminQuery,
  useDeletePackageMutation,
} from "@/redux/services/adminServices";
import AddPackageForm from "./AddPackageForm";

function PackageList() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const { data: packages = [], isLoading, refetch } = useGetPackagesForAdminQuery();
  const [deletePackage] = useDeletePackageMutation();

  const handleDelete = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) {
      return;
    }

    try {
      await deletePackage(packageId).unwrap();
      toast.success("Package deleted successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete package");
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsOpen(true);
  };

  const handleAddSuccess = () => {
    refetch();
    setIsOpen(false);
    setEditingPackage(null);
    toast.success(editingPackage ? "Package updated!" : "Package created!");
  };

  if (isLoading) return <Loader />;

  return (
    <ModalLayout
    modalSize="4xl"
      modalComponent={
        <AddPackageForm
          close={() => {
            setIsOpen(false);
            setEditingPackage(null);
          }}
          onSuccess={handleAddSuccess}
          defaultValue={editingPackage || undefined}
        />
      }
      onChange={() => {
        setIsOpen(false);
        setEditingPackage(null);
      }}
      isOpen={isOpen}
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-1">
        <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-7 sm:py-5 xl:px-8.5">
          <h3 className="text-title-md2 font-bold text-black">
            Total Packages: {packages.length}
          </h3>
          <Button
            onClick={() => {
              setEditingPackage(null);
              setIsOpen(true);
            }}
            className="w-auto"
          >
            Add New Package
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
              <TableHead className="min-w-[120px] pl-5 sm:pl-6 xl:pl-7.5">
                Name
              </TableHead>
              <TableHead className="min-w-[100px]">Display Name</TableHead>
              <TableHead className="min-w-[100px]">Questions</TableHead>
              <TableHead className="min-w-[80px]">Price</TableHead>
              <TableHead className="min-w-[100px]">Duration</TableHead>
              <TableHead className="min-w-[80px]">Status</TableHead>
              <TableHead className="min-w-[80px]">Features</TableHead>
              <TableHead className="pr-5 text-right sm:pr-6 xl:pr-7.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.length > 0 ? (
              packages.map((pkg: Package) => (
                <TableRow key={pkg.id} className="text-base font-medium">
                  <TableCell className="pl-5 sm:pl-6 xl:pl-7.5">
                    <code className="rounded bg-slate-200 px-2.5 py-1 text-sm font-semibold text-slate-700">
                      {pkg.name}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-gray-700">
                    {pkg.displayName}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {pkg.numberOfQuestions}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {pkg.price} {pkg.currency}
                  </TableCell>
                  <TableCell className="text-gray-700 capitalize">
                    {pkg.duration}
                  </TableCell>
                  <TableCell>
                    <button
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        pkg.isActive
                          ? "bg-green-200 text-green-900 hover:bg-green-300"
                          : "bg-red-200 text-red-900 hover:bg-red-300"
                      }`}
                    >
                      {pkg.isActive ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {Object.keys(pkg.features || {}).length} features
                  </TableCell>
                  <TableCell className="pr-5 text-right sm:pr-6 xl:pr-7.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="rounded-lg bg-blue-100 p-2 text-blue-700 hover:bg-blue-200 transition-colors"
                        title="Edit package"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="rounded-lg bg-red-200 p-2 text-red-900 hover:bg-red-300 transition-colors"
                        title="Delete package"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  <p className="text-bodydark2">No packages found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ModalLayout>
  );
}

export default PackageList;
