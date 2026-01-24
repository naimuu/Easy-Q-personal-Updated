"use client";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-purple-900 text-white p-6">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-2xl font-semibold mb-2">Page Not Found</p>
      <p className="text-center max-w-md text-purple-200 mb-6">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-white text-purple-700 font-semibold rounded-full shadow-md hover:bg-purple-100 transition-all duration-300"
      >
        <FaArrowLeft /> Go Back Home
      </Link>
    </div>
  );
}
