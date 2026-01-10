import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useAddBookMutation,
  useUpdateBookMutation,
  useGetClassesQuery,
  useGetBoardsQuery,
} from "@/redux/services/adminServices";
import * as Yup from "yup";
import Input from "@/components/shared/Input";
import { Select } from "@/components/shared/Select";
import Button from "@/components/shared/Button";
import { toast } from "react-toastify";
import Loader from "@/components/shared/Loader";
export const bookSchema = Yup.object({
  name: Yup.string().required("Book name is required"),
  classId: Yup.string().required("Class is required"),
});

interface AddBookProps {
  close: () => void;
  defaultValue?: {
    id: string;
    name: string;
    cover: string;
    classId: string;
  } | null;
}

function AddBook({ close, defaultValue }: AddBookProps) {
  const isEdit = !!defaultValue;
  const [addApi, { isLoading: isAdding }] = useAddBookMutation();
  const [updateApi, { isLoading: isUpdating }] = useUpdateBookMutation();
  const { data: classes, isLoading: clsLoading } = useGetClassesQuery();
  const [cover, setCover] = useState<File | null>(null);
  const { data: boards, isLoading: boardLoading } = useGetBoardsQuery();
  const [theBoard, setTheBoard] = useState<string | undefined>();
  const boardOptions =
    boards?.map((b) => ({ label: b.name, value: b.id })) || [];
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(bookSchema),
    defaultValues: { name: "", classId: "" },
  });

  useEffect(() => {
    if (defaultValue) {
      reset({ name: defaultValue.name, classId: defaultValue.classId });
    }
  }, [defaultValue, reset]);

  const onSubmit = async (values: any) => {
    if (!isEdit && !cover) {
      toast.error("Cover image is required");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("classId", values.classId);
      if (cover) formData.append("cover", cover);

      if (isEdit && defaultValue) {
        await updateApi({ id: defaultValue.id, formData }).unwrap();
      } else {
        await addApi(formData).unwrap();
      }
      close();
    } catch (err: any) {
      toast.error(err?.data?.message);
      console.error(err);
    }
  };

  const classOptions =
    classes
      ?.filter((d) => d.boardId === theBoard)
      .map((cls) => ({ label: cls.name, value: cls.id })) || [];
  if (clsLoading || boardLoading) return <Loader />;
  return (
    <form
      className="flex w-full flex-col items-center justify-center gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="text-xl font-semibold">
        {isEdit ? "Edit Book" : "Add Book"}
      </div>

      <Input
        label="Book Name"
        placeholder="Enter book name"
        {...register("name")}
        error={errors.name?.message}
      />
      <Select
        label="Select Board"
        items={boardOptions}
        placeholder="Select board"
        defaultValue={theBoard}
        setValue={(val) => setTheBoard(val)}
      />
      {theBoard && (
        <Select
          label="Select Class"
          items={classOptions}
          placeholder="Select class"
          defaultValue={watch("classId")}
          setValue={(val) => setValue("classId", val)}
          error={errors.classId?.message}
        />
      )}

      {(cover || defaultValue?.cover) && (
        <img
          src={cover ? URL.createObjectURL(cover) : defaultValue?.cover}
          alt="Cover preview"
          className="h-auto w-[100px] rounded-md object-cover"
        />
      )}
      <Input
        type="file"
        label="Cover Image"
        placeholder="Upload image"
        className="overflow-hidden"
        onChange={(e) => setCover(e.target.files?.[0] || null)}
      />

      <Button
        type="submit"
        loading={isAdding || isUpdating}
        className="btn-wide"
      >
        {isEdit ? "Update" : "Submit"}
      </Button>
    </form>
  );
}

export default AddBook;
