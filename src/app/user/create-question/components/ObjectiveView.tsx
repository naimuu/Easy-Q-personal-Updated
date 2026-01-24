import { PlusCircle, CheckCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  romanNumerals,
} from "./alphabet";
import { useRTL } from "@/hooks/use-rtl";
import TextWithFractions from "./TextWithFractions";

type NumberingType = "bangla" | "english" | "arabic" | "roman";

export default function ObjectiveView({
  doc,
  onClick,
  isSelected,
  off,
  onNumberingChange,
  index,
  readOnly,
}: {
  doc: any;
  onClick?: () => void;
  isSelected: boolean;
  off?: boolean;
  onNumberingChange?: (questionNumbering: NumberingType, optionNumbering: NumberingType) => void;
  index: number;
  readOnly?: boolean;
}) {
  const { isRTL } = useRTL();

  return (


    <div
      className={`mb-4 rounded-xl border ${isSelected ? "bg-blue-100 border-blue-200 ring-1 ring-blue-200" : "bg-white border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md"} p-5 transition-all duration-300 ${isRTL ? "text-rtl" : ""}`}
      dir={isRTL ? "rtl" : "ltr"}
      style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}
    >
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className={`flex-1 text-base font-medium text-gray-900 ${isRTL ? "text-right" : "text-left"}`}>
          {/* Render Serial */}
          <span className="mr-2 font-bold text-gray-900">
            {(index !== undefined ? (index + 1) + '.' : '')}
          </span>
          <TextWithFractions text={doc.question} />
        </div>

        {!off && !readOnly && (
          isSelected ? (
            <CheckCircle
              onClick={() => onClick?.()}
              className="cursor-pointer text-blue-500 transition-colors hover:text-red-500 flex-shrink-0"
              size={22}
            />
          ) : (
            <PlusCircle
              onClick={() => onClick?.()}
              className="hover:text-blue-600 text-blue-400 cursor-pointer flex-shrink-0 transition-colors"
              size={22}
            />
          )
        )}
      </div>

      {/* Options */}
      <ul className="flex flex-wrap gap-2 list-none text-gray-800 mt-2">
        {doc.options?.map((opt: any, j: number) => {
          // Force Roman numbering logic explicitly here, overriding state/props for this specific view requirement
          const prefix = romanNumerals[j];

          return (
            <li
              key={j}
              className="group flex items-center gap-3 bg-gray-50 border border-gray-200 shadow-sm rounded-lg px-3 py-2.5 cursor-pointer hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              style={{
                flex: "1 0 calc(50% - 0.5rem)", // Forces 2 columns max (50% each minus half gap)
                minWidth: "max-content", // Ensure text doesn't wrap lines, forces 1 column if too long
                maxWidth: "100%"
              }}
            >
              <span className="flex items-center justify-center w-6 h-6 flex-shrink-0 border border-gray-300 bg-white group-hover:bg-blue-500 group-hover:border-blue-500 rounded-full text-xs font-bold text-gray-500 group-hover:text-white transition-all duration-200 uppercase">
                {prefix}
              </span>
              <span className="text-sm font-medium leading-tight text-gray-900 whitespace-nowrap">
                <TextWithFractions text={opt.name} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}