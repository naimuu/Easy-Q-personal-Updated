"use client";

import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import Loader from "@/components/shared/Loader";
import TextArea from "@/components/shared/TextArea";
import {
  useCreateInstituteMutation,
  useDeleteInstituteMutation,
  useGetInstitutesQuery,
  useUpdateInstituteMutation,
} from "@/redux/services/userService";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";

export default function Institutes() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date-desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editData, setEditData] = useState<any>();

  useEffect(() => {
    const delay = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(delay);
  }, [search]);

  const {
    data: institutes,
    isLoading,
    refetch,
  } = useGetInstitutesQuery({
    search: debouncedSearch,
    sort,
  });

  const [deleteInstitute, { isLoading: deleting }] =
    useDeleteInstituteMutation();

  return (
    <ModalLayout
      modalComponent={
        <InstituteForm
          data={editData}
          close={() => {
            setIsOpen(false);
            refetch();
          }}
        />
      }
      onChange={() => setIsOpen(false)}
      isOpen={isOpen}
    >
      <div className="mx-auto max-w-7xl rounded-xl shadow-sm md:bg-white md:p-6">
        {/* Filters */}
        <div className="flex w-full flex-wrap items-center justify-between gap-4 rounded-lg bg-white px-6 py-4 shadow-sm">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 sm:w-auto">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search"
              className="h-12 w-full rounded-full border border-gray-300 pl-12 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-full border border-gray-300 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="name-asc">A → Z</option>
              <option value="name-desc">Z → A</option>
              <option value="date-desc">Newest</option>
            </select>

            <button
              onClick={() => {
                setEditData(undefined);
                setIsOpen(true);
              }}
              className="h-10 rounded-full bg-green-500 px-5 text-white shadow transition hover:bg-green-600"
            >
              + Add New
            </button>
          </div>
        </div>

        {/* List */}
        {isLoading && <Loader />}

        <div className="grid grid-cols-1 justify-center gap-4 pb-[30px] sm:grid-cols-2 md:grid-cols-3">
          {institutes?.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              No institutes found
            </div>
          )}
          {institutes?.map((institute: any) => (
            <div
              key={institute.id}
              className="flex flex-col overflow-hidden rounded-xl bg-gray-2 shadow-lg"
            >
              {institute.image ? (
                <img
                  src={institute.image}
                  alt={institute.name}
                  className="mx-auto mt-5 size-20 rounded-full bg-white object-cover"
                />
              ) : (
                <div className="mx-auto mt-5 size-20 rounded-full bg-white object-cover" />
              )}

              <div className="flex-1 px-4 pb-5">
                <h3 className="text-md mb-1 text-center font-semibold">
                  {institute.name}
                </h3>
                <p className="mb-1 text-center text-sm text-gray-500">
                  {institute.address}
                </p>
                <p className="mb-4 text-center text-sm text-gray-500">
                  {institute.phone}
                </p>

                <div className="flex items-center justify-center gap-5 text-center">
                  <button
                    disabled={deleting}
                    onClick={() => setDeleteId(institute.id)}
                    className="mt-2 rounded-full bg-red-500 px-4 py-1 text-sm text-white hover:bg-red-600 disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <button
                    disabled={deleting}
                    onClick={() => {
                      setEditData(institute);
                      setIsOpen(true);
                    }}
                    className="mt-2 rounded-full bg-green-500 px-4 py-1 text-sm text-white hover:bg-green-600 disabled:opacity-50"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {institutes?.length === 0 && (
          <div className="h-full w-full bg-white">
            <Image
              src={"/empty.svg"}
              className="h-[300px] w-full"
              width={200}
              height={200}
              alt="empty"
              unoptimized
            />
          </div>
        )}
        {/* 🧾 Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-lg">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">
                Delete Institute
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                All the question associate with this institute will delete.
                Agree?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await deleteInstitute(deleteId!).unwrap();
                      toast.success("Institute deleted successfully!");
                      setDeleteId(null);
                      refetch();
                    } catch (err: any) {
                      toast.error(err?.data?.message || "Failed to delete");
                    }
                  }}
                  className="rounded-md bg-red-500 px-4 py-1.5 text-sm text-white hover:bg-red-600"
                >
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalLayout>
  );
}
const InstituteForm = ({ close, data }: { close: () => void; data: any }) => {
  const [name, setName] = useState(data?.name || "");
  const [phone, setPhone] = useState(data?.phone || "");
  const [image, setImage] = useState<File | null>(null);
  const [address, setAddress] = useState(data?.address || "");

  const [createInstitute, { isLoading }] = useCreateInstituteMutation();
  const [updateInstitute, { isLoading: loading }] =
    useUpdateInstituteMutation();

  useEffect(() => {
    //console.log(data)
    if (data) {
      setName(data?.name);
      setPhone(data?.phone);
      setAddress(data?.address);
    }
  }, [data]);

  const handleSubmit = async () => {
    if (!name || !phone) {
      toast.error("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    image && formData.append("image", image);
    address && formData.append("address", address);

    try {
      if (data) {
        await updateInstitute({ id: data.id, body: formData }).unwrap();
      } else {
        await createInstitute(formData).unwrap();
      }

      toast.success(`Institute ${data ? "updated" : "created"} successfully!`);
      // Clear fields if needed
      setName("");
      setPhone("");
      setImage(null);
      setAddress("");
      close();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create institute");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        error=""
        label="নাম"
        placeholder="প্রতিষ্ঠানের নাম"
        value={name}
        maxLength={80}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        label="ফোন"
        type="tel"
        placeholder="ইনস্টিটিউটের ফোন নম্বর"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      {data?.image && (
        <Image
          src={data?.image}
          alt="any"
          height={400}
          width={400}
          className="h-[130px]"
        />
      )}
      <Input
        type="file"
        label="ছবি (ঐচ্ছিক)"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
      />
      <TextArea
        label="ঠিকানা (ঐচ্ছিক)"
        placeholder="প্রতিষ্ঠানের ঠিকানা"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button loading={isLoading || loading} onClick={handleSubmit}>
        জমা দিন
      </Button>
    </div>
  );
};
