"use client";
import Button from "@/components/shared/Button";
import CheckBox from "@/components/shared/CheckBox";
import Input from "@/components/shared/Input";
import { setMe, setToken } from "@/redux/slices/authSlices";
import { AppDispatch } from "@/redux/store";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { object, string } from "yup";

const flexibleLoginSchema = object({
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

export type FlexibleLoginFormData = {
  email?: string;
  phone?: string;
  password: string;
};

function FlexibleSignInForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [check, setCheck] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [useOTP, setUseOTP] = useState(false);
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
    resolver: yupResolver(flexibleLoginSchema),
    defaultValues: {
      email: getLocalStorage("email") || "",
      password: getLocalStorage("password") || "",
    },
  });

  const emailValue = watch("email");
  const phoneValue = watch("phone");

  const handleMethodSwitch = (method: "email" | "phone") => {
    setLoginMethod(method);
    if (method === "email") {
      setValue("phone", "");
    } else {
      setValue("email", "");
    }
  };

  const onSubmit = async (data: FlexibleLoginFormData) => {
    setLoading(true);
    try {
      if (useOTP) {
        // Send OTP for login
        const otpData =
          loginMethod === "email"
            ? { email: data.email, purpose: "login" }
            : { phone: data.phone, purpose: "login" };

        const response = await axios.post("/apis/auth/send-otp", otpData);
        setOtpToken(response.data.token);
        setShowOTPScreen(true);
        toast.success(response.data.message);
      } else {
        // Password-based login (existing endpoint)
        const loginData =
          loginMethod === "email"
            ? { email: data.email, password: data.password }
            : { phone: data.phone, password: data.password };

        const response = await axios.post("/apis/auth/login", loginData);
        dispatch(setToken(response.data.token));
        dispatch(setMe(response.data.user));

        if (loginMethod === "email") {
          setLocalStorage("email", data.email || "");
        }
        setLocalStorage("password", data.password);

        toast.success("লগইন সফল হয়েছে");
        if (response.data.user.isAdmin) return router.push("/admin");
        router.push("/user");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "কিছু ভুল হয়েছে");
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
      const response = await axios.post("/apis/auth/login-with-otp", {
        otp,
        token: otpToken,
      });

      dispatch(setToken(response.data.token));
      dispatch(setMe(response.data.user));
      toast.success(response.data.message);

      if (response.data.user.isAdmin) return router.push("/admin");
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
        loginMethod === "email"
          ? { email: emailValue, purpose: "login" }
          : { phone: phoneValue, purpose: "login" };

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
          {loginMethod === "email"
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

      {/* Registration prompt */}
      <div className="mb-4 max-w-sm text-center text-2xl font-semibold">
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

      {/* Login Method Toggle */}
      <div className="flex gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => handleMethodSwitch("email")}
          className={`flex-1 rounded-md px-4 py-2 font-medium transition-colors ${
            loginMethod === "email"
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
            loginMethod === "phone"
              ? "bg-white text-primary shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          📱 ফোন দিয়ে
        </button>
      </div>

      {/* Email or Phone Input */}
      {loginMethod === "email" ? (
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

      {/* Password Input (only if not using OTP) */}
      {!useOTP && (
        <Input
          error={errors.password?.message}
          {...register("password")}
          placeholder="পাসওয়ার্ড"
          type="password"
          label="পাসওয়ার্ড"
        />
      )}

      {/* OTP Toggle */}
      <div className="flex items-center gap-2">
        <CheckBox
          checked={useOTP}
          onChange={() => setUseOTP(!useOTP)}
          label="OTP দিয়ে লগইন করুন"
        />
      </div>

      {/* Login Button */}
      <Button
        loading={loading}
        onClick={handleSubmit(onSubmit)}
        className="text-white"
      >
        {useOTP ? "OTP পাঠান" : "লগইন করুন"}
      </Button>

      {/* Forgot Password Link */}
      {!useOTP && (
        <div className="flex items-center justify-center">
          পাসওয়ার্ড ভুলে গেছেন?
          <Button
            onClick={() => router.push("/auth/forget")}
            mode="link"
            className="px-1"
          >
            রিসেট করুন
          </Button>
        </div>
      )}
    </div>
  );
}

export default FlexibleSignInForm;
