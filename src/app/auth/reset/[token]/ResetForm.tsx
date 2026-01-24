"use client";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { useResetPasswordMutation } from "@/redux/services/authApi";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  AiOutlineLoading3Quarters,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";
import { toast } from "react-toastify";

function ResetForm() {
  const { token } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [resetPass, { isLoading }] = useResetPasswordMutation();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleRePasswordVisibility = () => setShowRePassword(!showRePassword);

  const handleResetPassword = async () => {
    if (password !== rePassword) return toast.error("Passwords don't match");
    try {
      await resetPass({ token, password });
      toast.success("Password reset successfully");
      router.push("/auth/login");
    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="flex min-w-full flex-col gap-4 rounded-md border bg-white p-6 md:min-w-[450px]">
      <div className="text-2xl font-semibold">Reset Password</div>
      <div>
        {
          "Give your new password to set it. Please reset password in 5 minutes."
        }
      </div>
      <div className="relative">
        <Input
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New Password"
          RIcon={
            <span
              //   className="absolute right-4 top-1/2 -translate-y-1/2 transform cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-xl text-gray-600" />
              ) : (
                <AiOutlineEye className="text-xl text-gray-600" />
              )}
            </span>
          }
          label="New Password"
          type={showPassword ? "text" : "password"}
        />
      </div>

      <div className="relative">
        <Input
          RIcon={
            <span onClick={toggleRePasswordVisibility}>
              {showRePassword ? (
                <AiOutlineEyeInvisible className="text-xl" />
              ) : (
                <AiOutlineEye className="text-xl" />
              )}
            </span>
          }
          onChange={(e) => setRePassword(e.target.value)}
          placeholder="Give Password Again"
          label="Retype Password"
          type={showRePassword ? "text" : "password"}
        />
      </div>

      <Button loading={isLoading} onClick={handleResetPassword}>
        Reset Password
      </Button>
    </div>
  );
}

export default ResetForm;
