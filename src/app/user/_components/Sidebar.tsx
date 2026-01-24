"use client";

import { useState } from "react";
import {
  FiPlus,
  FiHome,
  FiBook,
  FiDownload,
  FiUsers,
  FiMenu,
  FiUser,
  FiCreditCard,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon } from "@/components/Layouts/header/user-info/icons";

const sidebarItems = [
  { icon: FiPlus, label: "Create New", href: "/user/create-question" },
  { icon: FiHome, label: "Home", href: "/user" },
  { icon: FiBook, label: "Books", href: "/user/books" },
  { icon: FiDownload, label: "Download", href: "/user/downloads" },
  { icon: FiUsers, label: "Institute", href: "/user/institutes" },
  { icon: FiCreditCard, label: "Subscriptions", href: "/user/subscriptions" },
  { icon: LogOutIcon, label: "LogOut", href: "/auth/logout" },
  { icon: FiUser, label: "Profile", href: "/user/profile" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const Item = ({ icon: Icon, label, href, active }: any) => (
    <Link href={href} passHref>
      <div className="flex flex-col items-center space-y-1">
        <div
          className={`rounded-lg p-2 ${active ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600"
            }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={`text-[10px] font-medium ${active ? "text-purple-600" : "text-gray-600"
            }`}
        >
          {label}
        </span>
      </div>
    </Link>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed z-40 hidden h-screen w-20 border-r bg-white lg:flex">
        <div className="flex w-full flex-col items-center justify-between py-6">
          {/* Top Items */}
          <div className="flex flex-col items-center gap-4">
            {sidebarItems.slice(0, -1).map((item, idx) => (
              <Item
                key={idx}
                {...item}
                active={
                  pathname === item.href ||
                  (item.label === "Books" && pathname.startsWith("/user/read"))
                }
              />
            ))}
          </div>

          {/* Bottom Item (Logout) */}
          <div className="pb-2">
            <Item
              {...sidebarItems[sidebarItems.length - 1]}
              active={pathname === sidebarItems[sidebarItems.length - 1].href}
            />
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b bg-white p-4 lg:hidden">
        <button onClick={() => setIsOpen(true)}>
          <FiMenu className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="font-semibold">Easy Q</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
          <FiUser className="h-4 w-4" />
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex h-full w-20 flex-col justify-between border-r bg-white p-3">
            <div className="flex flex-col items-center gap-4">
              {sidebarItems.slice(0, -1).map((item, idx) => (
                <Item
                  key={idx}
                  {...item}
                  active={
                    pathname === item.href ||
                    (item.label === "Books" &&
                      pathname.startsWith("/user/read"))
                  }
                />
              ))}
            </div>
            <div className="pb-2">
              <Item
                {...sidebarItems[sidebarItems.length - 1]}
                active={pathname === sidebarItems[sidebarItems.length - 1].href}
              />
            </div>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}
