import { Sidebar } from "@/components/Layouts/sidebar";

import { Header } from "@/components/Layouts/header";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";
import AdminPrivateLayout from "@/layouts/AdminPrivateLayout";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <AdminPrivateLayout>
      <Providers>
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="w-full bg-gray-2 ">
            <Header />

            <main className="mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </Providers>
    </AdminPrivateLayout>
  );
}
