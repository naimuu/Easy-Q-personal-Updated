"use client";
import { TrashIcon } from "@/assets/icons";
import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";
import { ArrowLeftRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { arabicNumbers, banglaNumbers, englishNumbers } from "./alphabet";
import { useQuestionContext } from "./QuestionContext";
import TextWithFractions from "./TextWithFractions";
import { getFormattedNumber, toBanglaNumber, toArabicNumber, getAnyLabel } from "./numberingUtils";

export default function NoCategoryView({
  group,
  index,
  lang,
  roman,
  groupId,
  deleteItem,
  disabled,
  canAddingMarks = true,
  onLockedFeature,
  globalRTL,
  isArrangeMode = false,
}: {
  group: any;
  index: number;
  lang: string;
  roman?: boolean;
  groupId?: string;
  deleteItem?: (itemId: string, groupId: string) => void;
  disabled: boolean;
  canAddingMarks?: boolean;
  globalRTL?: boolean;
  onLockedFeature?: (feature: string, featureKey: string) => void;
  isArrangeMode?: boolean;
}) {
  const [numberType, setNumberType] = React.useState(
    group?.numbering || "roman",
  );
  const [isEditing, setIsEditing] = useState(false);
  const isRTL = group?.isRTL ?? false;
  const { questionList, setQuestionList, removeGroup } = useQuestionContext();

  const toggleRTL = () => {
    const updatedList = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, isRTL: !isRTL };
      }
      return d;
    });
    setQuestionList(updatedList);
  };
  const [answer, setAnswer] = useState(group?.any || "");
  const [anyMode, setAnyMode] = useState(group?.anyMode || (group?.any === "All" ? "all_en" : "custom_en"));
  const [mark, setMark] = useState(group?.mark || "");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (groupId) {
      deleteItem?.(group.id, groupId);
    } else {
      removeGroup(group.id);
    }
  };

  useEffect(() => {
    if (groupId) {
      const update = questionList.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            questions: g.questions.map((i) =>
              i.id === group.id
                ? { ...i, any: answer, anyMode: anyMode, mark: mark, numbering: numberType }
                : i,
            ),
          };
        }
        return g;
      });
      return setQuestionList(update);
    }

    const updateList = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, any: answer, anyMode: anyMode, mark: mark, numbering: numberType };
      }
      return d;
    });
    setQuestionList(updateList);
  }, [answer, anyMode, mark, numberType]);

  const editQuestion = (text: string, groupId: string) => {
    const updated = questionList.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          name: text,
        };
      }
      return group;
    });
    setQuestionList(updated);
  };

  const deleteQuestion = (groupId: string) => {
    const updated = questionList.filter((group) => group.id !== groupId);
    setQuestionList(updated);
  };

  if (!group) return null;

  return (
    <div
      key={group.id}
      className={`rounded-lg border bg-gray-50 shadow-sm ${isArrangeMode ? "hover:cursor-move" : "cursor-default"}`}
    >
      <div
        className="group-header flex flex-col items-center justify-between gap-2 rounded-t-lg border-b bg-white px-4 py-3 md:flex-row"
        dir={globalRTL ? "rtl" : "ltr"}
        style={{ direction: globalRTL ? "rtl" : "ltr", textAlign: globalRTL ? "right" : "left" }}
      >
        <div className="flex gap-1">
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

          <input
            onChange={(e) => {
              if (!canAddingMarks) {
                onLockedFeature?.("Adding Marks", "addingmarks");
                return;
              }
              setMark(e.target.value);
            }}
            onClick={() => {
              if (!canAddingMarks) {
                onLockedFeature?.("Adding Marks", "addingmarks");
              }
            }}
            value={mark}
            type="number"
            disabled={!canAddingMarks}
            placeholder="Mark"
            className="w-[70px] rounded-md border p-2 outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleRTL();
            }}
            className={`rounded p-1.5 ${isRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            title={isRTL ? "Switch to LTR" : "Switch to RTL"}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        className={`p-4 ${isRTL ? "text-rtl" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
        style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}
      >
        <div
          className={`group flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 hover:cursor-move hover:bg-gray-200`}
        >
          <span
            className="flex w-full items-center gap-2 text-black"
            onDoubleClick={() => {
              if (disabled) {
                onLockedFeature?.("Edit and Customize", "editandcustomize");
              } else {
                setIsEditing(true);
              }
            }}
          >
            <span className="pl-2 text-black">
              {lang === "bn"
                ? `${banglaNumbers[index]}|`
                : lang === "ar"
                  ? `${arabicNumbers[index]}.`
                  : `${englishNumbers[index]}.`}
            </span>

            {isEditing ? (
              <input
                autoFocus
                type="text"
                value={group?.name}
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditing(false);
                }}
                onChange={(e) => editQuestion(e.target.value, group.id)}
                className="w-[90%] border-none bg-transparent focus:bg-white focus:outline-none text-black"
              />
            ) : (
              <span className="inline-block w-[90%] truncate text-black">
                <TextWithFractions text={group?.name} />
              </span>
            )}
          </span>

          <button
            onClick={() => deleteQuestion(group.id)}
            className="hidden text-lg text-red-500 hover:text-red-700 group-hover:block"
          >
            <TrashIcon />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-3">
          <button
            onClick={handleDeleteClick}
          >
            <FaTrash />
          </button>
        </div>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
