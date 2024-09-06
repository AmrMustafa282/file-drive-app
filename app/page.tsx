"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";

import { UploadButton } from "@/components/upload-button";
import { FileCard } from "@/components/file-card";
import Image from "next/image";
import { Loader } from "@/components/ui/Loader";

export default function Home() {
 const organization = useOrganization();
 const user = useUser();

 let orgId: string | undefined = undefined;
 if (organization.isLoaded && user.isLoaded) {
  orgId = organization.organization?.id ?? user.user?.id;
 }

 const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
 const isLoading = files === undefined;
 return (
  <main className="container mx-auto pt-12 ">
   {isLoading && (
    <div className="flex justify-center h-[80vh] items-center">
     <Loader />
    </div>
   )}

   {!files ||
    (files?.length === 0 && (
     <div className=" flex flex-col gap-4 h-[30vh] col-span-3 mt-12 relative ">
      <Image alt="empty-image" fill src={"/empty.svg"} />
      <p className=" text-2xl w-full text-center absolute -bottom-32 left-[50%] -translate-x-[50%] ">
       <p className="mb-6">You have no files, go ahead and upload one now</p>
       <UploadButton />
      </p>
     </div>
    ))}
   <div className="grid grid-cols-3 gap-4 w-full  ">
    {!isLoading && files?.length > 0 && (
     <div className="col-span-3 flex justify-between items-center mb-8 ">
      <h1 className="text-4xl font-bold">Your Files</h1>
      <UploadButton />
     </div>
    )}

    {files?.map((file) => {
     return <FileCard key={file._id} file={file} />;
    })}
   </div>
  </main>
 );
}
