import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React from "react";
import BoardList from "./BoardList";

export default function page() {
  return (
    <div>
      <Breadcrumb pageName="Board List" />
      <BoardList/>
    </div>
  );
}
