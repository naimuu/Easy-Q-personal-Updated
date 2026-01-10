"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import Loader from "@/components/shared/Loader";
import { RootState } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useSelector((s: RootState) => s.auth.user);
  useEffect(() => {
    if (!user?.isAdmin) {
      toast.info("You have no access!");
      router.replace("/");
    }
  }, [user,router]);
  if(!user?.isAdmin){
    return <Loader/>
  }
  return (
    <ThemeProvider defaultTheme="light" attribute="class">
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
