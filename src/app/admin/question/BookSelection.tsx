"use client";

import * as Accordion from "@radix-ui/react-accordion";
import React, { useEffect, useState } from "react";
import { ChevronDown, PlusIcon, Trash2, Pencil, MoreVertical } from "lucide-react";
import { DropdownMenu } from "radix-ui";
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
  useBulkCreateChapterLessonMutation,
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
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkCreate, { isLoading: isBulkSaving }] = useBulkCreateChapterLessonMutation();

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

  const chapters: Chapter[] = React.useMemo(() => chaptersData.map((chapter) => ({
    ...chapter,
    lessons: lessonsData.filter((l) => l.chapterId === chapter.id),
  })), [chaptersData, lessonsData]);

  useEffect(() => {
    if (isBulkAdding) {
      if (chapters.length > 0) {
        let text = "";
        chapters.forEach((c) => {
          text += `#${c.serial} ${c.name}\n`;
          c.lessons.forEach((l) => {
            text += `> #${l.serial} ${l.name}\n`;
          });
        });
        setBulkText(text);
      }
    }
  }, [isBulkAdding]); // Removed chapters from dependency to avoid overwrite on refetch, strictly sets on open.

  const handleBulkSubmit = async () => {
    const lines = bulkText.split("\n").filter((l) => l.trim());
    const data: { id?: string; name: string; lessons: { id?: string; name: string }[] }[] = [];

    // Create copies of available items to match against (consuming them to handle duplicates)
    // We will lookup items from the original `chapters` availability
    // But we don't need to "consume" them like before because `serial` is a specific key.

    let currentChapter: { id?: string; name: string; lessons: { id?: string; name: string }[] } | null = null;
    let currentOriginalChapter: Chapter | undefined = undefined; // To support lesson lookups

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.startsWith(">")) {
        // Is Lesson
        if (currentChapter) {
          // Format: > #1 Lesson Name OR > Lesson Name
          const rawContent = trimmed.substring(1).trim();
          const match = rawContent.match(/^#(\d+)\s+(.*)$/);

          let name = rawContent;
          let lessonId: string | undefined = undefined;

          if (match && currentOriginalChapter) {
            const serial = parseInt(match[1]);
            name = match[2].trim();
            const originalLesson = currentOriginalChapter.lessons.find(l => l.serial === serial);
            if (originalLesson) {
              lessonId = originalLesson.id;
            }
          } else if (match) {
            // Has #serial but no original chapter matched? Treat as new, use name part
            name = match[2].trim();
          }

          currentChapter.lessons.push({ name, id: lessonId });
        }
      } else {
        // Is Chapter
        // Format: #1 Name OR Name
        const match = trimmed.match(/^#(\d+)\s+(.*)$/);

        let name = trimmed;
        let chapterId: string | undefined = undefined;
        currentOriginalChapter = undefined;

        if (match) {
          const serial = parseInt(match[1]);
          name = match[2].trim();
          const originalChapter = chapters.find(c => c.serial === serial);
          if (originalChapter) {
            chapterId = originalChapter.id;
            currentOriginalChapter = originalChapter;
          }
        }

        currentChapter = { name, id: chapterId, lessons: [] };
        data.push(currentChapter);
      }
    });

    if (data.length === 0) {
      toast.error("Please provide valid data format");
      return;
    }

    try {
      await bulkCreate({ bookId, data }).unwrap();
      toast.success("Bulk update successful");
      refetchChapters();
      refetchLessons();
      setIsBulkAdding(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Bulk entry failed");
    }
  };

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
            initialData={editingChapter ? { name: editingChapter.name, serial: editingChapter.serial } : undefined}
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
          <div className="text-md mb-4 flex items-center justify-between font-medium text-gray-800 dark:text-white">
            Chapters & Lessons
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsBulkAdding(true)}
                className="h-8 w-auto px-2 text-xs rounded-md"
                title="Bulk Add Chapters & Lessons"
              >
                Bulk Add
              </Button>
              <Button
                onClick={() => setIsOpen(true)}
                className="h-8 w-8 rounded-full p-2"
                title="Add Single Chapter"
              >
                <PlusIcon />
              </Button>
            </div>
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
                  <Accordion.Header className="flex w-full items-center justify-between text-left font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800">
                    <Accordion.Trigger className="flex-1 text-left font-medium p-3">
                      {chapter.name}
                    </Accordion.Trigger>
                    <div className="flex items-center gap-1 p-3">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-200 focus:outline-none transition-colors">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content className="z-[100] min-w-[140px] bg-white rounded-md shadow-lg border border-gray-100 p-1 animate-in fade-in zoom-in duration-200">
                            <DropdownMenu.Item
                              onSelect={() => {
                                setActiveChapterId(chapter.id);
                                setIsAddingLesson(true);
                              }}
                              className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors cursor-pointer rounded outline-none"
                            >
                              <PlusIcon className="h-4 w-4" /> Add Lesson
                            </DropdownMenu.Item>
                            <DropdownMenu.Item
                              onSelect={() => {
                                setEditingChapter(chapter);
                                setIsOpen(true);
                              }}
                              className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors cursor-pointer rounded outline-none"
                            >
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                            <DropdownMenu.Item
                              onSelect={async () => {
                                const confirmed = window.confirm("Are you sure you want to delete this chapter?");
                                if (confirmed) {
                                  try {
                                    await deleteChapter({ id: chapter.id });
                                    toast.success("Chapter deleted");
                                    refetchChapters();
                                  } catch {
                                    toast.error("Failed to delete");
                                  }
                                }
                              }}
                              className="flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded outline-none"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>

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
                          "flex items-center justify-between rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer", // cursor-pointer on container
                          selectedLessonId === lesson.id &&
                          "bg-gray-200 font-semibold dark:bg-gray-700",
                        )}
                        onClick={() => {
                          setSelectedLessonId(lesson.id);
                          setLessonName(lesson.name);
                        }}
                      >
                        <div
                          className="flex-1 font-normal text-sm p-2"
                        >
                          <span className="text-gray-400 mr-2 text-sm font-normal">{lesson.serial}.</span>
                          {lesson.name}
                        </div>
                        <div className="flex gap-1 p-2" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-300 focus:outline-none transition-colors">
                                <MoreVertical size={14} />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content className="z-[100] min-w-[120px] bg-white rounded-md shadow-lg border border-gray-100 p-1 animate-in fade-in zoom-in duration-200">
                                <DropdownMenu.Item
                                  onSelect={() => setEditingLesson({ lesson, chapterId: chapter.id })}
                                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 hover:bg-blue-50 transition-colors cursor-pointer rounded outline-none"
                                >
                                  <Pencil className="h-3 w-3" /> Edit
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  onSelect={async () => {
                                    const confirmed = window.confirm("Are you sure you want to delete this lesson?");
                                    if (confirmed) {
                                      try {
                                        await deleteLesson({ id: lesson.id });
                                        toast.success("Lesson deleted");
                                        refetchLessons();
                                      } catch {
                                        toast.error("Failed to delete lesson");
                                      }
                                    }
                                  }}
                                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer rounded outline-none"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
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
            initialData={editingLesson ? { name: editingLesson.lesson.name, serial: editingLesson.lesson.serial } : undefined}
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

      <ModalLayout
        onChange={() => setIsBulkAdding(false)}
        isOpen={isBulkAdding}
        modalComponent={
          <div className="flex flex-col gap-4 w-[400px]">
            <div className="text-lg font-medium">Bulk Edit Chapters & Lessons</div>
            <p className="text-xs text-gray-500">
              Format:
              <br />
              Chapter Name
              <br />
              {">"} Lesson Name
              <br />
              <span className="text-amber-600 font-semibold">* Use #number (e.g. #1) to match existing items for updates.</span>
            </p>
            <textarea
              id="bulk-input"
              rows={20}
              className="w-full rounded-md border p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none font-mono"
              placeholder="Loading existing data..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button mode="outline" onClick={() => setIsBulkAdding(false)}>Cancel</Button>
              <Button loading={isBulkSaving} onClick={() => {
                handleBulkSubmit();
              }}>Save Changes</Button>
            </div>
          </div>
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
  initialData,
  loading,
}: {
  close: () => void;
  onSubmit: (name: string, serial: number) => void;
  initialData?: { name: string; serial: number };
  loading?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(chapterSchema),
    defaultValues: { name: "", serial: 1 },
  });

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name, serial: initialData.serial });
    } else {
      reset({ name: "", serial: 1 });
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data.name, data.serial);
      })}
      className="flex flex-col gap-4"
    >
      <div className="text-lg font-medium">
        {initialData ? "Edit Chapter" : "Add Chapter"}
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
  initialData,
  loading,
}: {
  close: () => void;
  onSubmit: (name: string, serial: number) => void;
  initialData?: { name: string; serial: number };
  loading?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(lessonSchema),
    defaultValues: { name: "", serial: 1 },
  });

  useEffect(() => {
    if (initialData) {
      reset({ name: initialData.name, serial: initialData.serial });
    } else {
      reset({ name: "", serial: 1 });
    }
  }, [initialData, reset]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit(data.name, data.serial);
        //close();
      })}
      className="flex flex-col gap-4"
    >
      <div className="text-lg font-medium">
        {initialData ? "Edit Lesson" : "Add Lesson"}
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

