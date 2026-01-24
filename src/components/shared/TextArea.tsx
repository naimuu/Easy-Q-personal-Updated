import { cn } from "@/lib/utils";
import React from "react";
import Button from "./Button";
import Link from "next/link";

type Props = React.InputHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  required?: boolean;
  className?: string;
  error?: string | undefined;
  rows?: number | undefined;
  link?: string | undefined;
};

function TextArea({
  label,
  required,
  className,
  rows,
  error,
  link,
  ...props
}: Props) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Label */}
      {label && (
        <label className="text-md flex items-center gap-1 font-medium">
          {label}
          {required && <span className="text-red-600">*</span>}
          {link && <Link className="text-sm text-blue underline" href={link}>Pattern Style</Link>}
        </label>
      )}

      {/* Input Field */}
      <textarea
        rows={rows}
        className="bordered rounded-md border border-gray-300 bg-transparent px-2 py-1 outline-none"
        {...props}
      />
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}

export default TextArea;
