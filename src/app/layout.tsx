import "@/css/satoshi.css";
import "@/css/style.css";
import ReduxProvider from "@/redux/ReduxProvider";
import { setLocalStorage } from "@/utils/localStorage";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Easy Q",
    default: "Easy Q - ক্লিকেই প্রশ্ন তৈরি সফটওয়্যার",
  },
  description:
    "Easy Q - একটি আধুনিক এবং স্মার্ট প্রশ্ন তৈরি সফটওয়্যার। বাংলাদেশের সকল নুরানী ও বেফাক মাদরাসা বোর্ডের প্রশ্ন তৈরি ও মডেল প্রশ্নপত্র তৈরির জন্য উপযোগী। বাংলাদেশে আময়রাই প্রথম।",
};

import { Hind_Siliguri } from "next/font/google";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

export default function RootLayout({ children }: PropsWithChildren) {

  return (
    <html lang="en" className={`light ${hindSiliguri.variable}`} suppressHydrationWarning>
      <body>
        <ReduxProvider>
          <NextTopLoader showSpinner={false} />

          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
