"use client";
import Loader from "@/components/shared/Loader";
import { clearUser } from "@/redux/slices/authSlices";
import { RootState } from "@/redux/store";
import { setLocalStorage } from "@/utils/localStorage";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function Page() {
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return router.replace("/auth/login");
    }
    setLocalStorage("path", "");
    dispatch(clearUser());
  }, [dispatch, user, router]);
  return <Loader />;
}
