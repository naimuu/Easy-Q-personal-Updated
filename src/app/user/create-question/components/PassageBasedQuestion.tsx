"use client";
import { TrashIcon } from "@/assets/icons";
import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";
import { ArrowLeftRight } from "lucide-react";
import React, { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import {
  arabicNumbers,
  banglaNumbers,
  englishNumbers
} from "./alphabet";
import LineBasedView from "./LineBasedView";
import ObjectiveBasedView from "./ObjectiveBasedView";
import {
  ContextCategory,
  QuestionType,
  useQuestionContext
} from "./QuestionContext";
import TableBasedView from "./TableBasedView";
import WordBaseView from "./WordBaseView";
import TextWithFractions from "./TextWithFractions";

export default function PassagedBasedView({
  group,
  index,
  lang,
  disabled,
  canAddingMarks = true,
  onLockedFeature,
  globalRTL,
  isArrangeMode = false,
}: {
  group: QuestionType;
  index: number;
  lang: string;
  disabled: boolean;
  canAddingMarks?: boolean;
  globalRTL?: boolean;
  onLockedFeature?: (feature: string, featureKey: string) => void;
  isArrangeMode?: boolean;
}) {
  const [numberType, setNumberType] = React.useState("roman");
  const { updateItemOrder, removeGroup, questionList, setQuestionList } =
    useQuestionContext();
  const isRTL = group?.isRTL ?? false;
  const [answer, setAnswer] = useState(group?.any || "");
  const [mark, setMark] = useState(group?.mark || "");



  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    removeGroup(group.id);
  };

  const toggleRTL = () => {
    const updatedList = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, isRTL: !isRTL };
      }
      return d;
    });
    setQuestionList(updatedList);
  };

  React.useEffect(() => {
    const updatedList = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, any: answer, mark: mark };
      }
      return d;
    });
    setQuestionList(updatedList);
  }, [answer, mark]);

  const [isEditing, setIsEditing] = useState(false);
  const editPassage = (text: string) => {
    const updated = questionList.map((d) => {
      if (d.id === group.id) {
        return { ...d, text: text };
      }
      return d;
    });
    setQuestionList(updated);
  };

  const editQuestion = (
    text: string,
    table: string,
    itemId: string,
    questionId: string,
    groupId: string,
  ) => {
    const updated = questionList.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          questions: (g.questions as ContextCategory[]).map((category) => {
            if (category.id === itemId) {
              return {
                ...category,
                questions: category.questions.map((qs) => {
                  if (qs.id === questionId) {
                    return { ...qs, question: text, table: table };
                  }
                  return qs;
                }),
              };
            }
            return category;
          }),
        };
      }
      return g;
    });

    setQuestionList(updated);
  };

  const editOption = (
    text: string,
    itemId: string,
    questionId: string,
    optionId: string,
    groupId: string,
  ) => {
    const updated = questionList.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          questions: (g.questions as ContextCategory[]).map((category) => {
            if (category.id === itemId) {
              return {
                ...category,
                questions: category.questions.map((qs: any) => {
                  if (qs.id === questionId) {
                    return {
                      ...qs,
                      options: qs.options?.map((opt: any) =>
                        opt.id === optionId ? { ...opt, name: text } : opt,
                      ),
                    };
                  }
                  return qs;
                }),
              };
            }
            return category;
          }),
        };
      }
      return g;
    });

    setQuestionList(updated);
  };

  const deleteQuestion = (
    groupId: string,
    itemId: string,
    questionId: string,
  ) => {
    const updated = questionList.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          questions: (g.questions as ContextCategory[]).map((category) => {
            if (category.id === itemId) {
              return {
                ...category,
                questions: category.questions.filter(
                  (q) => q.id !== questionId,
                ),
              };
            }
            return category;
          }),
        };
      }
      return g;
    });

    setQuestionList(updated);
  };
  const deleteItem = (itemId: string, groupId: string) => {
    const updated = questionList.map((d) => {
      if (d.id === groupId) {
        return { ...d, questions: d.questions.filter((s) => s.id !== itemId) };
      }
      return d;
    });
    setQuestionList(updated);
  };
  if (!group) return null;
  // console.log(group?.questions[0][0])
  return (
    <div
      key={group.id}
      className="rounded-lg border bg-gray-50 shadow-sm hover:cursor-move"
    >
      <div
        className="group-header flex items-center justify-between rounded-t-lg border-b bg-white px-4 py-3"
        dir={globalRTL ? "rtl" : "ltr"}
        style={{ direction: globalRTL ? "rtl" : "ltr", textAlign: globalRTL ? "right" : "left" }}
      >
        <h6 className="font-bold">
          <span>
            {lang === "bn"
              ? `${banglaNumbers[index]}|`
              : lang === "ar"
                ? `${arabicNumbers[index]}.`
                : `${englishNumbers[index]}.`}
          </span>{" "}
          {group?.name}
        </h6>
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
      <div
        onDoubleClick={() => console.log("ok")}
        className="group pointer-events-auto flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 hover:cursor-move hover:bg-gray-200"
      >
        <span className="w-full">
          {/* {banglaAlphabet[qIndex % banglaAlphabet.length]} */}

          {isEditing ? (
            <textarea
              onBlur={() => setIsEditing(false)}
              disabled={!isEditing}
              value={group?.text}
              onChange={(e) => editPassage(e.target.value)}
              className="ml-2 w-[90%] border-none bg-transparent focus:bg-white focus:outline-none"
            />
          ) : (
            <div
              onDoubleClick={() => setIsEditing(true)}
              className="ml-2 w-[90%] border-none bg-transparent focus:bg-white focus:outline-none"
            >
              <TextWithFractions text={group?.text} />
            </div>
          )}
        </span>
        <button
          onClick={handleDeleteClick}
          className="hidden text-lg text-red-500 hover:text-red-700 group-hover:block"
        >
          <TrashIcon />
        </button>
      </div>
      <div
        className={`p-4 ${isRTL ? "text-rtl" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
        style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}
      >
        <div className="mb-4 flex gap-1 justify-between border-b pb-2">
          <select
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="rounded-md border p-2 outline-none"
          >
            <option>Answer</option>
            <option value="All">All</option>
            {englishNumbers.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
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
        </div>
        <ReactSortable
          list={group.questions?.map((q: any) => ({ id: q.id }))}
          setList={(newItems: any[]) => updateItemOrder(group.id, newItems)}
          animation={200}
          group={{ name: "questions", pull: true, put: true }}
          className={`space-y-2 ${group.questions?.length > 4
            ? "max-h-96 overflow-y-auto rounded-md border border-gray-200 p-2"
            : ""
            }`}
          delay={2}
          disabled={!isArrangeMode || disabled}
          delayOnTouchOnly={true}
        >
          {group?.questions?.map((g: any, groupIndex: number) =>
            g?.type === "word" ? (
              <WordBaseView
                group={g}
                index={groupIndex}
                key={g.id}
                lang={lang}
                roman={true}
                groupId={group.id}
                parentRTL={isRTL}
                globalRTL={globalRTL}
                editPassageQuestion={editQuestion}
                deletePassageQuestion={deleteQuestion}
                deleteItem={deleteItem}
                disabled={disabled}
                isArrangeMode={isArrangeMode}
                onLockedFeature={onLockedFeature}
              />
            ) : g?.type === "single-question" ||
              g?.type === "fill-gap" ||
              g?.type === "right-wrong" ? (
              <LineBasedView
                group={g}
                index={groupIndex}
                key={g.id}
                lang={lang}
                roman={true}
                groupId={group.id}
                parentRTL={isRTL}
                globalRTL={globalRTL}
                editPassageQuestion={editQuestion}
                deletePassageQuestion={deleteQuestion}
                deleteItem={deleteItem}
                disabled={disabled}
                isArrangeMode={isArrangeMode}
                onLockedFeature={onLockedFeature}
              />
            ) : g?.type === "table" ? (
              <TableBasedView
                group={g}
                index={groupIndex}
                key={g.id}
                lang={lang}
                roman={true}
                groupId={group.id}
                parentRTL={isRTL}
                globalRTL={globalRTL}
                editPassageQuestion={editQuestion}
                deletePassageQuestion={deleteQuestion}
                deleteItem={deleteItem}
                disabled={disabled}
                isArrangeMode={isArrangeMode}
                onLockedFeature={onLockedFeature}
              />
            ) : g?.type === "objective" ? (
              <ObjectiveBasedView
                group={g}
                index={groupIndex}
                key={g.id}
                lang={lang}
                roman={true}
                groupId={group.id}
                parentRTL={isRTL}
                editPassageQuestion={editQuestion}
                editPassageOption={editOption}
                deletePassageQuestion={deleteQuestion}
                deleteItem={deleteItem}
                disabled={disabled}
                isArrangeMode={isArrangeMode}
                onLockedFeature={onLockedFeature}
              />
            ) : null,
          )}
        </ReactSortable>
      </div>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
