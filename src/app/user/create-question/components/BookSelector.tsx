"use client";

import Loader from "@/components/shared/Loader";
import { useGetInstitutesQuery, useGetUserBoardQuery, useGetUserBooksQuery } from "@/redux/services/userService";
import Image from "next/image";
import { useState } from "react";
import { BiError, BiRightArrow } from "react-icons/bi";

export default function BookSelector({
    onSelect,
    onCancel,
}: {
    onSelect: (book: any) => void;
    onCancel: () => void;
}) {
    const { data: boardList, isLoading: boardLoading } = useGetUserBoardQuery();
    const [selectedBoard, setSelectedBoard] = useState("");
    const classList = boardList?.find((d: any) => d.id === selectedBoard)?.classes;
    const [selectedClass, setSelectedClass] = useState("");
    const { data: books, isLoading: bookLoading } = useGetUserBooksQuery({
        classId: selectedClass,
        boardId: selectedBoard,
    });

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800">Select a Book</h2>
                <button
                    onClick={onCancel}
                    className="rounded-full bg-gray-100 px-4 py-1 text-sm font-semibold text-gray-600 hover:bg-gray-200"
                >
                    Cancel
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                {/* Board Select */}
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Select Board</label>
                    <select
                        value={selectedBoard}
                        onChange={(e) => {
                            setSelectedBoard(e.target.value);
                            setSelectedClass("");
                        }}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm focus:outline-none"
                    >
                        <option value="">-- Select Board --</option>
                        {boardList?.map((item: any, index: number) => (
                            <option key={index} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabs */}
                {selectedBoard && (
                    <div className="mb-8">
                        <div className="flex items-center gap-3 overflow-x-auto px-1 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            <button
                                onClick={() => setSelectedClass("")}
                                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${selectedClass === ""
                                    ? "scale-105 bg-purple-600 text-white shadow-lg shadow-purple-200"
                                    : "border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-gray-50 hover:text-purple-600"
                                    }`}
                            >
                                All Classes
                            </button>
                            {classList?.map((tab: any, i: number) => (
                                <button
                                    onClick={() => setSelectedClass(tab.id)}
                                    key={i}
                                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${tab.id === selectedClass
                                        ? "scale-105 bg-purple-600 text-white shadow-lg shadow-purple-200"
                                        : "border border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-gray-50 hover:text-purple-600"
                                        }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Book Grid */}
                <div className="min-h-[300px]">
                    {!selectedBoard && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-purple-100">
                                <BiRightArrow className="text-4xl text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Select a Board</h3>
                            <p className="mt-2 text-gray-600">Please select a board to view books</p>
                        </div>
                    )}

                    {selectedBoard && (
                        <>
                            {bookLoading && <Loader />}

                            {!bookLoading && books?.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                        <BiError className="text-4xl text-red-500" />
                                    </div>
                                    <h3 className="mt-4 text-xl font-semibold text-gray-800">No Books Found</h3>
                                    <p className="mt-2 text-gray-600">Please try a different class.</p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {!bookLoading &&
                                    books?.map((card: any, index: number) => (
                                        <div
                                            onClick={() => onSelect(card)}
                                            key={index}
                                            className="group relative flex cursor-pointer items-stretch overflow-hidden rounded-lg border bg-white shadow transition-all hover:shadow-md hover:ring-2 hover:ring-purple-500"
                                        >
                                            <div className="relative w-24 shrink-0 bg-gray-200">
                                                <Image
                                                    src={card.cover || "/placeholder.png"}
                                                    alt={card.name}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between p-3">
                                                <div>
                                                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-purple-700">
                                                        {card.name}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {card?.class?.name} • {card?.class?.board?.name}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
