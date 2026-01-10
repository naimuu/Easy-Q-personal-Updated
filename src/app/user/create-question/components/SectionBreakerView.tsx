"use client";
import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { useQuestionContext } from "./QuestionContext";
import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";
import * as Accordion from "@radix-ui/react-accordion";

export default function SectionBreakerView({
    group,
    isArrangeMode,
}: {
    group: any;
    isArrangeMode: boolean;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const { questionList, setQuestionList, removeGroup } = useQuestionContext();

    const updateGroup = (id: string, updates: any) => {
        const updatedList = questionList.map((g) =>
            g.id === id ? { ...g, ...updates } : g
        );
        setQuestionList(updatedList);
    };

    return (
        <div>
            <Accordion.Item
                value={group.id}
                className="group-header rounded-lg border border-dashed border-gray-400 bg-gray-50 shadow-sm"
            >
                <div className={`p-3 ${isArrangeMode ? "hover:cursor-move" : ""}`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 text-center">
                            {isEditing ? (
                                <input
                                    autoFocus
                                    value={group.name}
                                    onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                                    onBlur={() => setIsEditing(false)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") setIsEditing(false);
                                    }}
                                    className="w-full rounded border p-2 text-lg font-bold"
                                />
                            ) : (
                                <h3
                                    onDoubleClick={() => setIsEditing(true)}
                                    className="cursor-text text-lg font-bold underline decoration-2 underline-offset-4"
                                    title="Double click to edit"
                                >
                                    {group.name || "Section Break"}
                                </h3>
                            )}
                        </div>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete Section Break"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            </Accordion.Item>

            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={() => removeGroup(group.id)}
                title="সেকশন ব্রেকার মুছে ফেলুন"
                description="আপনি কি নিশ্চিত যে আপনি এই সেকশন ব্রেকারটি মুছে ফেলতে চান?"
            />
        </div>
    );
}
