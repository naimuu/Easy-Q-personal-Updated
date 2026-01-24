"use client";

import Loader from "@/components/shared/Loader";
import { Select } from "@/components/shared/Select";
import {
  useGetBoardsQuery,
  useGetClassesQuery,
  useGetBooksQuery,
} from "@/redux/services/adminServices";
import React from "react";

interface Option {
  label: string;
  value: string;
}

interface HeaderProps {
  selectBoard: string;
  setSelectBoard: (val: string) => void;
  selectClass: string;
  setSelectClass: (val: string) => void;
  selectBook: string;
  setSelectBook: (val: string) => void;
}

export default function Header({
  selectBoard,
  setSelectBoard,
  selectClass,
  setSelectClass,
  selectBook,
  setSelectBook,
}: HeaderProps) {
  const { data: boards, isLoading: BLoad } = useGetBoardsQuery();
  const { data: classes, isLoading: ClassLoad } = useGetClassesQuery();
  const { data: books, isLoading: BookLoad } = useGetBooksQuery();

  if (BLoad || ClassLoad || BookLoad) return <Loader />;

  const boardsItems: Option[] =
    boards?.map((d) => ({ label: d.name, value: d.id })) || [];

  const classItems: Option[] =
    classes
      ?.filter((c) => c.boardId === selectBoard)
      .map((d) => ({ label: d.name, value: d.id })) || [];

  const bookItems: Option[] =
    books
      ?.filter((b) => b.classId === selectClass)
      .map((d) => ({ label: d.name, value: d.id })) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select
        items={boardsItems}
        placeholder="Select board"
        label="Board"
        setValue={(val) => {
          setSelectBoard(val);
          setSelectClass("");
          setSelectBook("");
        }}
        defaultValue={selectBoard}
      />

      {selectBoard && (
        <Select
          items={classItems}
          placeholder="Select class"
          label="Class"
          setValue={(val) => {
            setSelectClass(val);
            setSelectBook("");
          }}
          defaultValue={selectClass}
        />
      )}

      {selectClass && (
        <Select
          items={bookItems}
          placeholder="Select book"
          label="Book"
          setValue={(val) => setSelectBook(val)}
          defaultValue={selectBook}
        />
      )}
    </div>
  );
}
