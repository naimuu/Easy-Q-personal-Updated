"use client";
import React from "react";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useRouter } from "next/navigation";
import { useSentResetpassMailMutation } from "@/redux/services/authApi";
import Input from "@/components/shared/Input";
import Button from "@/components/shared/Button";

function ForgetPasswordForm() {
  const [sendResetMail] = useSentResetpassMailMutation();
  const [email, setEmail] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);
  const router = useRouter();

  const handleSendResetMail = async () => {
    setLoading(true);
    console.log(email);
    try {
      await sendResetMail({ email });
      toast.success("Reset Mail sent successfully");
      router.push("/auth/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-w-full flex-col gap-4 rounded-md border bg-white p-6 md:min-w-[450px]">
      <div className="text-2xl font-semibold">Forget Password</div>
      <div className="">{" We'll send you a link to reset your password"}</div>
      <Input
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        label="Email"
      />

      <Button loading={loading} onClick={handleSendResetMail}>
        Send Reset Mail
      </Button>
    </div>
  );
}

export default ForgetPasswordForm;
