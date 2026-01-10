"use client";

import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { useUpdateProfileMutation } from "@/redux/services/authApi";
import { RootState } from "@/redux/store";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as yup from "yup";

const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").optional(),
  phone: yup.string().optional(),
});

const ProfilePage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile(data).unwrap();
      toast.success("Profile updated successfully!");
      reset(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    }
  };

  if (!user) return <div>Please login</div>;

  return (
    <div className="mx-auto mt-10 max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-6 text-2xl font-bold">Update Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          {...register("name")}
          error={errors.name?.message}
        />
        {user.email ? (
          <Input
            label="Email"
            type="email"
            {...register("email")}
            error={errors.email?.message}
            disabled
            
          />
        ) : user.phone ? (
          <Input
            label="Phone"
            {...register("phone")}
            error={errors.phone?.message}
            disabled
          
          />
        ) : null}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Loading..." : "Update Profile"}
        </Button>
      </form>
    </div>
  );
};

export default ProfilePage;
