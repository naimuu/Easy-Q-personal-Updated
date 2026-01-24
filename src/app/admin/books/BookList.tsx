"use client";
import React, { useState } from "react";
import Loader from "@/components/shared/Loader";
import ModalLayout from "@/components/Layouts/ModalLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteBookMutation,
  useGetBooksQuery,
} from "@/redux/services/adminServices";
import Image from "next/image";
import { toast } from "react-toastify";
import Button from "@/components/shared/Button";
import AddBook from "./AddBooks";

function BookList() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const { data, isLoading, refetch } = useGetBooksQuery();
  const [deleteApi, { isLoading: deleting }] = useDeleteBookMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteApi(id).unwrap();
      toast.success("Deleted");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <Loader />;

  return (
    <ModalLayout
      modalComponent={
        <AddBook
          close={() => {
            setIsOpen(false);
            refetch();
            setEditingBook(null);
          }}
          defaultValue={editingBook}
        />
      }
      onChange={() => {
        setIsOpen(false);
        setEditingBook(null);
      }}
      isOpen={isOpen}
    >
      <div className="overflow-hidden rounded-[10px] bg-white shadow">
        <div className="flex items-center justify-between px-6 py-4">
          <Button className="w-auto" onClick={() => setIsOpen(true)}>
            Add New
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cover</TableHead>
              <TableHead>Book Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Total Chapters</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((book, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Image
                    src={book.cover}
                    width={60}
                    height={50}
                    unoptimized
                    alt="Book Cover"
                    className="rounded object-cover"
                  />
                </TableCell>
                <TableCell>{book.name}</TableCell>
                <TableCell>{book.class?.name}</TableCell>
                <TableCell>{book._count?.chapter}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={() => {
                        setEditingBook({
                          id: book.id,
                          name: book.name,
                          cover: book.cover,
                          classId: book.classId,
                        });
                        setIsOpen(true);
                      }}
                      className="bg-yellow-500 text-white"
                    >
                      Edit
                    </Button>
                    <Button
                      loading={deleting && deletingId === book.id}
                      onClick={() => {
                        const confirmed = window.confirm(
                          "Are you sure you want to delete this book?",
                        );
                        if (confirmed) {
                          handleDelete(book.id);
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

export default BookList;
