"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  useAddBoardMutation,
  useUpdateBoardMutation,
} from "@/redux/services/adminServices";
import * as Yup from "yup";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";

export const boardSchema = Yup.object({
  name: Yup.string().required("Board name is required"),
});

interface AddBoardProps {
  close: () => void;
  defaultValue?: {
    id: string;
    name: string;
  } | null;
}

type BoardFormData = {
  name: string;
};

function AddBoard({ close, defaultValue }: AddBoardProps) {
  const isEdit = !!defaultValue;
  const [addApi, { isLoading: isAdding, error: addError }] =
    useAddBoardMutation();
  const [updateApi, { isLoading: isUpdating, error: updateError }] =
    useUpdateBoardMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardFormData>({
    resolver: yupResolver(boardSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (defaultValue) {
      reset({ name: defaultValue.name });
    }
  }, [defaultValue, reset]);

  const onSubmit = async (values: BoardFormData) => {
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

  const errorMsg = (addError || updateError) as any;

  return (
    <form
      className="flex w-full flex-col items-center justify-center gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="text-xl font-semibold">
        {isEdit ? "Edit Board" : "Add Board"}
      </div>

      <Input className="w-full"
        label="Board Name"
        placeholder="Enter board name"
        {...register("name")}
        error={errors.name?.message}
      />

      {errorMsg?.data?.message && (
        <span className="text-red-600">{errorMsg.data.message}</span>
      )}

      <Button
        type="submit"
        loading={isAdding || isUpdating}
        className="w-full"
      >
        {isEdit ? "Update" : "Submit"}
      </Button>
    </form>
  );
}

export default AddBoard;
