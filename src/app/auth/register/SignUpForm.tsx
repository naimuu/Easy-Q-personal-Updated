"use client";
import Button from "@/components/shared/Button";
import CheckBox from "@/components/shared/CheckBox";
import Input from "@/components/shared/Input";
import { useRegisterMutation } from "@/redux/services/authApi";
import { setMe, setToken } from "@/redux/slices/authSlices";
import { AppDispatch } from "@/redux/store";
import { setLocalStorage } from "@/utils/localStorage";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { InferType, object, string } from "yup";

const registerSchema = object({
  name: string().required(),
  email: string().required(),
  password: string().required().min(6),
});
export type EmailRegisterType = InferType<typeof registerSchema>;
function SignUpForm() {
  const router = useRouter();
  const [registerApi, { isLoading }] = useRegisterMutation();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailRegisterType>({
    resolver: yupResolver(registerSchema),
  });
  const [check, setCheck] = useState(false);

  const onSubmit = async (data: EmailRegisterType) => {
    if (!check) return toast.info("Confirm terms & conditions");
    try {
      const res = await registerApi(data).unwrap();
      dispatch(setToken(res.token));
      dispatch(setMe(res.user));
      toast.success("Register successful");
      setLocalStorage("new", "ok");
      router.push("/user");
    } catch (err: any) {
      toast.error(err?.data?.message || "Something went wrong");
    }
  };

  return (
   <div className="flex min-w-full flex-col gap-4 rounded-md border bg-white p-6 md:min-w-[450px]">
  {/* Centered Logo */}
  <div className="flex justify-center items-center self-center bg-white w-[150px] h-[150px]">
    <img
      src="/images/logo/EasyQlogo.png"
      alt="Logo"
      className="h-full w-full object-contain"
    />
  </div>




  {/* শিরোনাম */}
  <div className="text-2xl font-semibold text-center">নতুন একাউন্ট তৈরি করুন</div>


  {/* নাম ইনপুট */}
  <Input
    error={errors.name?.message}
    {...register("name")}
    placeholder="আপনার নাম লিখুন"
    label="নাম"
  />

  {/* ইমেইল ইনপুট */}
  <Input
    error={errors.email?.message}
    {...register("email")}
    placeholder="আপনার ই-মেইল লিখুন"
    label="ই-মেইল"
  />

  {/* পাসওয়ার্ড ইনপুট */}
  <Input
    error={errors.password?.message}
    {...register("password")}
    placeholder="পাসওয়ার্ড দিন"
    type="password"
    label="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
  />

  {/* শর্তাবলীতে সম্মতি */}
  <div className="flex items-center justify-between">
    <CheckBox
      checked={check}
      onChange={() => setCheck((d) => !d)}
      label="আমি শর্তাবলী এবং নীতিমালা মেনে নিচ্ছি (আবশ্যক)"
    />
  </div>

  {/* রেজিস্টার বাটন */}
  <Button
    loading={isLoading}
    onClick={handleSubmit(onSubmit)}
    className="text-white"
  >
    রেজিস্টার করুন
  </Button>

  {/* লগইন প্রম্পট */}
  <div className="flex items-center justify-center">
    আপনার আগে থেকেই একাউন্ট আছে?
    <Button
      onClick={() => router.push("/auth/login")}
      mode="link"
      className="px-1"
    >
      লগইন করুন
    </Button>
  </div>
</div>
  );
}

export default SignUpForm;
