"use client";

import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { ThemeToggleSwitch } from "./theme-toggle";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="black:border-stroke-black black:bg-gray-black sticky top-0 z-9 flex items-center justify-between border-b border-stroke bg-white px-4 py-5 shadow-1 md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="black:border-stroke-black black:bg-[#020D1A] hover:black:bg-[#FFFFFF1A] rounded-lg border px-1.5 py-1 lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            unoptimized
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="black:text-white mb-0.5 text-heading-5 font-bold text-black">
          Dashboard
        </h1>
        <p className="font-medium">Easy Q Admin Dashboard</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        {/* <div className="relative w-full max-w-[300px]">
          <input
            type="search"
            placeholder="Search"
            className="flex w-full items-center gap-3.5 rounded-full border bg-gray-2 py-3 pl-[53px] pr-5 outline-none transition-colors focus-visible:border-primary black:border-black-3 black:bg-black-2 black:hover:border-black-4 black:hover:bg-black-3 black:hover:text-black-6 black:focus-visible:border-primary"
          />

          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
        </div> */}

        {/* <ThemeToggleSwitch /> */}

        {/* <Notification /> */}

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
