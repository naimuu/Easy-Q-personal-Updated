"use client";

import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import baseApi from "@/redux/baseApi";
import { yupResolver } from "@hookform/resolvers/yup";
import { ArrowLeftRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";

const categorySchema = yup.object().shape({
  name: yup.string().required("Category name is required"),
  type: yup.string().required(),
  isRTL: yup.boolean().default(false),
});

type Category = {
  id: string;
  name: string;
  type: string;
  isRTL?: boolean;
};

type FormValues = yup.InferType<typeof categorySchema>;
export const categoryTypeOptions = [
  { label: "Objective", value: "objective" },
  { label: "Single Question", value: "single-question" },
  { label: "Table", value: "table" },
  { label: "Fill in the Gap", value: "fill-gap" },
  { label: "Right/Wrong", value: "right-wrong" },
  { value: "passage-based", label: "Passage Based" },
  { value: "word", label: "Word" },
  { value: "no", label: "No" },
  { value: "stack-fraction", label: "Stack Fraction" },
];

const useCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => ({ url: "/admin/category" }),
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/admin/category",
        method: "POST",
        body: data,
      }),
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/category?id=${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteCategory: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/category?id=${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = useCategoryApi;

export default function CategoryList() {
  const { data: categories = [], refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isRTL, setIsRTL] = useState(false);
  const [isListRTL, setIsListRTL] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(categorySchema),
  });

  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: "", type: "", isRTL: false });
    setIsRTL(false);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setValue("name", category.name);
    setValue("type", category.type);
    setValue("isRTL", !!category.isRTL);
    setIsRTL(!!category.isRTL);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setEditingCategory(null);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, ...data }).unwrap();
        toast.success("Category updated");
      } else {
        await createCategory(data).unwrap();
        toast.success("Category created");
      }
      refetch();
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory({ id }).unwrap();
      toast.success("Category deleted");
      refetch();
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <>
      <div
        className="h-full w-full xl:border-l xl:p-4"
        dir={isListRTL ? "rtl" : "ltr"}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Category List</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={openAddModal}
              className="w-auto p-2"
              aria-label="Add Category"
              title="Add Category"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              onClick={() => setIsListRTL(!isListRTL)}
              className={`p-2 ${isListRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              title={isListRTL ? "Switch to LTR" : "Switch to RTL (Arabic)"}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {categories.length === 0 ? (
          <p>No categories available</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between rounded border p-1"
              >
                <span>{cat.name}</span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => openEditModal(cat)}
                    className="bg-yellow-500 p-2 text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => {
                      const confirmed = window.confirm(
                        "Are you sure you want to delete this category?",
                      );
                      if (confirmed) {
                        handleDelete(cat.id);
                      }
                    }}
                    className="bg-red-500 p-2 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ModalLayout
        isOpen={isModalOpen}
        onChange={closeModal}
        modalComponent={
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h3>
              <Button
                type="button"
                onClick={() => {
                  const newValue = !isRTL;
                  setIsRTL(newValue);
                  setValue("isRTL", newValue);
                }}
                className={`p-2 ${isRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
                title={isRTL ? "Switch to LTR" : "Switch to RTL (Arabic)"}
              >
                <ArrowLeftRight className="h-5 w-5" />
              </Button>
            </div>
            <label className="text-sm font-medium">Category Name</label>
            <div dir={isRTL ? "rtl" : "ltr"}>
              <Input
                {...register("name")}
                placeholder={isRTL ? "أدخل اسم الفئة" : "Enter category name"}
                error={errors.name?.message}
              />
            </div>
            <Select
              items={categoryTypeOptions}
              placeholder="Select type"
              label="Type"
              error={errors.type?.message}
              setValue={(v) => setValue("type", v)}
              defaultValue={watch("type")}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={closeModal}
                className="btn-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={creating || updating}
                className="btn-primary"
              >
                {editingCategory ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        }
      >
        <div />
      </ModalLayout>
    </>
  );
}
