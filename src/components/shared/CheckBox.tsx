import { cn } from "@/lib/utils";
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  className?: string;
  Icon?: React.ReactNode;
};

function CheckBox({ label, className, Icon, ...props }: Props) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 black:text-gray-200">
      <input
        {...props}
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
          className
        )}
      />
      <span>{label}</span>
      {Icon && <span className="ml-1">{Icon}</span>}
    </label>
  );
}

export default CheckBox;
