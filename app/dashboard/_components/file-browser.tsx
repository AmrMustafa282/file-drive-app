"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { UploadButton } from "@/components/upload-button";
import { FileCard } from "@/components/file-card";
import Image from "next/image";
import { Loader } from "@/components/ui/Loader";
import { SearchBar } from "@/components/search-bar";
import { useState } from "react";

function PlacHolder() {
 return (
  <div className=" flex flex-col gap-4 h-[30vh] col-span-3 mt-12 relative ">
   <Image alt="empty-image" fill src={"/empty.svg"} />
   <p className=" text-2xl w-full text-center absolute -bottom-32 left-[50%] -translate-x-[50%] ">
    <p className="mb-6">You have no files, go ahead and upload one now</p>

    <UploadButton />
   </p>
  </div>
 );
}

export default function FileBrowser({
 title,
 favoritesOnly,
 deletedOnly,
}: {
 title: string;
 favoritesOnly?: boolean;
 deletedOnly?: boolean;
}) {
 const organization = useOrganization();
 const user = useUser();
 const [query, setQuery] = useState("");

 let orgId: string | undefined = undefined;
 if (organization.isLoaded && user.isLoaded) {
  orgId = organization.organization?.id ?? user.user?.id;
 }

 const files = useQuery(
  api.files.getFiles,
  orgId ? { orgId, query, favorite: favoritesOnly, deletedOnly } : "skip"
 );
 const favorites = useQuery(
  api.files.getAllFavorites,
  orgId ? { orgId } : "skip"
 );
 const isLoading = files === undefined;
 return (
  <div>
   {isLoading && (
    <div className="flex justify-center h-[80vh] items-center">
     <Loader />
    </div>
   )}

   <div className="grid grid-cols-3 gap-4 w-full  ">
    {!isLoading && (
     <>
      <div className="col-span-3 flex justify-between items-center mb-8 ">
       <h1 className="text-4xl font-bold">{title}</h1>
       <SearchBar query={query} setQuery={setQuery} />
       <UploadButton />
      </div>
      {files?.length === 0 && <PlacHolder />}
     </>
    )}

    {files?.map((file) => {
     return <FileCard key={file._id} file={file} favorites={favorites || []} />;
    })}
   </div>
  </div>
 );
}
