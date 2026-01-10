"use client";

import { ReactNode } from "react";
import Sidebar from "./_components/Sidebar";
import AdminPrivateLayout from "@/layouts/AdminPrivateLayout";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminPrivateLayout>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="w-full flex-1 px-4 py-6 pt-16 lg:ml-20 lg:px-8 lg:pt-0">
          {children}
        </main>
      </div>
    </AdminPrivateLayout>
  );
}
