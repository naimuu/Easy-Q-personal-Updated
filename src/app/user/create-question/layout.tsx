"use client";

import React from "react";
import { QuestionProvider } from "./components/QuestionContext";

export default function CreateQuestionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <QuestionProvider>{children}</QuestionProvider>;
}
