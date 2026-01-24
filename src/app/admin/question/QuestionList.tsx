"use client";
import React, { useState } from "react";
import Header from "./Header";
import BookSelection from "./BookSelection";
import Questions from "./Questions";
import CategoryList from "./CategoryList";
import Button from "@/components/shared/Button";
import clsx from "clsx";
import { X } from "lucide-react";
import { BiCategory } from "react-icons/bi";
import { GrChapterAdd } from "react-icons/gr";

export default function QuestionList() {
  const [selectBoard, setSelectBoard] = useState("");
  const [selectClass, setSelectClass] = useState("");
  const [selectBook, setSelectBook] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [lessonName, setLessonName] = useState("");

  const [openBookDrawer, setOpenBookDrawer] = useState(false);
  const [openCategoryDrawer, setOpenCategoryDrawer] = useState(false);
  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="p-3">
        <Header
          selectBoard={selectBoard}
          selectClass={selectClass}
          setSelectBoard={setSelectBoard}
          setSelectBook={setSelectBook}
          setSelectClass={setSelectClass}
          selectBook={selectBook}
        />
      </div>
      {selectBook && (
        <div className="flex h-full flex-1 border-t">
          {/* BOOK SELECTION - Desktop */}
          <div className="hidden w-[280px] shrink-0 xl:block">
            <BookSelection
              bookId={selectBook}
              selectedLessonId={lessonId}
              setSelectedLessonId={setLessonId}
              lessonName={lessonName}
              setLessonName={setLessonName}
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {/* Mobile Top Buttons */}
            <div className="flex items-center justify-between gap-2 p-2 xl:hidden">
              <Button
                Icon={<GrChapterAdd />}
                onClick={() => setOpenBookDrawer(true)}
              >
                Chapters
              </Button>
              <Button
                Icon={<BiCategory />}
                onClick={() => setOpenCategoryDrawer(true)}
              >
                Categories
              </Button>
            </div>

            {/* Lesson Content */}
            {lessonId ? (
              <div>
                <Questions
                  lessonId={lessonId}
                  lessonName={lessonName}
                  bookId={selectBook} // Added bookId
                />
              </div>
            ) : (
              <div className="flex h-full min-h-[100px] flex-1 items-center justify-center text-center font-bold text-red-500">
                Select A Lesson!
              </div>
            )}
          </div>

          {/* CATEGORY LIST - Desktop */}
          <div className="hidden w-[280px] shrink-0 xl:block">
            <CategoryList />
          </div>

          {/* --- DRAWER FOR BOOK SELECTION --- */}
          <div
            className={clsx(
              "fixed inset-y-0 left-0 z-50 w-full transform overflow-y-auto bg-white p-4 shadow-lg transition-transform duration-300 dark:bg-gray-900 xl:hidden",
              openBookDrawer ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Chapters
              </h3>
              <Button
                onClick={() => setOpenBookDrawer(false)}
                className="w-auto p-1"
              >
                <X />
              </Button>
            </div>
            <BookSelection
              bookId={selectBook}
              selectedLessonId={lessonId}
              lessonName={lessonName}
              setLessonName={setLessonName}
              setSelectedLessonId={(id) => {
                setLessonId(id);
                setOpenBookDrawer(false);
              }}
            />
          </div>

          {/* --- DRAWER FOR CATEGORY LIST --- */}
          <div
            className={clsx(
              "fixed inset-y-0 right-0 z-50 w-full transform overflow-y-auto bg-white p-4 shadow-lg transition-transform duration-300 dark:bg-gray-900 xl:hidden",
              openCategoryDrawer ? "translate-x-0" : "translate-x-full",
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Categories
              </h3>
              <Button
                onClick={() => setOpenCategoryDrawer(false)}
                className="w-auto p-1"
              >
                <X />
              </Button>
            </div>
            <CategoryList />
          </div>

          {/* Backdrop for mobile */}
          {(openBookDrawer || openCategoryDrawer) && (
            <div
              onClick={() => {
                setOpenBookDrawer(false);
                setOpenCategoryDrawer(false);
              }}
              className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            />
          )}
        </div>
      )}
    </div>
  );
}
