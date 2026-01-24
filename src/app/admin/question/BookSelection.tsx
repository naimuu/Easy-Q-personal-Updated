"use client";

import * as Accordion from "@radix-ui/react-accordion";
import React, { useEffect, useState } from "react";
import { ChevronDown, PlusIcon, Trash2, Pencil } from "lucide-react";
import Button from "@/components/shared/Button";
import clsx from "clsx";
import ModalLayout from "@/components/Layouts/ModalLayout";
import Input from "@/components/shared/Input";
import { useForm } from "react-hook-form";
import { object, string, number } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import {
  useCreateChapterMutation,
  useCreateLessonMutation,
  useDeleteChapterMutation,
  useDeleteLessonMutation,
  useGetChaptersQuery,
  useGetLessonsQuery,
  useUpdateChapterMutation,
  useUpdateLessonMutation,
} from "@/redux/services/adminServices/chapterLesson";

interface BookSelectionProps {
  selectedLessonId: string | null;
  setSelectedLessonId: (id: string) => void;
  bookId: string;
  lessonName: string | null;
  setLessonName: (id: string) => void;
}

type Lesson = { id: string; name: string; serial: number };
type Chapter = { id: string; name: string; lessons: Lesson[]; serial: number };

export default function BookSelection({
  selectedLessonId,
  setSelectedLessonId,
  bookId,
  lessonName,
  setLessonName,
}: BookSelectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingLesson, setEditingLesson] = useState<{
    lesson: Lesson;
    chapterId: string;
  } | null>(null);

  const {
    data: chaptersData = [],
    isLoading: isChaptersLoading,
    refetch: refetchChapters,
  } = useGetChaptersQuery(bookId);
  //console.log(chaptersData)
  const {
    data: lessonsData = [],
    isLoading: isLessonsLoading,
    refetch: refetchLessons,
  } = useGetLessonsQuery();
  const [createChapter, { isLoading: isCreatingChapter }] =
    useCreateChapterMutation();
  const [updateChapter, { isLoading: isUpdatingChapter }] =
    useUpdateChapterMutation();
  const [deleteChapter] = useDeleteChapterMutation();
  const [createLesson, { isLoading: isCreatingLesson }] =
    useCreateLessonMutation();
  const [updateLesson, { isLoading: isUpdatingLesson }] =
    useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const chapters: Chapter[] = chaptersData.map((chapter) => ({
    ...chapter,
    lessons: lessonsData.filter((l) => l.chapterId === chapter.id),
  }));
  //   useEffect(() => {
  //   if (bookId) {
  //     refetchChapters();
  //     refetchLessons();
  //   }
  // }, [bookId]);

  return (
    <>
      <ModalLayout
        onChange={() => setIsOpen(false)}
        modalComponent={
          <AddChapter
            close={() => {
              setIsOpen(false);
              setEditingChapter(null);
            }}
            defaultValue={editingChapter?.name || ""}
            onSubmit={async (name, serial) => {
              try {
                if (editingChapter) {
                  await updateChapter({
                    id: editingChapter.id,
                    name,
                    serial,
                    bookId,
                  }).unwrap();
                  toast.success("Chapter updated");
                  setIsOpen(false);
                  setEditingChapter(null);
                } else {
                  await createChapter({ name, serial, bookId }).unwrap();
                  toast.success("Chapter added");
                  setIsOpen(false);
                  setEditingChapter(null);
                }
                refetchChapters();
              } catch (err: any) {
                toast.error(err?.data?.message || "Failed to save chapter");
              }
            }}
            loading={isCreatingChapter || isUpdatingChapter}
          />
        }
        isOpen={isOpen}
      >
        <aside className="h-full w-full  overflow-y-auto bg-white dark:bg-gray-900 xl:border-r xl:p-4">
          <div className="text-md mb-4 flex items-center justify-between font-semibold text-gray-800 dark:text-white">
            Chapters & Lessons
            <Button
              onClick={() => setIsOpen(true)}
              className="h-8 w-8 rounded-full p-2"
            >
              <PlusIcon />
            </Button>
          </div>

          {isChaptersLoading || isLessonsLoading ? (
            <div className="text-center text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : (
            <Accordion.Root type="single" collapsible className="space-y-2">
              {chapters.map((chapter) => (
                <Accordion.Item
                  key={chapter.id}
                  value={chapter.id}
                  className="rounded-md border shadow-sm"
                >
                  <Accordion.Header className="flex w-full items-center justify-between p-3 text-left font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
                    <Accordion.Trigger className="flex-1 text-left">
                      Chapter {chapter.serial}
                    </Accordion.Trigger>
                    <div className="flex items-center gap-2">
                      <Button
                        className="h-6 w-6 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChapterId(chapter.id);
                          setIsAddingLesson(true);
                        }}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        className="h-6 w-6 bg-yellow-500 p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChapter(chapter);
                          setIsOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        className="h-6 w-6 bg-red-500 p-1"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmed = window.confirm(
                            "Are you sure you want to delete this chapter?",
                          );
                          if (!confirmed) {
                            return;
                          }
                          try {
                            await deleteChapter({ id: chapter.id });
                            toast.success("Chapter deleted");
                            refetchChapters();
                          } catch {
                            toast.error("Failed to delete");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </Button>
                      <Accordion.Trigger>
                        <ChevronDown className="AccordionChevron h-4 w-4 transition-transform duration-200" />
                      </Accordion.Trigger>
                    </div>
                  </Accordion.Header>
                  <Accordion.Content className="space-y-1 px-4 pb-3 text-sm text-gray-700 dark:text-gray-300">
                    {chapter.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={clsx(
                          "flex items-center justify-between rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                          selectedLessonId === lesson.id &&
                          "bg-gray-200 font-semibold dark:bg-gray-700",
                        )}
                      >
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            setSelectedLessonId(lesson.id);
                            setLessonName(lesson.name);
                          }}
                        >
                          Lesson {lesson.serial}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            className="h-5 w-5 bg-yellow-500 p-1"
                            onClick={() =>
                              setEditingLesson({
                                lesson,
                                chapterId: chapter.id,
                              })
                            }
                          >
                            <Pencil className="h-3 w-3 text-white" />
                          </Button>
                          <Button
                            className="h-5 w-5 bg-red-500 p-1"
                            onClick={async () => {
                              const confirmed = window.confirm(
                                "Are you sure you want to delete this lesson?",
                              );
                              if (!confirmed) {
                                return;
                              }
                              try {
                                await deleteLesson({ id: lesson.id });
                                toast.success("Lesson deleted");
                                refetchLessons();
                              } catch {
                                toast.error("Failed to delete lesson");
                              }
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-white" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          )}
        </aside>
      </ModalLayout>

      <ModalLayout
        onChange={() => {
          setIsAddingLesson(false);
          setEditingLesson(null);
        }}
        isOpen={isAddingLesson || !!editingLesson}
        modalComponent={
          <AddLesson
            defaultValue={editingLesson?.lesson.name || ""}
            close={() => {
              setIsAddingLesson(false);
              setEditingLesson(null);
            }}
            onSubmit={async (name, serial) => {
              try {
                if (editingLesson) {
                  await updateLesson({
                    id: editingLesson.lesson.id,
                    name,
                    serial,
                    chapterId: editingLesson.chapterId,
                  }).unwrap();
                  toast.success("Lesson updated");
                  setIsAddingLesson(false);
                  setEditingLesson(null);
                } else if (activeChapterId) {
                  await createLesson({
                    name,
                    serial,
                    chapterId: activeChapterId,
                  }).unwrap();
                  toast.success("Lesson added");
                  setIsAddingLesson(false);
                  setEditingLesson(null);
                }
                refetchLessons();
              } catch (err: any) {
                toast.error(err?.data?.message || "Failed to save lesson");
              } finally {
                setIsAddingLesson(false);
                setEditingLesson(null);
              }
            }}
            loading={isCreatingLesson || isUpdatingLesson}
          />
        }
      >
        <div />
      </ModalLayout>
    </>
  );
}

const chapterSchema = object({
  name: string().required("Chapter name is required"),
  serial: number().required("Serial is required"),
});

const AddChapter = ({
  close,
  onSubmit,
  defaultValue = "",
  loading,
}: {
  close: () => void;
  onSubmit: (name: string, serial: number) => void;
  defaultValue?: string;
  loading?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(chapterSchema),
    defaultValues: { name: defaultValue, serial: 1 },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data.name, data.serial);
      })}
      className="flex flex-col gap-4"
    >
      <div className="text-lg font-medium">
        {defaultValue ? "Edit Chapter" : "Add Chapter"}
      </div>
      <Input
        label="Chapter Name"
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        label="Serial"
        type="number"
        {...register("serial")}
        error={errors.serial?.message}
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
};

const lessonSchema = object({
  name: string().required("Lesson name is required"),
  serial: number().required("Serial is required"),
});

const AddLesson = ({
  close,
  onSubmit,
  defaultValue = "",
  loading,
}: {
  close: () => void;
  onSubmit: (name: string, serial: number) => void;
  defaultValue?: string;
  loading?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(lessonSchema),
    defaultValues: { name: defaultValue, serial: 1 },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data.name, data.serial);
        //close();
      })}
      className="flex flex-col gap-4"
    >
      <div className="text-lg font-medium">
        {defaultValue ? "Edit Lesson" : "Add Lesson"}
      </div>
      <Input
        label="Lesson Name"
        {...register("name")}
        error={errors.name?.message}
      />
      <Input
        label="Serial"
        type="number"
        {...register("serial")}
        error={errors.serial?.message}
      />
      <Button type="submit" loading={loading}>
        Submit
      </Button>
    </form>
  );
};
