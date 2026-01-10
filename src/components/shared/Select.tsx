"use client";

import { ChevronUpIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

type PropsType = {
  label: string;
  items: { value: string; label: string }[];
  prefixIcon?: React.ReactNode;
  className?: string;
  setValue: (value: string) => void;
  error?: string;
  loading?: boolean;
} & (
  | { placeholder?: string; defaultValue: string }
  | { placeholder: string; defaultValue?: string }
);

export function Select({
  items,
  label,
  defaultValue,
  placeholder,
  prefixIcon,
  className,
  setValue,
  error,
  loading,
}: PropsType) {
  const id = useId();

  const [isOptionSelected, setIsOptionSelected] = useState(false);

  return (
    <div className={cn("space-y-3 w-full", className)}>
      <label
        htmlFor={id}
       className="text-md flex items-center gap-1 font-medium"
      >
        {label}
      </label>

      <div className="relative">
        {prefixIcon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {prefixIcon}
          </div>
        )}

        <select
          id={id}
          value={defaultValue || ""}
          onChange={(e) => {
            setIsOptionSelected(true);
            setValue(e.target.value);
          }}
          className={cn(
            "w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-2 outline-none transition focus:border-primary active:border-primary black:border-black-3 black:bg-black-2 black:focus:border-primary [&>option]:text-black-5 black:[&>option]:text-black-6",
            isOptionSelected && "text-black black:text-white",
            prefixIcon && "pl-11.5",
          )}
        >
          {loading && (
            <option value="" disabled hidden>
              loading....
            </option>
          )}
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}

          {items.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <ChevronUpIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-180" />
      </div>
      {error && <span className="text-red-600">{error}</span>}
    </div>
  );
}
