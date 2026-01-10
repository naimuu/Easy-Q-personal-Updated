"use client";
import Loader from "@/components/shared/Loader";
import { useGetUserQuery } from "@/redux/services/authApi";
import { setMe } from "@/redux/slices/authSlices";
import { AppDispatch } from "@/redux/store";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

function DataLoader({ children }: { children: React.ReactNode }) {
  const { isLoading, currentData } = useGetUserQuery();
  const dispatch = useDispatch<AppDispatch>();
  //console.log(data);
  //console.log(currentData);
  useEffect(() => {
    if (currentData) {
      dispatch(setMe(currentData.result));
    }
  }, [dispatch, currentData]);

  if (isLoading) {
    return <Loader />;
  }
  return <div>{children}</div>;
}

export default DataLoader;
