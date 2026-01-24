"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function Topbar() {
  useEffect(() => {
    // Force light mode only
    document.documentElement.classList.remove("dark");
    localStorage.theme = "light";
  }, []);

  return (
    <div className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-gray-200 bg-white/60 px-4 py-2 backdrop-blur-md dark:border-gray-700 dark:bg-black/60">
      <button className="text-gray-800 hover:text-blue-500 focus:outline-none dark:text-gray-100 dark:hover:text-yellow-300">
        {/* Menu Icon */}
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      <div className="flex items-center">
        <Link
          href="/auth/login"
          className="relative inline-block overflow-hidden rounded-full border border-white/70 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-300 px-6 py-2 font-bold text-blue-900 shadow-xl backdrop-blur-md transition duration-200 hover:from-blue-500 hover:via-blue-400 hover:to-blue-300 focus:outline-none dark:from-blue-700 dark:via-blue-600 dark:to-blue-500 dark:text-gray-100"
        >
          <span className="pointer-events-none absolute inset-0 rounded-full bg-white/50 opacity-30 transition"></span>
          <span className="relative z-10 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-blue-700/90 dark:text-blue-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
            Login
          </span>
        </Link>
      </div>
    </div>
  );
}
