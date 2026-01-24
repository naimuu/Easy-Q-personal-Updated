import React from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import UserList from "./_components/UserList";

export default function UsersPage() {
  return (
    <div>
      <Breadcrumb pageName="Users" />
      <div className="flex flex-col gap-9">
        <UserList />
      </div>
    </div>
  );
}
