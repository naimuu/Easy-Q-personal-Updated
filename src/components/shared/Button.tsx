import { cn } from "@/lib/utils";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  Icon?: React.ReactNode;
  mode?: "contained" | "outline" | "dashed" | "link";
  className?: string;
  loading?: boolean;
  disabled?: boolean;
};

function Button({
  children,
  className,
  mode = "contained",
  loading,
  disabled,
  Icon,
  ...props
}: Props) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        "group  relative inline-flex items-center justify-center overflow-hidden rounded-lg px-6 py-2 font-semibold transition-all duration-300 ease-in-out",
        "disabled:bg-gray-5 disabled:cursor-not-allowed",
        mode === "link"
          ? "bg-transparent hover:bg-transparent p-0 shadow-none text-purple-950"
          : mode === "dashed"
            ? "border border-dashed border-purple-600 text-purple-600 hover:bg-purple-100"
            : mode === "outline"
              ? "border border-purple-600 text-purple-600 hover:bg-purple-50"
              : "bg-purple-600 text-white shadow-lg hover:scale-105 hover:bg-purple-700",
        className,
      )}
    >
      {loading && (
        <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
      )}
      {Icon && !loading && <span className="mr-2">{Icon}</span>}
      <span className={loading ? "opacity-70" : ""}>{children}</span>
    </button>
  );
}

export default Button;
