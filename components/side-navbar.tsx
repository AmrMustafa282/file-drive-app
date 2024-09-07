"use client";
import { FileIcon, StarIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function SideNavbar() {
 const pathname = usePathname();

 return (
  <div className="w-40 flex flex-col gap-2">
   <Link href={"/dashboard/files"}>
    <Button
     variant={"ghost"}
     className={clsx("justify-start gap-2 w-full", {
      "bg-gray-200": pathname === "/dashboard/files",
     })}
    >
     <FileIcon /> <span>All Files</span>
    </Button>
   </Link>
   <Link href={"/dashboard/favorites"}>
    <Button
     variant={"ghost"}
     className={clsx("justify-start gap-2 w-full", {
      "bg-gray-200 ": pathname === "/dashboard/favorites",
     })}
    >
     <StarIcon /> <span>Fevorites</span>
    </Button>
   </Link>
  </div>
 );
}
