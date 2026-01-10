"use client";

import Loader from "@/components/shared/Loader";
import {
  useGetUserBoardQuery,
  useGetUserBooksQuery,
  useGetUserClassQuery,
} from "@/redux/services/userService";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FiBookmark,
  FiInfo,
  FiPlus,
  FiSearch,
  FiSettings,
  FiHeart,
  FiBookOpen,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function BooksPage() {
  const router = useRouter();
  const { data: boards, isLoading: boardLoading } = useGetUserBoardQuery();
  const { data: classes, isLoading: classLoading } = useGetUserClassQuery();
  const [boardId, setBoardId] = useState("");
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const {
    data: books,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetUserBooksQuery({
    boardId: boardId || undefined,
    classId: classId || undefined,
    search: "" // Client-side filtering
  });

  const filteredBooks = (books || []).filter((book: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      book?.name?.toLowerCase().includes(s) ||
      book?.class?.name?.toLowerCase().includes(s) ||
      book?.class?.board?.name?.toLowerCase().includes(s)
    );
  });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearch(searchText);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchText]);
  if (boardLoading || classLoading || isLoading) return <Loader />;
  return (
    <div className="rounded-xl shadow-sm md:bg-white md:p-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row">
        <select
          value={boardId}
          onChange={(e) => {
            setBoardId(e.target.value);
            setClassId(""); // Reset class when board changes
          }}
          className="h-12 w-full rounded border px-4 text-gray-600 lg:w-1/3"
        >
          <option value={""}>Select board</option>
          {boards?.map((d) => (
            <option value={d.id} key={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => setClassId(e.target.value)}
          value={classId}
          className="h-12 w-full rounded border px-4 text-gray-600 lg:w-1/3"
        >
          <option value={""}>Select class</option>
          {classes
            ?.filter((d) => d.boardId === boardId)
            ?.map((d) => (
              <option value={d.id} key={d.id}>
                {d.name}
              </option>
            ))}
        </select>
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            placeholder="Book name, class or board..."
            className="h-12 w-full rounded border pl-12 pr-10 text-gray-600"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <FiSettings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-3 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 ">
        {isError && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center text-red-500">
            <FiInfo className="mb-4 h-16 w-16" />
            <p className="text-xl font-bold text-gray-800">Error loading books</p>
            <p className="mt-2 text-gray-600">{JSON.stringify(error)}</p>
          </div>
        )}
        {!isError && filteredBooks?.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 rounded-full bg-gray-50 p-6">
              <FiBookmark className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">কোনো বই পাওয়া যায়নি</h3>
            <p className="text-gray-500">আপনার অনুসন্ধান বা ফিল্টার পরিবর্তন করে চেষ্টা করুন</p>
          </div>
        )}
        {filteredBooks?.map((card: any, index: number) => (
          <div
            key={index}
            onClick={() => router.push(`/user/read/${card.id}`)}
            className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/50 cursor-pointer"
          >
            {/* Image Container */}
            <div className="relative aspect-[3/4.2] w-full overflow-hidden bg-gray-100">
              <Image
                src={card.cover}
                alt={card.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-110"
                unoptimized
              />

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-white/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Floating Action Buttons */}
              <button className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-gray-700 backdrop-blur-sm transition-colors duration-300 hover:bg-red-50 hover:text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 z-10">
                <FiHeart className="h-3.5 w-3.5" />
              </button>

              {/* Hover Read Button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10">
                <button
                  onClick={() => router.push(`/user/read/${card.id}`)}
                  className="translate-y-4 transform rounded-full bg-blue-600 px-7 py-2.5 text-sm font-bold text-white shadow-xl shadow-white/30 ring-2 ring-white/40 transition-all duration-300 hover:scale-105 hover:bg-blue-700 hover:shadow-white/50 group-hover:translate-y-0"
                >
                  পড়ুন
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-3 text-center">
              <div className="mb-2">
                <h3 className="mb-0.5 text-sm font-bold leading-tight text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {card.name}
                </h3>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-purple-600/80">
                  {card?.class?.name}
                </p>
              </div>


            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
