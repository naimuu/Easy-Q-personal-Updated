"use client";

import React, { useState } from "react";
import Link from "next/link";
import ModalLayout from "@/components/Layouts/ModalLayout";
import Loader from "@/components/shared/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "react-toastify";
import {
  useDeleteBoardMutation,
  useGetBoardsQuery,
} from "@/redux/services/adminServices";
import AddBoard from "./AddBoard";
import Button from "@/components/shared/Button";

function BoardList() {
  const [isOpen, setIsopen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, refetch } = useGetBoardsQuery();
  const [deleteApi, { isLoading: deleteLoader }] = useDeleteBoardMutation();

  const deleteBoard = async (id: string) => {
    try {
      await deleteApi(id).unwrap();
      toast.success("Deleted");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed!");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <ModalLayout
      modalComponent={
        <AddBoard
          close={() => {
            refetch();
            setIsopen(false);
            setEditingBoard(null);
          }}
          defaultValue={editingBoard}
        />
      }
      onChange={() => {
        setIsopen(false);
        setEditingBoard(null);
      }}
      isOpen={isOpen}
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-1">
        <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-7 sm:py-5 xl:px-8.5">
          <Button onClick={() => setIsopen(true)} className="w-auto">
            Add New
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
              <TableHead className="min-w-[120px] pl-5 sm:pl-6 xl:pl-7.5">
                Board Name
              </TableHead>
              <TableHead>Total Class</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="pr-5 text-right sm:pr-6 xl:pr-7.5">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((board, i) => (
              <TableRow key={i} className="text-base font-medium text-y">
                <TableCell className="pl-5 sm:pl-6 xl:pl-7.5">
                  {board.name}
                </TableCell>
                <TableCell>{board._count?.classes || 0}</TableCell>
                <TableCell>
                  {new Date(board.createdAt).toDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex w-full justify-end gap-2">
                    <Button
                      onClick={() => {
                        setEditingBoard({ id: board.id, name: board.name });
                        setIsopen(true);
                      }}
                      className="bg-yellow-500 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      loading={deleteLoader}
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Are you sure you want to delete this board?",
                        );
                        if (confirmed) {
                          deleteBoard(board.id);
                        }
                      }}
                      className="border-none bg-red-500 text-white"
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ModalLayout>
  );
}

export default BoardList;
