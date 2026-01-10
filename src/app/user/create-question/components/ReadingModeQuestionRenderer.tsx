import { PlusCircle } from "lucide-react";
import React from "react";
import ObjectiveView from "./ObjectiveView";
import PassageView from "./PassageView";
import TextWithFractions from "./TextWithFractions";

const ReadingModeQuestionRenderer = ({
    questions,
    categoryType,
    renderStackFractionVertical,
    readOnly = true,
}: {
    questions: any[];
    categoryType: string;
    renderStackFractionVertical: (q: string) => React.ReactNode;
    readOnly?: boolean;
}) => {

    // Helper to generate a dummy ID if needed, though mostly not used in read-only
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const renderQuestion = (doc: any, i: number) => {
        // In reading mode, selection logic is likely not needed or different.
        // For now, we assume no "selection" highlighting is needed or it's always false.
        const isSelected = false;

        if (categoryType === "word") {
            return (
                <div
                    key={doc.id}
                    className={`flex w-fit items-center justify-between gap-1 rounded-sm border bg-gray-50 border-gray-100 shadow-sm px-2 py-1 transition-colors`}
                >
                    <span className="flex-1"><TextWithFractions text={doc.question} /></span>
                </div>
            );
        }

        if (
            categoryType === "single-question" ||
            categoryType === "fill-gap" ||
            categoryType === "right-wrong" ||
            categoryType === "no"
        ) {
            return (
                <div
                    key={doc.id}
                    className={`flex justify-between gap-1 rounded-sm border bg-gray-50 border-gray-100 shadow-sm px-2 py-1 transition-colors`}
                >
                    <div className="flex-1"><TextWithFractions text={doc.question} /></div>{" "}
                </div>
            );
        }

        if (categoryType === "table") {
            return (
                <div
                    key={doc.id}
                    className={`relative flex flex-col gap-1 overflow-x-auto rounded-sm border bg-gray-50 border-gray-100 shadow-sm px-2 py-1 transition-colors`}
                >
                    <div
                        dangerouslySetInnerHTML={{ __html: doc.table }}
                        className="custom-table"
                    />
                </div>
            );
        }

        if (categoryType === "objective") {
            return (
                <ObjectiveView
                    key={doc.id}
                    onClick={() => { }}
                    doc={doc}
                    index={i}
                    isSelected={isSelected}
                    readOnly={readOnly}
                />
            );
        }

        if (categoryType === "passage-based") {
            return (
                <PassageView
                    key={doc.id}
                    onEdit={(d) => { }}
                    handleDelete={() => { }}
                    s={doc}
                    category={{ type: categoryType }} // PassageView might need category object
                    addQuestion={() => { }}
                />
            );
        }

        if (categoryType === "stack-fraction") {
            return (
                <div
                    key={doc.id}
                    className={`flex items-center gap-1 rounded-sm border bg-gray-50 border-gray-100 shadow-sm px-2 py-1 text-black transition-colors`}
                >
                    <span className="flex-1">
                        {renderStackFractionVertical(doc.question)}
                    </span>
                </div>
            );
        }

        return null;
    };

    return (
        <div className={
            categoryType === "word"
                ? "flex flex-wrap gap-1"
                : categoryType === "stack-fraction"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "flex flex-col gap-2"
        }>
            {questions.map((q: any, i: number) =>
                renderQuestion(q, i)
            )}
        </div>
    );
};

export default ReadingModeQuestionRenderer;
