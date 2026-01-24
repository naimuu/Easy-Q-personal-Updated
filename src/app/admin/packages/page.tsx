import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import PackageList from "./_components/PackageList";

export default function PackagesPage() {
  return (
    <div>
      <Breadcrumb pageName="Packages" />
      <div className="flex flex-col gap-9">
        <PackageList />
      </div>
    </div>
  );
}
