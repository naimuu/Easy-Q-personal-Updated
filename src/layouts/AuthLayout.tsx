"use client";
import { RootState } from "@/redux/store";
import authImg from "./logo.svg";
import Image from "next/image";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loader from "@/components/shared/Loader";
import { getLocalStorage } from "@/utils/localStorage";

function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();
  const redirectPath = getLocalStorage("path");
  useEffect(() => {
    if (user?.isAdmin) return router.replace(redirectPath || "/admin");
    if (user) return router.replace(redirectPath || "/user");
  }, [user, router]);
  if (user) return <Loader />;
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center gap-6 p-3 md:p-6">
      <div className="hidden flex-1 items-center justify-center lg:flex">
        <Image unoptimized src="/login.png" height={0} width={400} alt="icon" />
      </div>
      <div className="flex flex-1 items-center justify-center">{children}</div>
    </div>
  );
}

export default AuthLayout;
