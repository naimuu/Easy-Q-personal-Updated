"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";
import { setMe, setToken } from "@/redux/slices/authSlices";
import { InferType, object, string } from "yup";
import Input from "@/components/shared/Input";
import CheckBox from "@/components/shared/CheckBox";
import Button from "@/components/shared/Button";
import { useLoginMutation } from "@/redux/services/authApi";

export const loginSchema = object({
  email: string().required().email(),
  password: string().required().min(6),
});

export type LoginFormData = InferType<typeof loginSchema>;

function SignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [check, setCheck] = useState(false);
  const [loginApi, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: getLocalStorage("email") || "",
      password: getLocalStorage("password") || "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await loginApi(data).unwrap();
      dispatch(setToken(res.token));
      dispatch(setMe(res.user));
      setLocalStorage("email", data.email);
      setLocalStorage("password", data.password);
      toast.success("Login success");
      if (res.user.isAdmin) return router.push("/admin");
      router.push("/user");
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
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

  {/* Registration prompt */}
  <div className="text-2xl font-semibold text-center mb-4 max-w-sm">
    আপনি কি প্রথমবার এসেছেন? <br />
     তাহলে আগে 
    <Button
      onClick={() => router.push("/auth/register")}
      mode="link"
      className="px-1 font-bold text-blue-500 underline"
    >
      একাউন্ট খুলুন... 
    </Button>
    
  </div>

  {/* Sign in instruction */}
  <div className="text-center">
    আপনার একাউন্ট থাকলে <br /> ইমেইল এবং পাসওয়ার্ড দিয়ে সাইন ইন করুন
  </div>

  {/* Email input */}
  <Input
    {...register("email")}
    error={errors.email?.message}
    placeholder="আপনার ইমেইল দিন (Email)"
    label="ই-মেইল"
  />

  {/* Password input */}
  <Input
    {...register("password")}
    placeholder="আপনার পাসওয়ার্ড দিন (Password)"
    error={errors.password?.message}
    type="password"
    label="পাসওয়ার্ড"
  />

  {/* Save checkbox and forget password link */}
  <div className="flex items-center justify-between">
    <CheckBox
      checked={check}
      onChange={() => setCheck((d) => !d)}
      label="সেভ থাকবে।"
    />
    <Button
      onClick={() => router.push("/auth/forget")}
      mode="link"
      className="px-0"
    >
      পাসওয়ার্ড ভুলে গেছেন?
    </Button>
  </div>

  {/* Login button */}
  <Button
    loading={isLoading}
    onClick={handleSubmit(onSubmit)}
    className="text-white"
  >
    লগইন করুন
  </Button>

  {/* Register prompt again */}
  <div className="flex items-center justify-center">
    {"আপনার একাউন্ট নেই?  "}
    <Button
      onClick={() => router.push("/auth/register")}
      mode="link"
      className="px-1"
    >
      একাউন্ট খুলুন...
    </Button>
  </div>
</div>

  );
}

export default SignInForm;
