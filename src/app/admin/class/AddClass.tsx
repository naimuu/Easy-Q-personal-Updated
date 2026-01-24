"use client"
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useAddClassMutation,
  useUpdateClassMutation,
  useGetBoardsQuery,
} from "@/redux/services/adminServices";
import * as Yup from "yup";
import { Select } from "@/components/shared/Select";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";

export const classSchema = Yup.object({
  name: Yup.string().required("Class name is required"),
  boardId: Yup.string().required("Board is required"),
});

interface AddClassProps {
  close: () => void;
  defaultValue?: {
    id: string;
    name: string;
    boardId: string;
  } | null;
}

type ClassFormData = {
  name: string;
  boardId: string;
};

function AddClass({ close, defaultValue }: AddClassProps) {
  const isEdit = !!defaultValue;
  const [addApi, { isLoading: isAdding }] = useAddClassMutation();
  const [updateApi, { isLoading: isUpdating }] = useUpdateClassMutation();
  const { data: boards } = useGetBoardsQuery();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch
  } = useForm<ClassFormData>({
    resolver: yupResolver(classSchema),
    defaultValues: { name: "", boardId: "" },
  });

  useEffect(() => {
    if (defaultValue) {
      reset({ name: defaultValue.name, boardId: defaultValue.boardId });
    }
  }, [defaultValue, reset]);

  const onSubmit = async (values: ClassFormData) => {
    try {
      if (isEdit && defaultValue) {
        await updateApi({ id: defaultValue.id, data: values }).unwrap();
      } else {
        await addApi(values).unwrap();
      }
      close();
    } catch (error) {
      console.error(error);
    }
  };

  const boardOptions = boards?.map((b) => ({ label: b.name, value: b.id })) || [];

  return (
    <form
      className="flex w-full flex-col items-center justify-center gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="text-xl font-semibold">
        {isEdit ? "Edit Class" : "Add Class"}
      </div>

      <Input
        label="Class Name" className="w-full"
        placeholder="Enter class name"
        {...register("name")}
        error={errors.name?.message}
      />

      <Select
        label="Select Board"
        items={boardOptions}
        placeholder="Select board"
        defaultValue={watch("boardId")}
        setValue={(val) => setValue("boardId", val)}
        error={errors.boardId?.message}
      />

      <Button type="submit" loading={isAdding || isUpdating} className="btn-wide">
        {isEdit ? "Update" : "Submit"}
      </Button>
    </form>
  );
}

export default AddClass;