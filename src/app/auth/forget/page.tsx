import AuthLayout from "@/layouts/AuthLayout";
import React from "react";
import ForgetPasswordForm from "./ForgetPassword";
function page() {
  return (
    <AuthLayout>
      <ForgetPasswordForm />
    </AuthLayout>
  );
}

export default page;
