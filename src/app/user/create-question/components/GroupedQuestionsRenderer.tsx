
import { PlusCircle, CheckCircle } from "lucide-react";
import React, { useMemo } from "react";
import ObjectiveView from "./ObjectiveView";
import PassageView from "./PassageView";

const GroupedQuestionsRenderer = ({
    category,
    questionList,
    addQuestion,
    renderStackFractionVertical,
    generateId,
    readOnly,
    hideHeaders,
}: {
    category: any;
    questionList: any[];
    addQuestion: (d: any) => void;
    renderStackFractionVertical: (q: string) => React.ReactNode;
    generateId: () => string;
    readOnly?: boolean;
    hideHeaders?: boolean;
}) => {
    const groups = useMemo(() => {
        const sorted = [...(category?.questions || [])].sort((a: any, b: any) => {
            const chapA = a.lesson?.chapter?.id || "";
            const chapB = b.lesson?.chapter?.id || "";
            if (chapA !== chapB) return chapA.localeCompare(chapB);
            return (a.lesson?.id || "").localeCompare(b.lesson?.id || "");
        });

        const chGroups: any[] = [];
        let currentChap: any = null;
        let currentLesson: any = null;

        sorted.forEach((q) => {
            const chapId = q.lesson?.chapter?.id || "unknown";
            const chapName = q.lesson?.chapter?.name || "Other";
            const lessonId = q.lesson?.id || "unknown";
            const lessonName = q.lesson?.name || "Other";

            if (!currentChap || currentChap.id !== chapId) {
                currentChap = {
                    id: chapId,
                    name: chapName,
                    lessons: [],
                };
                chGroups.push(currentChap);
                currentLesson = null;
            }

            if (!currentLesson || currentLesson.id !== lessonId) {
                currentLesson = {
                    id: lessonId,
                    name: lessonName,
                    questions: [],
                };
                currentChap.lessons.push(currentLesson);
            }

            currentLesson.questions.push(q);
        });

        return chGroups;
    }, [category?.questions]);

    const renderQuestion = (doc: any, i: number) => {
        // Updated isSelected logic: Check if the question exists in ANY group in the question list
        const isSelected = questionList.some((group) =>
            group.questions?.some((q: any) => q.id === doc.id)
        );

        if (category.type === "word") {
            return (
                <div
                    key={doc.id}
                    className={`flex w-fit items-center justify-between gap-1 rounded-sm border ${isSelected ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100 shadow-sm hover:bg-blue-100"} px-2 py-1 transition-colors`}
                >
                    <span className="flex-1">{doc.question}</span>
                    <div className="flex items-center gap-1">
                        {isSelected ? (
                            <CheckCircle
                                onClick={() => {
                                    addQuestion({ ...category, questions: doc });
                                }}
                                size={18}
                                className="cursor-pointer text-blue-500 transition-colors hover:text-red-500"
                            />
                        ) : (
                            <PlusCircle
                                onClick={() => {
                                    addQuestion({ ...category, questions: doc });
                                }}
                                className={`cursor-pointer text-blue-600 hover:text-blue-800 transition-colors ${readOnly ? "hidden" : ""}`}
                                size={18}
                            />
                        )}
                    </div>
                </div>
            );
        }

        if (
            category.type === "single-question" ||
            category.type === "fill-gap" ||
            category.type === "right-wrong" ||
            category.type === "no"
        ) {
            const isNoSelect = questionList.find((s: any) => s.name === doc.question);
            return (
                <div
                    key={doc.id}
                    className={`flex justify-between gap-1 rounded-sm border ${isSelected ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100 shadow-sm hover:bg-blue-100"} px-2 py-1 transition-colors`}
                >
                    {doc.question}{" "}
                    {isSelected ? (
                        <CheckCircle
                            onClick={() => {
                                addQuestion({
                                    ...category,
                                    questions: doc,
                                });
                            }}
                            size={24}
                            className="cursor-pointer text-blue-500 transition-colors hover:text-red-500"
                        />
                    ) : (
                        <>
                            {!isSelected && category.type !== "no" && (
                                <PlusCircle
                                    onClick={() => {
                                        addQuestion({
                                            ...category,
                                            questions: doc,
                                        });
                                    }}
                                    className={`cursor-pointer text-blue-600 hover:text-blue-800 transition-colors ${readOnly ? "hidden" : ""}`}
                                    size={24}
                                />
                            )}
                            {!isNoSelect && category.type === "no" && (
                                <PlusCircle
                                    onClick={() => {
                                        addQuestion({
                                            ...category,
                                            name: doc.question,
                                            id: generateId(),
                                            questions: [],
                                        });
                                    }}
                                    className={`cursor-pointer text-blue-600 hover:text-blue-800 transition-colors ${readOnly ? "hidden" : ""}`}
                                    size={24}
                                />
                            )}
                        </>
                    )}
                </div>
            );
        }

        if (category.type === "table") {
            return (
                <div
                    key={doc.id}
                    className={`relative flex flex-col gap-1 overflow-x-auto rounded-sm border ${isSelected ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100 shadow-sm hover:bg-blue-100"} px-2 py-1 transition-colors`}
                >
                    <div
                        dangerouslySetInnerHTML={{ __html: doc.table }}
                        className="custom-table"
                    />
                    {isSelected ? (
                        <div className="absolute right-1 top-1">
                            <CheckCircle
                                onClick={() => {
                                    addQuestion({ ...category, questions: doc });
                                }}
                                size={24}
                                className="cursor-pointer text-blue-500 transition-colors hover:text-red-500"
                            />
                        </div>
                    ) : (
                        <PlusCircle
                            onClick={() => {
                                addQuestion({ ...category, questions: doc });
                            }}
                            className={`absolute right-1 top-1 cursor-pointer text-blue-600 hover:text-blue-800 transition-colors ${readOnly ? "hidden" : ""}`}
                            size={24}
                        />
                    )}
                </div>
            );
        }

        if (category.type === "objective") {
            return (
                <ObjectiveView
                    key={doc.id}
                    onClick={() => {
                        addQuestion({ ...category, questions: doc });
                    }}
                    doc={doc}
                    index={i}
                    isSelected={isSelected}
                    readOnly={readOnly}
                />
            );
        }

        if (category.type === "passage-based") {
            return (
                <PassageView
                    key={doc.id}
                    onEdit={(d) => { }}
                    handleDelete={() => { }}
                    s={doc}
                    category={category}
                    addQuestion={addQuestion}
                />
            );
        }

        if (category.type === "stack-fraction") {
            return (
                <div
                    key={doc.id}
                    className={`flex items-center gap-1 rounded-sm border ${isSelected ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100 shadow-sm hover:bg-blue-100"} px-2 py-1 text-black transition-colors`}
                >
                    <span className="flex-1">
                        {renderStackFractionVertical(doc.question)}
                    </span>
                    {isSelected ? (
                        <CheckCircle
                            onClick={() => {
                                addQuestion({ ...category, questions: doc });
                            }}
                            size={18}
                            className="cursor-pointer text-blue-500 transition-colors hover:text-red-500"
                        />
                    ) : (
                        <PlusCircle
                            onClick={() => {
                                addQuestion({ ...category, questions: doc });
                            }}
                            className={`cursor-pointer text-blue-600 hover:text-blue-800 transition-colors ${readOnly ? "hidden" : ""}`}
                            size={18}
                        />
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="flex flex-col gap-4">
            {groups.map((chap: any) => (
                <div key={chap.id} className="relative">
                    {!hideHeaders && chap.name !== "Other" && (
                        <div className="sticky top-[46px] z-20 mb-1 flex w-full justify-center border-b border-gray-200/50 bg-white/90 px-2 py-1 text-sm font-bold text-blue-600 backdrop-blur-md backdrop-filter">
                            {chap.name}
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        {chap.lessons.map((lesson: any) => (
                            <div key={lesson.id} className="relative">
                                {!hideHeaders && lesson.name !== "Other" && (
                                    <div className="sticky top-[76px] z-10 mb-1 flex w-full justify-center border-b border-gray-100/50 bg-white/90 px-4 py-1 text-xs font-semibold text-green-600 backdrop-blur-md backdrop-filter">
                                        {lesson.name}
                                    </div>
                                )}
                                <div
                                    className={
                                        category.type === "word"
                                            ? "flex flex-wrap gap-1"
                                            : "flex flex-col gap-1"
                                    }
                                >
                                    {lesson.questions.map((q: any, i: number) =>
                                        renderQuestion(q, i),
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GroupedQuestionsRenderer;
