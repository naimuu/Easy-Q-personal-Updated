import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React from "react";
import QuestionList from "./QuestionList";

export default function page() {
  return (
    <div>
      <Breadcrumb pageName="Questions" />
      <QuestionList/>
    </div>
  );
}
