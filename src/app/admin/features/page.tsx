import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import React from "react";
import FeatureList from "./_components/FeatureList";

export default function Page() {
  return (
    <div>
      <Breadcrumb pageName="Features Management" />
      <FeatureList />
    </div>
  );
}
