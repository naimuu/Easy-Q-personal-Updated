import React from "react";

export default function Loader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex animate-pulse items-center gap-2 text-gray-700">
        <div className="h-4 w-4 animate-bounce rounded-full bg-purple-500"></div>
        <span className="text-sm font-medium">Please wait, loading...</span>
      </div>
    </div>
  );
}
