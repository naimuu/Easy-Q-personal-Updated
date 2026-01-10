"use client";

import React, { useState } from "react";
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
  useDeleteClassMutation,
  useGetClassesQuery,
} from "@/redux/services/adminServices";
import AddClass from "./AddClass";
import Button from "@/components/shared/Button";

function ClassList() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<{
    id: string;
    name: string;
    boardId: string;
  } | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useGetClassesQuery();
  const [deleteApi] = useDeleteClassMutation();

  const deleteClass = async (id: string) => {
    try {
      setDeleteLoadingId(id);
      await deleteApi(id).unwrap();
      toast.success("Deleted");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed!");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <ModalLayout
      modalComponent={
        <AddClass
          close={() => {
            refetch();
            setIsOpen(false);
            setEditingClass(null);
          }}
          defaultValue={editingClass}
        />
      }
      onChange={() => {
        setIsOpen(false);
        setEditingClass(null);
      }}
      isOpen={isOpen}
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow-1 ">
        <div className="flex items-center justify-between gap-4 px-6 py-4">
          <Button onClick={() => setIsOpen(true)} className="w-auto">
            Add New
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3">
              <TableHead className="pl-5">Class Name</TableHead>
              <TableHead>Board</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((cls, i) => (
              <TableRow key={i} className="text-base font-medium text-dark">
                <TableCell className="pl-5">{cls.name}</TableCell>
                <TableCell>{cls.board?.name}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        setEditingClass({
                          id: cls.id,
                          name: cls.name,
                          boardId: cls.boardId,
                        });
                        setIsOpen(true);
                      }}
                      className="bg-yellow-500 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      loading={deleteLoadingId === cls.id}
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Are you sure you want to delete this class?",
                        );
                        if (confirmed) {
                          deleteClass(cls.id);
                        }
                      }}
                      className="bg-red-500 text-white"
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

export default ClassList;
