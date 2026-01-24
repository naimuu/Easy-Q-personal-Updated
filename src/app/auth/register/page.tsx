import AuthLayout from "@/layouts/AuthLayout";
import React from "react";
import FlexibleSignUpForm from "./FlexibleSignUpForm";

function page() {
  return (
    <AuthLayout>
      <FlexibleSignUpForm />
    </AuthLayout>
  );
}

export default page;
