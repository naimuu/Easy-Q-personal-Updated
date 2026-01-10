import AuthLayout from "@/layouts/AuthLayout";
import React from "react";
import FlexibleSignInForm from "./FlexibleSignInForm";

function page() {
  return (
    <AuthLayout>
      <FlexibleSignInForm />
    </AuthLayout>
  );
}

export default page;
