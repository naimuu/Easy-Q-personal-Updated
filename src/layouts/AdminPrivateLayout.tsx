"use client";
import React, { ReactNode, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getLocalStorage, setLocalStorage } from "@/utils/localStorage";

interface PrivateLayoutProps {
  children: ReactNode;
}

const AdminPrivateLayout: React.FC<PrivateLayoutProps> = ({ children }) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!user) {
      const fullPath = `${pathname}?${searchParams.toString()}`;
      setLocalStorage("path", fullPath);
    }
  }, [pathname, searchParams, user]);

  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
    } else {
      const redirectPath = getLocalStorage("path");

      if (user.isAdmin && pathname.startsWith("/admin")) {
        return; // Allow admin to stay on admin routes
      }

      if (!user.isAdmin && pathname.startsWith("/user")) {
        return; // Allow user to stay on user routes
      }

      // Redirect based on role
      if (user.isAdmin) {
        router.replace(redirectPath || "/admin");
      } else {
        router.replace(redirectPath || "/user");
      }
    }
  }, [user, router]);

  if (!user) return null; // Prevent flash before redirect

  return <>{children}</>;
};

export default AdminPrivateLayout;
