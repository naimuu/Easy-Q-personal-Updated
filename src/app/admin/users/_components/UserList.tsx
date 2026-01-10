"use client";

import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from "@/redux/services/adminServices";
import { Edit2, Eye, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import AddUserForm from "./AddUserForm";
import UserDetailsModal from "./UserDetailsModal";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  isAdmin: boolean;
  credit: number;
  createAt: string;
  passwordUpdateAt: string;
  _count: {
    institute: number;
    question_set: number;
    exams: number;
    subscriptions: number;
    payments: number;
  };
}

function UserList() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminFilter, setAdminFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    isAdmin: adminFilter === "all" ? undefined : adminFilter === "admin",
  });

  const [deleteUser] = useDeleteUserMutation();

  const users = data?.users || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await deleteUser(userId).unwrap();
      toast.success("User deleted successfully!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsOpen(true);
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    setIsDetailsOpen(true);
  };

  const handleAddSuccess = () => {
    refetch();
    setIsOpen(false);
    setEditingUser(null);
    toast.success(editingUser ? "User updated!" : "User created!");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) return <Loader />;

  return (
    <>
      <ModalLayout
        modalSize="4xl"
        modalComponent={
          <AddUserForm
            close={() => {
              setIsOpen(false);
              setEditingUser(null);
            }}
            onSuccess={handleAddSuccess}
            defaultValue={editingUser || undefined}
          />
        }
        onChange={() => {
          setIsOpen(false);
          setEditingUser(null);
        }}
        isOpen={isOpen}
      >
        <></>
      </ModalLayout>

      <UserDetailsModal
        user={viewingUser}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setViewingUser(null);
        }}
      />

      <div className="overflow-hidden rounded-[10px] bg-white shadow-1">
        <div className="flex flex-col gap-4 px-6 py-4 sm:px-7 sm:py-5 xl:px-8.5">
          <div className="flex items-center justify-between">
            <h3 className="text-title-md2 font-bold text-black">
              Total Users: {pagination.total || 0}
            </h3>
            <Button
              onClick={() => {
                setEditingUser(null);
                setIsOpen(true);
              }}
              className="w-auto"
            >
              Add New User
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <Button type="submit" className="px-4 py-2">
                Search
              </Button>
            </form>

            <select
              value={adminFilter}
              onChange={(e) => {
                setAdminFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">All Users</option>
              <option value="admin">Admins Only</option>
              <option value="user">Regular Users</option>
            </select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-t text-base [&>th]:h-auto [&>th]:py-3 sm:[&>th]:py-4.5">
              <TableHead className="min-w-[150px] pl-5 sm:pl-6 xl:pl-7.5">
                Name
              </TableHead>
              <TableHead className="min-w-[200px]">Email/Phone</TableHead>
              <TableHead className="min-w-[80px]">Role</TableHead>
              <TableHead className="min-w-[80px]">Credit</TableHead>
              <TableHead className="min-w-[100px]">Question Sets</TableHead>
              <TableHead className="min-w-[100px]">Subscriptions</TableHead>
              <TableHead className="min-w-[120px]">Joined</TableHead>
              <TableHead className="pr-5 text-right sm:pr-6 xl:pr-7.5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user: User) => (
                <TableRow key={user.id} className="text-base font-medium">
                  <TableCell className="pl-5 sm:pl-6 xl:pl-7.5">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {user.phone && (
                        <span className="text-sm text-gray-500">
                          {user.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        user.isAdmin
                          ? "bg-purple-200 text-purple-900 hover:bg-purple-300"
                          : "bg-blue-200 text-blue-900 hover:bg-blue-300"
                      }`}
                    >
                      {user.isAdmin ? "Admin" : "User"}
                    </button>
                  </TableCell>
                  <TableCell className="text-gray-700">{user.credit}</TableCell>
                  <TableCell className="text-gray-700">
                    {user._count.question_set}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {user._count.subscriptions}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {new Date(user.createAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="pr-5 text-right sm:pr-6 xl:pr-7.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(user)}
                        className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(user)}
                        className="rounded-lg bg-blue-100 p-2 text-blue-700 transition-colors hover:bg-blue-200"
                        title="Edit user"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        className="rounded-lg bg-red-200 p-2 text-red-900 transition-colors hover:bg-red-300"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  <p className="text-bodydark2">No users found</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 sm:px-7 xl:px-8.5">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default UserList;
