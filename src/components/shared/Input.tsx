import { cn } from "@/lib/utils";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  Icon?: React.ReactNode;
  required?: boolean;
  className?: string;
  error?: string | undefined;
  RIcon?: React.ReactNode;
};

function Input({ label, Icon, required, className, error,RIcon, ...props }: Props) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {/* Label */}
      {label && (
        <label className="text-md flex items-center gap-1 font-medium">
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {/* Input Field */}
      <label className="  flex h-[42px] w-full items-center gap-2 rounded-md border black:border-gray-7   black:bg-black-2 px-3">
        {Icon && <span>{Icon}</span>}
        <input className="flex-1 grow bg-transparent  outline-none" {...props} />
        {RIcon && <span>{RIcon}</span>}
      </label>
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}

export default Input;
