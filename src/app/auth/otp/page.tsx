import AuthLayout from "@/layouts/AuthLayout";
import React from "react";
import OTPForm from "./OTPForm";

function page() {
  return (
    <AuthLayout>
      <OTPForm />
    </AuthLayout>
  );
}

export default page;