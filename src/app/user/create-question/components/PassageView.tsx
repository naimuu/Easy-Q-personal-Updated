"use client";
import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import Button from "@/components/shared/Button";
import { ChevronDown, PlusIcon, CheckCircle } from "lucide-react";
import { useRTL } from "@/hooks/use-rtl";
import ObjectiveView from "./ObjectiveView";
import { QuestionType, useQuestionContext } from "./QuestionContext";
import TextWithFractions from "./TextWithFractions";

export default function PassageView({
  s,
  handleDelete,
  onEdit,
  addQuestion,
  category,
}: {
  s: any;
  onEdit: (data: any) => void;
  handleDelete: (categoryId: string, contextId: string) => void;
  addQuestion: (d: QuestionType) => void;
  category: any;
}) {
  const { questionList } = useQuestionContext();
  const { isRTL } = useRTL();

  // ✅ check if a specific question is already selected
  const isDocSelected = (questionId: string) =>
    questionList.some((cat) =>
      cat.questions?.flatMap((d: any) => d.questions)?.some((q: any) => q?.id === questionId),
    );

  return (
    <Accordion.Root type="single" collapsible className="space-y-2">
      <Accordion.Item
        key={s.id}
        value={s.id}
        className="rounded-md border shadow-sm"
      >
        <Accordion.Header>
          <Accordion.Trigger
            className={`flex w-[calc(100%-25px)] gap-1 items-start justify-between p-3 font-medium text-gray-900 hover:bg-gray-100 ${isRTL ? "text-rtl" : ""}`}
            dir={isRTL ? "rtl" : "ltr"}
            style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}
          >
            <div className={`line-clamp-3 flex-1 ${isRTL ? "text-right" : "text-left"}`}>
              <TextWithFractions text={s.text} />
            </div>
            <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content>
          <Accordion.Root type="multiple" className="space-y-2">
            {s?.questions?.map((cat: any) => (
              <Accordion.Item
                key={cat.id}
                value={cat.id}
                className="rounded-md border shadow-sm"
              >
                <Accordion.Header>
                  <Accordion.Trigger
                    className={`flex w-[calc(100%-25px)] items-center justify-between p-3 font-medium text-gray-900 hover:bg-gray-100 ${isRTL ? "text-rtl" : ""}`}
                    dir={isRTL ? "rtl" : "ltr"}
                    style={{ direction: isRTL ? "rtl" : "ltr", textAlign: isRTL ? "right" : "left" }}
                  >
                    {cat.name}
                    <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
                  </Accordion.Trigger>
                </Accordion.Header>

                <Accordion.Content className="space-y-1 px-4 py-3 text-sm text-gray-700">
                  {cat.type === "word" ? (
                    <div className="flex flex-wrap gap-1">
                      {cat.questions.map((doc: any, i: number) => {
                        const selected = isDocSelected(doc.id);
                        return (
                          <div
                            key={i}
                            className={`flex items-center justify-between rounded-sm ${selected ? "bg-purple-200" : "bg-gray-300"
                              } px-2 py-1 text-black`}
                          >
                            <span className="flex-1">
                              <TextWithFractions text={doc.question} />
                            </span>
                            {selected ? (
                              <CheckCircle
                                onClick={() => {
                                  addQuestion({
                                    id: s.id,
                                    name: category.name,
                                    type: category.type,
                                    text: s.text,
                                    questions: [{ ...cat, questions: [doc] }],
                                  });
                                }}
                                className="h-6 w-6 cursor-pointer text-blue-500 hover:text-red-500 transition-colors"
                              />
                            ) : (
                              <Button
                                onClick={() => {
                                  addQuestion({
                                    id: s.id,
                                    name: category.name,
                                    type: category.type,
                                    text: s.text,
                                    questions: [{ ...cat, questions: [doc] }],
                                  });
                                }}
                                className="h-6 w-6 rounded-full p-0"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : ["single-question", "fill-gap", "right-wrong"].includes(
                    cat.type,
                  ) ? (
                    <div className="flex flex-col gap-1">
                      {cat.questions.map((doc: any, i: number) => {
                        const selected = isDocSelected(doc.id);
                        return (
                          <div
                            key={i}
                            className={`flex items-center justify-between rounded-sm ${selected ? "bg-purple-200" : "bg-gray-300"
                              } px-2 py-1`}
                          >
                            <span className="flex-1">
                              <TextWithFractions text={doc.question} />
                            </span>
                            {selected ? (
                              <CheckCircle
                                onClick={() => {
                                  addQuestion({
                                    id: s.id,
                                    name: category?.name,
                                    text: s.text,
                                    type: category?.type,
                                    questions: [{ ...cat, questions: [doc] }],
                                  });
                                }}
                                className="h-6 w-6 cursor-pointer text-blue-500 hover:text-red-500 transition-colors"
                              />
                            ) : (
                              <Button
                                onClick={() => {
                                  addQuestion({
                                    id: s.id,
                                    name: category?.name,
                                    text: s.text,
                                    type: category?.type,
                                    questions: [{ ...cat, questions: [doc] }],
                                  });
                                }}
                                className="h-6 w-6 rounded-full p-0"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : cat.type === "table" ? (
                    <div className="flex flex-col gap-1">
                      {cat.questions.map((doc: any, i: number) => {
                        const selected = isDocSelected(doc.id);
                        return (
                          <div
                            key={i}
                            className={`overflow-x-auto relative flex items-center justify-between rounded-sm ${selected ? "bg-purple-200" : "bg-gray-300"
                              } px-2 py-1`}
                          >
                            <div
                              dangerouslySetInnerHTML={{ __html: doc.table }}
                              className="custom-table"
                            />
                            {selected ? (
                              <CheckCircle
                                onClick={() => {
                                  addQuestion({
                                    id: s.id,
                                    name: category?.name,
                                    text: s.text,
                                    type: category?.type,
                                    questions: [{ ...cat, questions: [doc] }],
                                  });
                                }}
                                className="h-6 w-6 cursor-pointer text-blue-500 hover:text-red-500 transition-colors absolute top-1 right-1"
                              />
                            ) : (
                              <Button
                                onClick={() => {
                                  addQuestion({
                                    id: s.id,
                                    name: category?.name,
                                    text: s.text,
                                    type: category?.type,
                                    questions: [{ ...cat, questions: [doc] }],
                                  });
                                }}
                                className="h-6 w-6 rounded-full p-0 absolute top-1 right-1"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : cat.type === "objective" ? (
                    <div className="flex flex-col gap-1">
                      {cat.questions.map((doc: any, i: number) => {
                        const selected = isDocSelected(doc.id);
                        return (
                          <ObjectiveView
                            key={i}
                            index={i}
                            isSelected={selected}
                            doc={doc}
                            off={false}
                            onClick={() =>
                              addQuestion({
                                id: s.id,
                                name: category?.name,
                                text: s.text,
                                type: category?.type,
                                questions: [{ ...cat, questions: [doc] }],
                              })
                            }
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}
