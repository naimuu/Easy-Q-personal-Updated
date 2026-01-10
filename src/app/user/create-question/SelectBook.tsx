"use client";

import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import { useGetBoardsQuery } from "@/redux/services/adminServices";
import {
  useGetInstitutesQuery,
  useGetUserBoardQuery,
  useGetUserBooksQuery,
} from "@/redux/services/userService";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BiRightArrow, BiError } from "react-icons/bi";
import { toast } from "react-toastify";
import { useQuestionContext } from "./components/QuestionContext";

export default function SelectBook({ onNext }: { onNext: () => void }) {
  const { data: institutes, isLoading: instituteLoader } =
    useGetInstitutesQuery("");
  const { data: boardList, isLoading: boardLoading } = useGetUserBoardQuery();

  const [selectedMadrasah, setSelectedMadrasah] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const classList = boardList?.find((d) => d.id === selectedBoard)?.classes;
  const [selectedClass, setSelectedClass] = useState("");
  const { data: books, isLoading: bookLoading } = useGetUserBooksQuery({
    classId: selectedClass,
    boardId: selectedBoard,
  });
  const [selectedBook, setSelectedBook] = useState("");
  const { setQuestionList } = useQuestionContext();
  const router = useRouter();
  //console.log(books)

  const [showError, setShowError] = useState("");

  if (instituteLoader || boardLoading) return <Loader />;

  return (
    <div className="container relative mx-auto min-h-screen p-4">
      {/* Error Modal */}
      {showError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl transform scale-100 transition-all">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-red-100 p-3">
                <BiError className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">লক্ষ্য করুন</h3>
              <p className="mb-6 text-gray-600">{showError}</p>
              <button
                onClick={() => setShowError("")}
                className="w-full rounded-lg bg-red-500 py-2.5 font-semibold text-white transition-colors hover:bg-red-600"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mb-4 flex justify-between">
        <button
          onClick={() => router.back()}
          className="w-24 text-center rounded-md bg-gray-700 px-4 py-2 font-bold text-white hover:bg-gray-800 transition-colors">
          বাতিল
        </button>
        <button
          onClick={() => {
            if (!selectedMadrasah) return setShowError("অনুগ্রহ করে প্রতিষ্ঠান নির্বাচন করুন");
            if (!selectedBoard) return setShowError("অনুগ্রহ করে বোর্ড নির্বাচন করুন");
            if (!selectedBook) return setShowError("অনুগ্রহ করে একটি বই নির্বাচন করুন");
            // If book is selected, class should be set. If not, prompt.
            if (!selectedClass) return setShowError("অনুগ্রহ করে ক্লাস নির্বাচন করুন");

            setQuestionList([]); // Clear any existing question state
            router.push(
              `/user/create-question?instituteId=${selectedMadrasah}&boardId=${selectedBoard}&classId=${selectedClass}&bookId=${selectedBook}&page=2`,
            );
          }}
          className="w-24 rounded-md bg-purple-900 px-4 py-2 text-center font-bold text-white"
        >
          পরবর্তী
        </button>
      </div>
      {selectedBook && (
        <div className="animate-fade-in-up fixed bottom-2 right-2 z-50 translate-y-0 opacity-100 transition-all duration-300 ease-in-out md:hidden">
          <Button
            onClick={() => {
              if (!selectedMadrasah) return setShowError("অনুগ্রহ করে প্রতিষ্ঠান নির্বাচন করুন");
              if (!selectedBoard) return setShowError("অনুগ্রহ করে বোর্ড নির্বাচন করুন");
              if (!selectedBook) return setShowError("অনুগ্রহ করে একটি বই নির্বাচন করুন");
              if (!selectedClass) return setShowError("অনুগ্রহ করে ক্লাস নির্বাচন করুন");

              setQuestionList([]); // Clear any existing question state
              router.push(
                `/user/create-question?instituteId=${selectedMadrasah}&boardId=${selectedBoard}&classId=${selectedClass}&bookId=${selectedBook}&page=2`,
              );
            }}
            Icon={<BiRightArrow />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Dropdowns */}
      <div className="flex flex-wrap items-start justify-center gap-4">
        {/* Madrasah Select */}
        <div className="w-full max-w-sm">
          <select
            value={selectedMadrasah}
            onChange={(e) => setSelectedMadrasah(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:outline-none"
          >
            <option value="">-- প্রতিষ্ঠান নির্বাচন করুন --</option>
            {institutes?.map((item: any, index: number) => (
              <option key={index} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Board Select */}
        <div className="w-full max-w-sm">
          <select
            value={selectedBoard}
            onChange={(e) => {
              setSelectedBoard(e.target.value);
              setSelectedClass("");
            }}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:outline-none"
          >
            <option value="">-- বোর্ড নির্বাচন করুন --</option>
            {boardList?.map((item: any, index: number) => (
              <option key={index} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      {selectedBoard && (
        <div className="mt-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-4 px-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <button
              onClick={() => setSelectedClass("")}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedClass === ""
                ? "bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600"
                }`}
            >
              সব ক্লাস
            </button>
            {classList?.map((tab: any, i: number) => (
              <button
                onClick={() => setSelectedClass(tab.id)}
                key={i}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${tab.id === selectedClass
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-purple-300 hover:text-purple-600"
                  }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="mt-6">
        {!selectedBoard && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 mb-4">
              <BiRightArrow className="text-4xl text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">বোর্ড নির্বাচন করুন</h3>
            <p className="mt-2 text-gray-600">বইগুলো দেখার জন্য অনুগ্রহ করে একটি বোর্ড নির্বাচন করুন</p>
          </div>
        )}

        {selectedBoard && (
          <>
            {bookLoading && <Loader />}

            {!bookLoading && books?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in-up">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <BiError className="text-4xl text-red-500" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">দুঃখিত!</h3>
                <p className="mt-2 text-gray-600">কোনো বই পাওয়া যায়নি। অনুগ্রহ করে অন্য ক্লাস নির্বাচন করুন।</p>
              </div>
            )}

            <div key={selectedClass + selectedBoard} className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 animate-fade-in-up">
              {!bookLoading &&
                books?.map((card, index) => (
                  <div
                    onClick={() => {
                      setSelectedBook(card.id);
                      if (!selectedClass) setSelectedClass(card?.class?.id);
                    }}
                    key={index}
                    className={`flex min-h-[8rem] cursor-pointer ${selectedBook === card.id ? "bg-pink-200" : "bg-white"
                      } items-stretch overflow-hidden rounded-lg border shadow transition-all hover:shadow-md`}
                  >
                    <div className="relative w-32 shrink-0 bg-gray-300">
                      <Image
                        src={card.cover}
                        alt={card.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {card.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {card?.class?.board?.name}
                        </p>
                        <p className="mb-2 text-sm text-gray-600">
                          {card?.class?.name}
                        </p>
                        <div className="text-sm text-gray-500">
                          {/* <div>Categories: {card.categories}</div> */}
                          <div>Total Chapter: {card._count?.chapter}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
