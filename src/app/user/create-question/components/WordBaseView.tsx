"use client";
import { TrashIcon } from "@/assets/icons";
import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { ReactSortable } from "react-sortablejs";
import {
  arabicAlphabet,
  arabicNumbers,
  banglaAlphabet,
  banglaNumbers,
  englishAlphabet,
  englishNumbers,
} from "./alphabet";
import { toBanglaNumber, toArabicNumber, getAnyLabel } from "./numberingUtils";
import { useQuestionContext } from "./QuestionContext";
import TextWithFractions from "./TextWithFractions";

export const iconComponents: Record<string, React.ComponentType> = {
  trash: FaTrash,
  // listol: FaListOl,
};

export default function WordBaseView({
  group,
  index,
  lang,
  roman,
  groupId,
  editPassageQuestion,
  deletePassageQuestion,
  deleteItem,
  disabled,
  canAddingMarks = true,
  parentRTL,
  onLockedFeature,
  globalRTL,
  isArrangeMode = false,
}: {
  group: any;
  index: number;
  lang: string;
  roman?: boolean;
  groupId?: string;
  parentRTL?: boolean;
  editPassageQuestion?: (
    text: string,
    table: string,
    itemId: string,
    questionId: string,
    groupId: string,
  ) => void;
  deletePassageQuestion?: (
    groupId: string,
    itemId: string,
    questionId: string,
  ) => void;
  deleteItem?: (itemId: string, groupId: string) => void;
  disabled: boolean;
  canAddingMarks?: boolean;
  globalRTL?: boolean;
  onLockedFeature?: (feature: string, featureKey: string) => void;
  isArrangeMode?: boolean;
}) {
  const { updateItemOrder } = useQuestionContext();
  const [answer, setAnswer] = useState(group?.any || "");
  const [anyMode, setAnyMode] = useState(group?.anyMode || (group?.any === "All" ? "all_en" : "custom_en"));
  const [mark, setMark] = useState(group?.mark || "");
  const [localEditingId, setLocalEditingId] = useState<string | null>(null); // ✅ added
  const { questionList, setQuestionList, removeGroup, updateOptionOrder } =
    useQuestionContext();
  const isRTL = group?.isRTL ?? parentRTL ?? false;

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

  const toggleRTL = () => {
    if (groupId) {
      const update = questionList.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            questions: g.questions.map((i) => {
              if (i.id === group.id) {
                return { ...i, isRTL: !isRTL };
              }
              return i;
            }),
          };
        }
        return g;
      });
      return setQuestionList(update);
    }
    const updateList = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, isRTL: !isRTL };
      }
      return d;
    });
    setQuestionList(updateList);
  };

  useEffect(() => {
    if (groupId) {
      const update = questionList.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            questions: g.questions.map((i) => {
              if (i.id === group.id) {
                return { ...i, any: answer, anyMode: anyMode, mark: mark };
              }
              return i;
            }),
          };
        }
        return g;
      });
      return setQuestionList(update);
    }
    const updateList = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, any: answer, anyMode: anyMode, mark: mark };
      }
      return d;
    });
    setQuestionList(updateList);
  }, [answer, anyMode, mark]);

  const editQuestion = (text: string, groupId: string, questionId: string) => {
    const updated = questionList.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          questions: group.questions.map((q) =>
            q.id === questionId ? { ...q, question: text } : q,
          ),
        };
      }
      return group;
    });
    setQuestionList(updated);
  };

  const deleteQuestion = (groupId: string, questionId: string) => {
    const updated = questionList.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          questions: group.questions.filter((q) => q.id !== questionId),
        };
      }
      return group;
    });
    setQuestionList(updated);
  };

  if (!group) return null;

  return (
    <Accordion.Item
      className="rounded-lg border bg-gray-50 shadow-sm hover:cursor-move"
      key={group.id}
      value={group.id}
    >
      {/* <div
        key={group.id}
        className="rounded-lg border bg-gray-50 shadow-sm hover:cursor-move"
      > */}
      <Accordion.Header className="w-full">
        <Accordion.Trigger
          className="flex w-[calc(100%)] items-center justify-between bg-white"
          dir={globalRTL ? "rtl" : "ltr"}
          style={{ direction: globalRTL ? "rtl" : "ltr", textAlign: globalRTL ? "right" : "left" }}
        >
          <div className={`group-header flex flex-1 flex-col items-center justify-between gap-2 rounded-t-lg border-b px-4 py-3 md:flex-row ${globalRTL ? "text-rtl" : ""}`}>
            <h6 className="font-bold">
              {roman ? (
                <span>
                  {lang === "bn"
                    ? `${banglaAlphabet[index]})`
                    : lang === "ar"
                      ? `${arabicAlphabet[index]})`
                      : `${englishAlphabet[index]})`}
                </span>
              ) : (
                <span>
                  {lang === "bn"
                    ? `${banglaNumbers[index]}|`
                    : lang === "ar"
                      ? `${arabicNumbers[index]}.`
                      : `${englishNumbers[index]}.`}
                </span>
              )}{" "}
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

        <div className="mb-4 flex flex-wrap gap-2 justify-between border-b pb-2">
          <div className="flex gap-1">
            <select
              value={anyMode}
              onChange={(e) => {
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
              className="rounded-md border p-2 outline-none w-[100px] md:w-[120px] text-sm"
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
                className="w-[50px] md:w-[60px] rounded-md border p-2 outline-none text-sm"
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
            className="w-[50px] md:w-[70px] rounded-md border p-2 outline-none disabled:cursor-not-allowed disabled:opacity-50 text-sm"
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

          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleRTL();
            }}
            className={`rounded p-1.5 cursor-pointer ${isRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            title={isRTL ? "Switch to LTR" : "Switch to RTL"}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </div>
        </div>
        <ReactSortable
          list={group.questions?.map((q: any) => ({ id: q.id }))}
          setList={(newItems: any[]) =>
            groupId
              ? updateOptionOrder(groupId, group.id, newItems)
              : updateItemOrder(group.id, newItems)
          }
          animation={200}
          group={{
            name: groupId ? "options" : "questions",
            pull: true,
            put: true,
          }}
          disabled={!isArrangeMode || disabled}
          className={`space-y-2 ${group.questions?.length > 4
            ? "max-h-96 overflow-y-auto rounded-md border border-gray-200 p-2"
            : ""
            }`}
          delay={2}
          delayOnTouchOnly={true}
        >
          {group.questions.map((q: any, qIndex: number) => {

            return (
              <div
                key={q.id}
                id={`questions-${group.id}`}
                className={`group flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 ${isArrangeMode && !disabled ? "hover:cursor-move" : "cursor-default"} hover:bg-gray-200 ${isRTL ? "text-rtl" : ""}`}
              >
                <span
                  className="w-full flex items-center gap-2 text-black"
                  onDoubleClick={() => {
                    if (disabled) {
                      onLockedFeature?.("Edit and Customize", "editandcustomize");
                    } else {
                      setLocalEditingId(q.id);
                    }
                  }}
                >
                  {localEditingId === q.id ? (
                    <input
                      autoFocus
                      type="text"
                      value={q?.question}
                      onBlur={() => setLocalEditingId(null)} // ✅ blur to cancel
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setLocalEditingId(null); // ✅ enter to finish
                        }
                      }}
                      onChange={(e) =>
                        groupId
                          ? editPassageQuestion?.(
                            e.target.value,
                            "",
                            group.id,
                            q.id,
                            groupId,
                          )
                          : editQuestion(e.target.value, group.id, q.id)
                      }
                      className="w-[90%] border-none bg-transparent focus:bg-white focus:outline-none text-black"
                    />
                  ) : (
                    <div className="w-[90%] truncate text-black">
                      <TextWithFractions text={q?.question} />
                    </div>
                  )}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      groupId
                        ? deletePassageQuestion?.(groupId, group.id, q.id)
                        : deleteQuestion(group.id, q.id)
                    }
                    className="hidden text-lg text-red-500 hover:text-red-700 group-hover:block"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </ReactSortable>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-3">
          {Object.entries(iconComponents).map(([name, Icon]) => (
            <button
              onClick={handleDeleteClick}
              key={name}
              className="text-xl text-gray-500 hover:text-black"
            >
              <Icon />
            </button>
          ))}
        </div>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      </Accordion.Content>
      {/* </div> */}
    </Accordion.Item >
  );
}
