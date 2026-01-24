"use client";

import React from "react";
import TextWithFractions from "./TextWithFractions";

/**
 * Renders a "Stacked Fraction" where content is split by "//".
 * Example: "5 + 10 // []" -> "5 + 10" over empty space.
 */
const StackedFractionDisplay = ({ text }: { text: string }) => {
    if (!text) return null;

    let parts = text.split(";;");
    if (parts.length < 2) {
        parts = text.split("//");
    }

    // If no split, it's just regular text (though strictly it should have // for this type)
    if (parts.length < 2) {
        return <span>{text}</span>;
    }

    const numerator = parts[0];
    const denominator = parts[1]?.trim() || "";

    // Helper to render lines (handling newlines if any, matching StackFractionView logic)
    const renderContent = (content: string) => {
        if (!content) return <span className="invisible">Empty</span>;

        return (
            <div className="flex flex-col">
                {content.split(/\r?\n/).map((line, idx) => {
                    const isPlaceholder = line.trim() === "[]";
                    // If placeholder, render empty content (or invisible space if layout requires it).
                    // StackFractionView uses min-h-[0.75rem] for lines.
                    return (
                        <div key={idx} className="min-h-[1.2em] whitespace-nowrap">
                            {isPlaceholder ? <span className="invisible">[]</span> : <TextWithFractions text={line} />}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="inline-flex flex-col items-center align-middle mx-1">
            {/* Numerator */}
            <div className="w-full text-center border-b-2 border-current pb-0.5 px-1">
                {renderContent(numerator)}
            </div>
            {/* Denominator */}
            <div className="w-full text-center pt-0.5 px-1">
                {renderContent(denominator)}
            </div>
        </div>
    );
};

export default StackedFractionDisplay;
