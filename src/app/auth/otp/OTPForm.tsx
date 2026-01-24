"use client";
import Button from "@/components/shared/Button";
import OtpInput from "@/components/shared/OTPInput";
import { useSendOTPMutation } from "@/redux/services/authApi";
import { setMe, setToken } from "@/redux/slices/authSlices";
import { AppDispatch } from "@/redux/store";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

function OTPForm() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [sendOTP, { isLoading }] = useSendOTPMutation();
  const dispatch = useDispatch<AppDispatch>();

  const onSubmit = async () => {
    if (!otp) return setError("Give 6 digit code");
    try {
      const res = await sendOTP(otp).unwrap();
      dispatch(setToken(res.token));
      dispatch(setMe(res.user));
      toast.success("Register successful");
      router.push("/user");
    } catch (error:any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };
  return (
    <div className="flex min-w-full flex-col gap-4 rounded-md border bg-white p-6 md:min-w-[450px]">
      <div className="text-2xl font-semibold">Your OTP</div>
      <div className="">
        {
          "We have send you a otp to your email. Please verify with in 5 minutes."
        }
      </div>
      <div className="flex justify-center">
        <OtpInput error={error} length={6} onOtpComplete={setOtp} />
      </div>

      <Button loading={isLoading} onClick={onSubmit} className="text-white">
        Verify
      </Button>
    </div>
  );
}

export default OTPForm;