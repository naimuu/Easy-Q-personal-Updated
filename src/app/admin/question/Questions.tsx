"use client";
import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
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
  useDeleteQuestionMutation,
  useGetQuestionsQuery,
  useUpdateCategoryMutation,
} from "@/redux/services/adminServices/questionService";

export default function Questions({
  lessonId,
  lessonName,
  bookId, // Added bookId
}: {
  lessonId: string;
  lessonName: string;
  bookId: string; // Added bookId
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

  return (
    <ModalLayout
      modalComponent={
        <QuestionForm
          lessonId={lessonId}
          bookId={bookId} // Added bookId
          data={editData}
          close={() => {
            setIsOpen(false);
            refetch();
          }}
        />
      }
      modalSize="6xl"
      onChange={() => setIsOpen(false)}
      isOpen={isOpen}
      hideCloseButton={true}
    >
      <div className="relative w-full px-3 py-1 antialiased" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4 py-2 border-b mb-2">
          <div className="py-2 font-medium text-lg">{lessonName}</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditData(null);
                setIsOpen(true);
              }}
              className="h-8 w-8 rounded-full p-2"
              title="Add Question"
            >
              <PlusIcon />
            </Button>
            <Button
              type="button"
              onClick={() => setIsRTL(!isRTL)}
              className={`h-8 w-8 rounded p-1 ${isRTL ? "bg-blue-500 text-white" : "bg-gray-200"}`}
              title={isRTL ? "Switch to LTR" : "Switch to RTL (Arabic)"}
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>
        </div>



        {/* Questions List */}
        <div className="h-full">
          {isLoading ? (
            <Loader />
          ) : (
            <Accordion.Root
              type="single"
              collapsible
              className="space-y-4"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {data?.map((category) => (
                <Accordion.Item
                  key={category.id}
                  id={category.id}
                  value={category.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm scroll-mt-24 overflow-hidden bg-white dark:bg-gray-950 data-[state=open]:bg-blue-50/50 dark:data-[state=open]:bg-blue-900/10 data-[state=open]:border-blue-200 dark:data-[state=open]:border-blue-800 transition-all duration-300"
                >
                  <Accordion.Header className={`flex w-full items-center justify-between p-4 text-left font-medium text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800 transition-colors ${isRTL ? "[&_svg]:left-2 [&_svg]:right-auto" : ""}`}>
                    <Accordion.Trigger className="flex-1 text-left outline-none">
                      {category.name}
                    </Accordion.Trigger>
                    <div className="flex items-center gap-2">
                      <Button
                        className={`h-7 w-7 p-1.5 ${category.isRTL ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
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
                            className="h-7 w-7 bg-yellow-500 hover:bg-yellow-600 p-1.5 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditData(category);
                              setIsOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 text-white" />
                          </Button>
                          <Button
                            className="h-7 w-7 bg-red-500 hover:bg-red-600 p-1.5 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const confirmed = window.confirm(
                                "Are you sure you want to delete this group of questions?",
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
                      <Accordion.Trigger className="outline-none">
                        <ChevronDown className="AccordionChevron h-5 w-5 transition-transform duration-200 text-gray-700" />
                      </Accordion.Trigger>
                    </div>
                  </Accordion.Header>
                  <Accordion.Content className={`space-y-2 p-4 pt-0 text-sm font-medium text-gray-900 dark:text-gray-100 ${category.isRTL ? "text-right" : "text-left"}`} dir={category.isRTL ? "rtl" : "ltr"}>
                    <div className="border-t pt-4">
                      {category?.type === "word" ? (
                        <div className="flex flex-wrap gap-2">
                          {category?.questions?.map((doc: any, i: number) => (
                            <div
                              className="rounded-md bg-purple-50 border border-purple-100 px-3 py-1.5 text-purple-900 font-medium shadow-sm hover:shadow-md transition-shadow"
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
                        <div className="flex flex-col gap-2">
                          {category?.questions?.map((doc: any, i: number) => (
                            <div
                              className="rounded-md bg-gray-50 border border-gray-100 px-4 py-2 hover:bg-white hover:shadow-sm transition-all shadow-inner"
                              key={i}
                            >
                              <TextWithFractions text={doc.question} />
                            </div>
                          ))}
                        </div>
                      ) : category.type === "table" ? (
                        <div className="flex flex-col gap-3">
                          {category?.questions?.map((doc: any, i: number) => (
                            <div
                              key={i}
                              className="overflow-x-auto rounded-lg bg-white border border-gray-100 p-2 shadow-sm"
                            >
                              <div
                                dangerouslySetInnerHTML={{ __html: doc.table }}
                                className="custom-table w-full"
                              />
                            </div>
                          ))}
                        </div>
                      ) : category.type === "objective" ? (
                        <div className="flex flex-col gap-3">
                          {category?.questions?.map((doc: any, i: number) => (
                            <ObjectiveView doc={doc} key={i} />
                          ))}
                        </div>
                      ) : category.type === "stack-fraction" ? (
                        <div className="flex flex-col gap-3">
                          {category?.questions?.map((doc: any, i: number) => (
                            <StackFractionView doc={doc} key={i} />
                          ))}
                        </div>
                      ) : category.type === "passage-based" ? (
                        <div className="flex flex-col gap-3">
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
                    </div>
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
