"use client";

import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { FaListOl, FaTrash } from "react-icons/fa";
import { ReactSortable } from "react-sortablejs";
import {
  arabicAlphabet,
  arabicNumbers,
  banglaAlphabet,
  banglaNumbers,
  englishAlphabet,
  englishNumbers,
  romanNumerals,
} from "./alphabet";
import Dropdown from "./Menus";
import { getFormattedNumber, toBanglaNumber, toArabicNumber, getAnyLabel } from "./numberingUtils";
import { useQuestionContext } from "./QuestionContext";

export default function StackFractionView({
  group,
  index,
  lang,
  disabled,
  canDragDrop,
  canAddingMarks,
  onLockedFeature,
  globalRTL,
  isArrangeMode = false,
}: {
  group: any;
  index: number;
  lang: string;
  disabled: boolean;
  canDragDrop: boolean;
  canAddingMarks: boolean;
  globalRTL?: boolean;
  onLockedFeature: (feature: string, featureKey: string) => void;
  isArrangeMode?: boolean;
}) {
  const { updateItemOrder, questionList, setQuestionList, removeGroup } =
    useQuestionContext();

  const [numberType, setNumberType] = useState(group?.numbering || "roman");
  const isRTL = group?.isRTL ?? false;
  const [editingNumber, setEditingNumber] = useState<{
    groupId: string;
    questionId: string;
    numberIndex: number;
  } | null>(null);

  const toggleRTL = () => {
    const updatedList = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, isRTL: !isRTL };
      }
      return d;
    });
    setQuestionList(updatedList);
  };
  const [editValue, setEditValue] = useState("");
  const [answer, setAnswer] = useState(group?.any || "");
  const [anyMode, setAnyMode] = useState(group?.anyMode || (group?.any === "All" ? "all_en" : "custom_en"));
  const [mark, setMark] = useState(group?.mark || "");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) {
      onLockedFeature?.("Edit and Customize", "editandcustomize");
      return;
    }
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    removeGroup(group.id);
  };

  // Answer options
  const answerOptions = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
  ];

  // Regex to match numbers with optional signs (English, Bangla, Arabic digits)
  // Matches: +5, -3, *5, x3, X3, +10, -10, *10, x20, X20, 5, etc.
  const numberRegex = /[+\-*xX]?[\d০-৯٠-٩]+/gi;

  // Helper function to check if string contains digits with optional sign
  const isValidNumber = (str: string) => {
    return /^[+\-*xX]?[\d০-৯٠-٩]+$/i.test(str);
  };

  // Helper function to format number for display (convert *, x, X to ×)
  const formatNumberForDisplay = (num: string) => {
    if (!num) return num;
    // Replace *, x, or X followed by digits with ×
    // Matches: *5, x10, X20, etc.
    return num.replace(/([*xX])([\d০-৯٠-٩])/gi, "×$2");
  };

  // Update group answer and marks in context
  useEffect(() => {
    const updatedList = questionList.map((g: any) =>
      g.id === group.id
        ? { ...g, any: answer, anyMode: anyMode, mark: mark, numbering: numberType }
        : g,
    );
    setQuestionList(updatedList);
  }, [answer, anyMode, mark, numberType]);

  // Delete handler for individual questions
  const handleDelete = (id: string) => {
    setQuestionList(
      questionList.map((g: any) =>
        g.id === group.id
          ? {
            ...g,
            questions: g.questions.filter((q: any) => q.id !== id),
          }
          : g,
      ),
    );
  };

  // Save edited number
  const saveEdit = (
    questionId: string,
    numberIndex: number,
    newValue: string,
  ) => {
    if (!newValue || !isValidNumber(newValue)) {
      setEditingNumber(null);
      setEditValue("");
      return;
    }

    setQuestionList(
      questionList.map((g: any) =>
        g.id === group.id
          ? {
            ...g,
            questions: g.questions.map((q: any) => {
              if (q.id !== questionId) return q;

              // Find all numbers in the entire question (English, Bangla, Arabic)
              const allNumbers = (q.question || "").match(numberRegex) || [];

              // Update the specific number at the given index
              if (numberIndex >= 0 && numberIndex < allNumbers.length) {
                allNumbers[numberIndex] = newValue;
              }

              // Replace numbers back into the original string
              let result = q.question || "";
              let numIdx = 0;
              result = result.replace(numberRegex, () => {
                const replacement = allNumbers[numIdx] || "";
                numIdx++;
                return replacement;
              });

              return { ...q, question: result };
            }),
          }
          : g,
      ),
    );
    setEditingNumber(null);
    setEditValue("");
  };

  // Start editing
  const startEdit = (
    questionId: string,
    numberIndex: number,
    value: string,
  ) => {
    if (disabled) {
      onLockedFeature?.("Edit and Customize", "editandcustomize");
      return;
    }
    setEditingNumber({ groupId: group.id, questionId, numberIndex });
    setEditValue(value);
  };

  // Render text with editable numbers
  const renderText = (text: string, questionId: string, startIndex: number) => {
    if (!text) return null;

    const parts = [];
    let lastIndex = 0;
    let numberIndex = startIndex;

    // Find all numbers in text (English, Bangla, Arabic)
    const regex = new RegExp(numberRegex);
    let match;
    const textCopy = text;

    // Reset regex lastIndex
    regex.lastIndex = 0;

    while ((match = regex.exec(textCopy)) !== null) {
      const numberValue = match[0];
      const matchIndex = match.index;
      const currentNumberIndex = numberIndex;

      // Add text before number
      if (matchIndex > lastIndex) {
        parts.push(
          <span key={`text-${group.id}-${lastIndex}-${matchIndex}`}>
            {text.substring(lastIndex, matchIndex)}
          </span>,
        );
      }

      // Check if this number is being edited (include groupId check)
      const isEditing =
        editingNumber?.groupId === group.id &&
        editingNumber?.questionId === questionId &&
        editingNumber?.numberIndex === currentNumberIndex;

      if (isEditing) {
        // Show input for editing
        parts.push(
          <input
            key={`input-${group.id}-${matchIndex}-${currentNumberIndex}`}
            type="text"
            autoFocus
            value={editValue}
            onChange={(e) => {
              const val = e.target.value;
              if (
                isValidNumber(val) ||
                val === "" ||
                val === "+" ||
                val === "-" ||
                val === "*" ||
                val === "x" ||
                val === "X"
              ) {
                setEditValue(val);
              }
            }}
            onBlur={() => {
              saveEdit(questionId, currentNumberIndex, editValue);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveEdit(questionId, currentNumberIndex, editValue);
              } else if (e.key === "Escape") {
                setEditingNumber(null);
                setEditValue("");
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="inline-block w-24 rounded-lg border-2 border-blue-500 bg-white px-3 py-2 text-center text-lg font-bold shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-800"
            style={{ minWidth: "80px", fontSize: "18px" }}
          />,
        );
      } else {
        // Show number as clickable span
        parts.push(
          <span
            key={`num-${group.id}-${matchIndex}-${currentNumberIndex}`}
            onDoubleClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startEdit(questionId, currentNumberIndex, numberValue);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="inline-block cursor-pointer rounded px-1 transition-colors hover:bg-gray-300 dark:bg-gray-900 dark:hover:bg-gray-700"
            style={{ userSelect: "none" }}
            title="Double-click to edit"
          >
            {formatNumberForDisplay(numberValue)}
          </span>,
        );
      }

      lastIndex = matchIndex + numberValue.length;
      numberIndex++;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${group.id}-${lastIndex}-end`}>
          {text.substring(lastIndex)}
        </span>,
      );
    }

    return parts;
  };

  return (
    <Accordion.Item
      key={group.id}
      value={group.id}
      className="rounded-lg border bg-gray-50 shadow-sm hover:cursor-move"
    >
      <Accordion.Header className="w-full">
        <Accordion.Trigger
          className="flex w-[calc(100%)] items-center justify-between bg-white"
          dir={globalRTL ? "rtl" : "ltr"}
          style={{ direction: globalRTL ? "rtl" : "ltr", textAlign: globalRTL ? "right" : "left" }}
        >
          <div className={`group-header flex flex-1 flex-col items-center justify-between gap-2 rounded-t-lg border-b px-4 py-3 md:flex-row ${globalRTL ? "text-rtl" : ""}`}>
            <h6 className="font-bold">
              <span className="mr-1">
                {lang === "bn"
                  ? `${banglaNumbers[index]}|`
                  : lang === "ar"
                    ? `${arabicNumbers[index]}.`
                    : `${englishNumbers[index]}.`}
              </span>
              {group?.name}
            </h6>

            {/* Summary Display */}
            {(answer || mark) && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                <span className="font-semibold">
                  {getAnyLabel(anyMode, (answer === "All" ? group.questions.length : answer) || 0)}
                </span>
                {mark && (
                  <span className="font-mono dir-ltr">
                    {(() => {
                      const c = answer === "All" ? group.questions.length : parseFloat(answer || "0");
                      const m = parseFloat(mark || "0");
                      const t = c * m;
                      const fmt = (n: number) => {
                        const s = n % 1 === 0 ? n.toString() : n.toFixed(1);
                        if (anyMode.includes("bn") || lang === "bn") return toBanglaNumber(s);
                        if (anyMode.includes("ar") || lang === "ar") return toArabicNumber(s);
                        return s;
                      };
                      return `${fmt(c)} × ${fmt(m)} = ${fmt(t)}`;
                    })()}
                  </span>
                )}
              </div>
            )}
          </div>
          <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content
        className={`p-4 ${isRTL ? "text-rtl" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
        style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}
      >
        <div className="mb-4 flex gap-1 justify-between border-b pb-2">
          <div className="flex gap-1">
            <select
              value={anyMode}
              onChange={(e) => {
                if (disabled) {
                  onLockedFeature?.("Edit and Customize", "editandcustomize");
                  return;
                }
                const mode = e.target.value;
                setAnyMode(mode);

                if (mode.startsWith("all")) {
                  setAnswer("All");
                } else {
                  if (answer === "All") {
                    setAnswer("5");
                  }
                }
              }}
              className="rounded-md border p-2 outline-none w-[120px]"
            >
              <optgroup label="English">
                <option value="all_en">All</option>
                <option value="custom_en">Any</option>
              </optgroup>
              <optgroup label="Bangla">
                <option value="all_bn">সব গুলো</option>
                <option value="custom_bn">যেকোনো ? টি</option>
              </optgroup>
              <optgroup label="Arabic">
                <option value="all_ar">كل</option>
                <option value="custom_ar">أي ?</option>
              </optgroup>
            </select>

            {/* Render input only if Custom mode */}
            {(!anyMode?.startsWith("all")) ? (
              <input
                type="number"
                value={answer === "All" ? "" : answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Count"
                className="w-[60px] rounded-md border p-2 outline-none"
              />
            ) : null}
          </div>

          {/* Marks field - one per category */}
          <input
            type="number"
            value={mark}
            onChange={(e) => {
              if (!canAddingMarks) {
                onLockedFeature?.("Adding Marks", "addingmarks");
                return;
              }
              setMark(e.target.value);
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (!canAddingMarks) {
                onLockedFeature?.("Adding Marks", "addingmarks");
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            disabled={!canAddingMarks}
            placeholder="Mark"
            className="h-8 w-16 rounded-md border border-gray-300 px-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Inline Calculation Preview */}
          {(answer || mark) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
              {mark && (
                <span className="font-mono dir-ltr whitespace-nowrap">
                  {(() => {
                    const c = answer === "All" ? group.questions.length : parseFloat(answer || "0");
                    const m = parseFloat(mark || "0");
                    const t = c * m;
                    let targetLang = "en";
                    if (anyMode?.includes("bn")) targetLang = "bn";
                    if (anyMode?.includes("ar")) targetLang = "ar";

                    const fmt = (n: number) => {
                      const s = n % 1 === 0 ? n.toString() : n.toFixed(1);
                      if (targetLang === "bn") return toBanglaNumber(s);
                      if (targetLang === "ar") return toArabicNumber(s);
                      return s;
                    };
                    return `${fmt(c)} × ${fmt(m)} = ${fmt(t)}`;
                  })()}
                </span>
              )}
            </div>
          )}

          {/* RTL toggle button - moved to right */}
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleRTL();
            }}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border ${isRTL ? "border-blue-500 bg-blue-500 text-white" : "border-gray-300 bg-gray-200 text-gray-600 hover:bg-gray-50"}`}
            title={isRTL ? "Switch to LTR" : "Switch to RTL"}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>
        <ReactSortable
          list={group.questions?.map((q: any) => ({ id: q.id }))}
          setList={(newItems: any[]) => {
            if (canDragDrop) {
              updateItemOrder(group.id, newItems);
            }
          }}
          animation={200}
          group={{ name: "questions", pull: true, put: true }}
          disabled={!isArrangeMode || !canDragDrop || disabled}
          className={`space-y-2 ${group.questions?.length > 4
            ? "max-h-96 overflow-y-auto rounded-md border border-gray-200 p-2"
            : ""
            }`}
          delay={150}
          delayOnTouchOnly={true}
          onStart={() => {
            if (!canDragDrop) {
              onLockedFeature?.("Drag and Drop", "draganddrop");
            }
          }}
        >
          {group.questions.map((doc: any, qIndex: number) => {
            // Try split by new separator first, then fallback to old
            let parts = (doc.question || "").split(";;");
            if (parts.length !== 2) {
              parts = (doc.question || "").split("//");
            }
            const numerator = parts[0] || "";
            const denominator = parts[1]?.trim() || "";
            const numeratorLines = numerator
              .split(/\r?\n/)
              .map((line: any) => line.trim());
            const denominatorLines = denominator
              .split(/\r?\n/)
              .map((line: any) => line.trim());

            // Count numbers in numerator to properly offset denominator indices
            const numeratorNumberCount = (numerator.match(numberRegex) || [])
              .length;


            return (
              <div
                key={`${group.id}-${doc.id}-${qIndex}`}
                className={`group flex items-center justify-between rounded-md bg-white px-3 py-2 shadow-sm border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 ${isArrangeMode && canDragDrop && !disabled ? "cursor-move" : "cursor-default"} ${isRTL ? "text-rtl" : ""}`}
              >
                <div className="flex flex-1 items-center gap-2">
                  <span className="font-bold text-black pl-2">
                    {getFormattedNumber(qIndex, numberType)}
                  </span>
                  <div className="flex flex-1 justify-start">
                    <div className="flex flex-col items-end text-right">
                      {/* Numerator */}
                      <div className="-mt-1 w-full text-right text-black dark:text-white">
                        {numeratorLines.length > 0 ? (
                          (() => {
                            let lineStartIndex = 0;
                            return numeratorLines.map(
                              (line: any, idx: number) => {
                                const lineNumberCount = (
                                  line.match(numberRegex) || []
                                ).length;
                                const result = (
                                  <div
                                    key={`${group.id}-line-${idx}`}
                                    className="min-h-[0.75rem] leading-tight"
                                  >
                                    {line === "[]"
                                      ? ""
                                      : renderText(
                                        line,
                                        doc.id,
                                        lineStartIndex,
                                      )}
                                  </div>
                                );
                                lineStartIndex += lineNumberCount;
                                return result;
                              },
                            );
                          })()
                        ) : (
                          <div className="min-h-[1rem]"></div>
                        )}
                      </div>
                      {/* Fraction Bar */}
                      <div
                        className="-mt-0.5 w-full border-t-2 border-gray-400"
                        style={{ width: "100%", maxWidth: "180px" }}
                      />
                      {/* Denominator */}
                      <div className="min-h-[1rem] w-full text-right text-black dark:text-white">
                        {denominatorLines.length > 0 ? (
                          (() => {
                            let lineStartIndex = numeratorNumberCount;
                            return denominatorLines.map(
                              (line: any, idx: number) => {
                                const lineNumberCount = (
                                  line.match(numberRegex) || []
                                ).length;
                                const result = (
                                  <div
                                    key={`${group.id}-den-line-${idx}`}
                                    className="min-h-[0.75rem] leading-tight"
                                  >
                                    {line === "[]"
                                      ? ""
                                      : renderText(
                                        line,
                                        doc.id,
                                        lineStartIndex,
                                      )}
                                  </div>
                                );
                                lineStartIndex += lineNumberCount;
                                return result;
                              },
                            );
                          })()
                        ) : (
                          <div className="min-h-[1rem]"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ml-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (disabled) {
                        onLockedFeature?.(
                          "Edit and Customize",
                          "editandcustomize",
                        );
                      } else {
                        handleDelete(doc.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-700"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })}
        </ReactSortable>

        <div className="mt-5 flex flex-wrap items-center justify-around gap-4 border-t pt-3">
          <button
            onClick={handleDeleteClick}
            className="text-lg text-red-500 hover:text-red-700"
            title="Delete category"
          >
            <FaTrash />
          </button>
          <Dropdown
            onChange={(value) => {
              if (!disabled) {
                setNumberType(value);
              } else {
                onLockedFeature?.("Edit and Customize", "editandcustomize");
              }
            }}
          >
            <button>
              <FaListOl />
            </button>
          </Dropdown>
        </div>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </Accordion.Content>
    </Accordion.Item >
  );
}
