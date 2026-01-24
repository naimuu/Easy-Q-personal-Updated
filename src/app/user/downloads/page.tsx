"use client";

import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import { DownloadIcon } from "@/components/Tables/icons";
import {
  useDeleteExamQuestionsMutation,
  useGetExamQuestionsQuery,
  useGetInstitutesQuery,
  useGetUserBoardQuery,
  useGetUserClassQuery,
} from "@/redux/services/userService";
import html2pdf from "html2pdf.js";
import { Pencil, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import content from "./content";

export default function DownloadPage() {
  const { data: institute, isLoading: insLoading } = useGetInstitutesQuery({});
  const { data: classes, isLoading: clsLoading } = useGetUserClassQuery();
  const { data: boards, isLoading: boardLoading } = useGetUserBoardQuery();
  const [selectedIns, setSelectedIns] = useState("");
  const [selectedCls, setSelectedCls] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("");
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const router = useRouter();
  const [deleteApi, { isLoading: deleting }] = useDeleteExamQuestionsMutation();
  const { data, isLoading, refetch } = useGetExamQuestionsQuery({
    classId: selectedCls,
    boardId: selectedBoard,
    instituteId: selectedIns,
    sort: sort,
    search: "",
    download: "ok",
  });
  //console.log(data)
  useEffect(() => {
    refetch();
  }, []);

  const filteredData = (data || []).filter((item: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      item?.subject?.toLowerCase().includes(s) ||
      item?.className?.toLowerCase().includes(s) ||
      item?.examName?.examName?.toLowerCase().includes(s)
    );
  });

  const sortedData = [...(filteredData)].sort((a: any, b: any) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (sort === "old") return dateA - dateB;
    return dateB - dateA; // Default to newest first
  });

  const handleGenerate = async (set: any) => {
    const cont = content(set);
    if (!cont) return;

    try {
      const opt = {
        margin: 0.8,
        filename: `${set?.subject}-${set?.className}-${set?.examName?.examName}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          logging: false,
          letterRendering: true,
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css"], // only respect CSS, not "legacy"
          avoid: ".avoid-break", // prevent breaks in avoid-break
        },
      };
      html2pdf().set(opt).from(cont).save();
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDocForEdit, setSelectedDocForEdit] = useState<any>(null);

  const handleEditClick = (doc: any) => {
    setSelectedDocForEdit(doc);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (selectedDocForEdit) {
      // Navigate to create question page with clone_id
      // page=2 corresponds to ExamInfo form
      router.push(`/user/create-question?page=2&clone_id=${selectedDocForEdit.id}`);
      setIsEditModalOpen(false);
      setSelectedDocForEdit(null);
    }
  };

  if (insLoading || clsLoading || boardLoading) return <Loader />;
  return (
    <>
      <div className="mx-auto max-w-7xl rounded-xl shadow-sm md:bg-white md:p-6">
        {/* Filters and Toggle */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
          {/* Search */}
          <div className="relative w-full max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Exam name..."
              className="h-10 w-full rounded-full border pl-10 pr-4 text-sm text-gray-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center justify-center rounded-md p-2 transition-all ${viewMode === "grid" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              title="Grid View (Book Cover)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center justify-center rounded-md p-2 transition-all ${viewMode === "list" ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              title="List View (PDF Style)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" /></svg>
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center">
          {/* Madrasaha Name */}
          <select
            value={selectedIns}
            onChange={(e) => {
              setSelectedIns(e.target.value);
              setSelectedBoard("");
              setSelectedCls("");
            }}
            className="h-10 w-full rounded-lg border px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-1/4"
          >
            <option value={""}>Select Institute</option>
            {institute?.map((d: any) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Board Name */}
          <select
            value={selectedBoard}
            onChange={(e) => {
              setSelectedBoard(e.target.value);
              setSelectedCls("");
            }}
            className="h-10 w-full rounded-lg border px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-1/4"
          >
            <option value={""}>Select Board</option>
            {boards?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Class Name */}
          <select
            value={selectedCls}
            onChange={(e) => setSelectedCls(e.target.value)}
            className="h-10 w-full rounded-lg border px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-1/4"
          >
            <option value={""}>Select Class</option>
            {classes
              ?.filter((s) => s.boardId === selectedBoard)
              ?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>

          {/* Sort By */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 w-full rounded-lg border px-3 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-1/4"
          >
            <option value={""}>Sort by</option>
            <option value={""}>Newest</option>
            <option value={"old"}>Oldest</option>
          </select>
        </div>

        {isLoading && <Loader />}

        {/* Books Grid/List */}
        <div>
          {viewMode === "list" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedData?.map((doc, index) => (
                <div
                  key={index}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
                >
                  {/* Thumbnail Section - PDF ICON */}
                  <div
                    className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded bg-red-50 text-red-500 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8">
                      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
                      <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
                    </svg>
                  </div>

                  {/* Content Section */}
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <div className="flex flex-col gap-0.5">
                      <h3
                        className="truncate text-base font-bold text-gray-800"
                        title={`${doc?.subject} (${doc?.className})`}
                      >
                        {doc?.subject} <span className="text-sm font-normal text-gray-500">({doc?.className})</span>
                      </h3>
                      <p
                        className="truncate text-sm font-medium text-gray-500"
                        title={doc?.examName?.examName}
                      >
                        {doc?.examName?.examName}
                      </p>
                    </div>

                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {doc.durationHour}h {doc.durationMinute}m
                      </span>
                      <span className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
                        {doc.totalMarks}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      {new Date(doc.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 border-l border-gray-100 pl-3">
                    <button
                      onClick={() => handleGenerate(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all hover:bg-primary/10 hover:text-primary"
                      title="Download PDF"
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all hover:bg-blue-50 hover:text-blue-600"
                      title="Edit Project"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Are you sure you want to delete this?")) return;
                        const toastId = toast.loading("Deleting...");
                        try {
                          await deleteApi({ id: doc.id }).unwrap();
                          toast.update(toastId, {
                            render: "Deleted successfully!",
                            type: "success",
                            isLoading: false,
                            autoClose: 2000,
                          });
                          refetch();
                        } catch (err) {
                          toast.update(toastId, {
                            render: "Failed to delete",
                            type: "error",
                            isLoading: false,
                            autoClose: 2000,
                          });
                        }
                      }}
                      disabled={deleting}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500 transition-all hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Grid View (Book Cover Style) */
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {sortedData?.map((doc, index) => (
                <div key={index} className="group flex flex-col items-center">
                  <div
                    className="relative mb-3 h-48 w-full overflow-hidden rounded-lg shadow-md transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl"
                  >
                    <Image
                      src={doc?.book?.cover}
                      alt={doc?.book?.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {/* Hover Overlay with Actions */}
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerate(doc);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform hover:scale-110"
                        title="Download PDF"
                      >
                        <DownloadIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(doc);
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-lg transition-transform hover:scale-110"
                        title="Edit Project"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!confirm("Are you sure you want to delete this?")) return;
                          const toastId = toast.loading("Deleting...");
                          try {
                            await deleteApi({ id: doc.id }).unwrap();
                            toast.update(toastId, {
                              render: "Deleted successfully!",
                              type: "success",
                              isLoading: false,
                              autoClose: 2000,
                            });
                            refetch();
                          } catch (err) {
                            toast.update(toastId, {
                              render: "Failed to delete",
                              type: "error",
                              isLoading: false,
                              autoClose: 2000,
                            });
                          }
                        }}
                        disabled={deleting}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-lg transition-transform hover:scale-110"
                        title="Delete"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="w-full text-center">
                    <h3
                      className="w-full truncate text-sm font-bold text-gray-800"
                      title={`${doc?.subject} (${doc?.className})`}
                    >
                      {doc?.subject} <span className="font-normal text-gray-500">({doc?.className})</span>
                    </h3>
                    <p
                      className="w-full truncate text-xs font-medium text-gray-500"
                      title={doc?.examName?.examName}
                    >
                      {doc?.examName?.examName}
                    </p>
                    <p className="mt-1 text-[10px] text-gray-400">{new Date(doc.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {sortedData?.length === 0 && (
          <div className="relative h-[300px] w-full">
            <Image
              src={"/empty.svg"}
              fill
              className="object-contain"
              unoptimized
              alt="empty"
            />
          </div>
        )}

        {/* Confirmation Modal */}
        <ModalLayout
          isOpen={isEditModalOpen}
          onChange={() => setIsEditModalOpen(false)}
          title="নতুন প্রজেক্ট তৈরি করুন"
          description="এটি আপনার নতুন প্রজেক্ট তৈরি করবে এবং ব্যালেন্স থেকে ১টি প্রশ্ন কেটে নেওয়া হবে"
          className="z-[9999]"
          modalSize="md"
          modalComponent={
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                বাতিল
              </button>
              <Button
                onClick={handleConfirmEdit}
              >
                তৈরি করুন
              </Button>
            </div>
          }
        >
          <></>
        </ModalLayout>
      </div>
    </>
  );
}
