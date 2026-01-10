"use client";
import Button from "@/components/shared/Button";
import CheckBox from "@/components/shared/CheckBox";
import Input from "@/components/shared/Input";
import { setMe, setToken } from "@/redux/slices/authSlices";
import { AppDispatch } from "@/redux/store";
import { setLocalStorage } from "@/utils/localStorage";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { object, string } from "yup";

const flexibleRegisterSchema = object({
  name: string().required("নাম প্রয়োজন"),
  email: string().email("সঠিক ইমেইল দিন").optional(),
  phone: string()
    .matches(/^(01[3-9]\d{8})$/, "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)")
    .optional(),
  password: string()
    .required("পাসওয়ার্ড প্রয়োজন")
    .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
}).test(
  "email-or-phone",
  "ইমেইল অথবা ফোন নম্বর একটি অবশ্যই দিতে হবে",
  function (value) {
    return !!(value.email || value.phone);
  },
);

export type FlexibleRegisterType = {
  name: string;
  email?: string;
  phone?: string;
  password: string;
};

function FlexibleSignUpForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [check, setCheck] = useState(false);
  const [registrationMethod, setRegistrationMethod] = useState<
    "email" | "phone"
  >("email");
  const [showOTPScreen, setShowOTPScreen] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(flexibleRegisterSchema),
  });

  const emailValue = watch("email");
  const phoneValue = watch("phone");

  const handleMethodSwitch = (method: "email" | "phone") => {
    setRegistrationMethod(method);
    if (method === "email") {
      setValue("phone", "");
    } else {
      setValue("email", "");
    }
  };

  const onSubmit = async (data: FlexibleRegisterType) => {
    if (!check) return toast.info("শর্তাবলী মেনে নিন");

    setLoading(true);
    try {
      const response = await axios.post("/apis/auth/register-flexible", data);
      setOtpToken(response.data.token);
      setShowOTPScreen(true);
      toast.success(response.data.message);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "কিছু ভুল হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      return toast.error("৬ সংখ্যার OTP দিন");
    }

    setLoading(true);
    try {
      const response = await axios.post("/apis/auth/verify-otp", {
        otp,
        token: otpToken,
      });

      dispatch(setToken(response.data.token));
      dispatch(setMe(response.data.user));
      toast.success(response.data.message);
      setLocalStorage("new", "ok");
      router.push("/user");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP যাচাই ব্যর্থ হয়েছে");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const data =
        registrationMethod === "email"
          ? { email: emailValue, purpose: "register" }
          : { phone: phoneValue, purpose: "register" };

          console.log("Resending OTP with data:", data);

      const response = await axios.post("/apis/auth/send-otp", data);
      setOtpToken(response.data.token);
      toast.success("OTP পুনরায় পাঠানো হয়েছে");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "OTP পাঠাতে ব্যর্থ");
    } finally {
      setLoading(false);
    }
  };

  if (showOTPScreen) {
    return (
      <div className="flex min-w-full flex-col gap-4 rounded-md border bg-white p-6 md:min-w-[450px]">
        {/* Logo */}
        {/* <div className="flex h-[150px] w-[150px] items-center justify-center self-center bg-white">
          <img
            src="/images/logo/EasyQlogo.png"
            alt="Logo"
            className="h-full w-full object-contain"
          />
        </div> */}

        {/* Title */}
        <div className="text-center text-2xl font-semibold">OTP যাচাইকরণ</div>

        <p className="text-center text-gray-600">
          {registrationMethod === "email"
            ? `আপনার ইমেইল ${emailValue} এ OTP পাঠানো হয়েছে`
            : `আপনার ফোন নম্বর ${phoneValue} এ OTP পাঠানো হয়েছে`}
        </p>

        {/* OTP Input */}
        <Input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="৬ সংখ্যার OTP"
          label="OTP কোড"
          maxLength={6}
        />

        {/* Verify Button */}
        <Button
          loading={loading}
          onClick={handleOTPVerification}
          className="text-white"
        >
          যাচাই করুন
        </Button>

        {/* Resend OTP */}
        <div className="flex items-center justify-center">
          OTP পাননি?
          <Button
            onClick={handleResendOTP}
            mode="link"
            className="px-1"
            disabled={loading}
          >
            পুনরায় পাঠান
          </Button>
        </div>

        {/* Back Button */}
        <Button
          onClick={() => setShowOTPScreen(false)}
          mode="outline"
          className="mt-2"
        >
          ফিরে যান
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-w-full flex-col gap-4 rounded-md border bg-white p-6 md:min-w-[450px]">
      {/* Logo */}
      {/* <div className="flex h-[150px] w-[150px] items-center justify-center self-center bg-white">
        <img
          src="/images/logo/EasyQlogo.png"
          alt="Logo"
          className="h-full w-full object-contain"
        />
      </div> */}

      {/* Title */}
      <div className="text-center text-2xl font-semibold">
        নতুন একাউন্ট তৈরি করুন
      </div>

      {/* Registration Method Toggle */}
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => handleMethodSwitch("email")}
          className={`flex-1 rounded-md px-4 py-2 font-medium transition-colors ${
            registrationMethod === "email"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📧 ইমেইল দিয়ে
        </button>
        <button
          type="button"
          onClick={() => handleMethodSwitch("phone")}
          className={`flex-1 rounded-md px-4 py-2 font-medium transition-colors ${
            registrationMethod === "phone"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📱 ফোন দিয়ে
        </button>
      </div>

      {/* Name Input */}
      <Input
        error={errors.name?.message}
        {...register("name")}
        placeholder="আপনার নাম লিখুন"
        label="নাম"
      />

      {/* Email or Phone Input */}
      {registrationMethod === "email" ? (
        <Input
          error={errors.email?.message}
          {...register("email")}
          placeholder="আপনার ই-মেইল লিখুন"
          label="ই-মেইল"
          type="email"
        />
      ) : (
        <Input
          error={errors.phone?.message}
          {...register("phone")}
          placeholder="01XXXXXXXXX"
          label="ফোন নম্বর"
          type="tel"
        />
      )}

      {/* Password Input */}
      <Input
        error={errors.password?.message}
        {...register("password")}
        placeholder="পাসওয়ার্ড দিন"
        type="password"
        label="পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)"
      />

      {/* Terms Checkbox */}
      <div className="flex items-center justify-between">
        <CheckBox
          checked={check}
          onChange={() => setCheck((d) => !d)}
          label="আমি শর্তাবলী এবং নীতিমালা মেনে নিচ্ছি (আবশ্যক)"
        />
      </div>

      {/* Register Button */}
      <Button
        loading={loading}
        onClick={handleSubmit(onSubmit)}
        className="text-white"
      >
        রেজিস্টার করুন
      </Button>

      {/* Login Prompt */}
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

export default FlexibleSignUpForm;
