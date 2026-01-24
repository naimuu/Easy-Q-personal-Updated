"use client";
import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import baseApi from "@/redux/baseApi";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ArrowLeftRight,
  ChevronDown,
  Pencil,
  PlusIcon,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ObjectiveView from "./ObjectiveView";
import PassageView from "./PassageView";
import QuestionForm from "./QuestionForm";
import StackFractionView from "./StackFractionView";
import TextWithFractions from "./TextWithFractions";

import {
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useGetQuestionsQuery,
  useUpdateCategoryMutation,
  useUpdateQuestionMutation,
} from "@/redux/services/adminServices/questionService";
export default function Questions({
  lessonId,
  lessonName,
}: {
  lessonId: string;
  lessonName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const { data, isLoading, refetch } = useGetQuestionsQuery(lessonId);
  const [deleteApi] = useDeleteQuestionMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [editData, setEditData] = useState<any>();
  const handleDelete = async (
    categoryId: string,
    contextId: string | undefined,
  ) => {
    const loaderId = toast.loading("Please wait...");
    try {
      await deleteApi({ lessonId, categoryId, contextId });
      toast.update(loaderId, {
        render: "Deleted successful",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      refetch();
    } catch (error: any) {
      toast.update(loaderId, {
        render: error?.data?.message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };
  //console.log(data)
  return (
    <ModalLayout
      modalComponent={
        <QuestionForm
          lessonId={lessonId}
          data={editData}
          close={() => {
            setIsOpen(false);
            refetch();
          }}
        />
      }
      onChange={() => setIsOpen(false)}
      isOpen={isOpen}
    >
      <div className="relative w-full px-3 py-1" dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between gap-4 py-2">
          <div className="py-2 font-bold">{lessonName}</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditData(null);
                setIsOpen(true);
              }}
              className="bottom-1 right-1 h-8 w-8 rounded-full p-2"
            >
              <PlusIcon />
            </Button>
            <Button
              type="button"
              onClick={() => setIsRTL(!isRTL)}
              className={`-mt-2 h-8 w-8 rounded p-1 ${isRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              title={isRTL ? "Switch to LTR" : "Switch to RTL (Arabic)"}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="h-full">
          {isLoading ? (
            <Loader />
          ) : (
            <Accordion.Root
              type="single"
              collapsible
              className="space-y-2"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {data?.map((category) => (
                <Accordion.Item
                  key={category.id}
                  value={category.id}
                  className="rounded-md border shadow-sm"
                >
                  <Accordion.Header className={`flex w-full items-center justify-between p-3 text-left font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800 ${isRTL ? "[&_svg]:left-2 [&_svg]:right-auto" : ""}`}>
                    <Accordion.Trigger
                      className="flex-1 text-left"
                    >
                      {category.name}
                    </Accordion.Trigger>
                    <div className="flex items-center gap-2">
                      <Button
                        className={`h-6 w-6 p-1 ${category.isRTL ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await updateCategory({
                              ...category,
                              isRTL: !category.isRTL,
                            }).unwrap();
                            refetch();
                            toast.success("RTL behavior updated");
                          } catch (err) {
                            toast.error("Failed to update RTL");
                          }
                        }}
                        title={category.isRTL ? "Sub-questions are RTL" : "Sub-questions are LTR"}
                      >
                        <ArrowLeftRight className="h-4 w-4" />
                      </Button>
                      {category.type !== "passage-based" && (
                        <div className="flex items-center gap-2">
                          <Button
                            className="h-6 w-6 bg-yellow-500 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditData(category);
                              setIsOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            className="h-6 w-6 bg-red-500 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              const confirmed = window.confirm(
                                "Are you sure you want to delete this questions?",
                              );
                              if (confirmed) {
                                handleDelete(category.id, undefined);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      )}
                      <Accordion.Trigger>
                        <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
                      </Accordion.Trigger>
                    </div>
                  </Accordion.Header>
                  <Accordion.Content className={`space-y-1 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${category.isRTL ? "text-right" : "text-left"}`} dir={category.isRTL ? "rtl" : "ltr"}>
                    {category?.type === "word" ? (
                      <div className="flex flex-wrap gap-1">
                        {category?.questions?.map((doc: any, i: number) => (
                          <div
                            className="rounded-sm bg-purple-200 px-2 py-1 text-black"
                            key={i}
                          >
                            <TextWithFractions text={doc.question} />
                          </div>
                        ))}
                      </div>
                    ) : category.type === "single-question" ||
                      category.type === "fill-gap" ||
                      category.type === "right-wrong" ||
                      category.type === "no" ? (
                      <div className="flex flex-col gap-1">
                        {category?.questions?.map((doc: any, i: number) => (
                          <div
                            className="rounded-sm bg-purple-200 px-2 py-1"
                            key={i}
                          >
                            <TextWithFractions text={doc.question} />
                          </div>
                        ))}
                      </div>
                    ) : category.type === "table" ? (
                      <div className="flex flex-col gap-1">
                        {category?.questions?.map((doc: any, i: number) => (
                          <div
                            key={i}
                            className="overflow-x-auto rounded-sm bg-purple-200 px-2 py-1"
                          >
                            <div
                              dangerouslySetInnerHTML={{ __html: doc.table }}
                              className="custom-table"
                            />
                          </div>
                        ))}
                      </div>
                    ) : category.type === "objective" ? (
                      <div className="flex flex-col gap-1">
                        {category?.questions?.map((doc: any, i: number) => (
                          <ObjectiveView doc={doc} key={i} />
                        ))}
                      </div>
                    ) : category.type === "stack-fraction" ? (
                      <div className="flex flex-col gap-1">
                        {category?.questions?.map((doc: any, i: number) => (
                          <StackFractionView doc={doc} key={i} />
                        ))}
                      </div>
                    ) : category.type === "passage-based" ? (
                      <div className="flex flex-col gap-1">
                        {category?.questions?.map((s: any) => (
                          <PassageView
                            key={s.id}
                            onEdit={(d) => {
                              setEditData({ ...d, categoryId: category.id });
                              setIsOpen(true);
                            }}
                            handleDelete={handleDelete}
                            s={s}
                          />
                        ))}
                      </div>
                    ) : null}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          )}
        </div>
      </div>
    </ModalLayout>
  );
}
