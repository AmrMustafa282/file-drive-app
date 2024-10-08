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
import { DataTable } from "@/components/file-table";
import { columns } from "@/components/columns";
import { Doc } from "@/convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Grid3X3, TableOfContents } from "lucide-react";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function PlacHolder() {
 return (
  <div className=" flex flex-col gap-4 h-[30vh] col-span-4 mt-12 relative ">
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
 const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

 let orgId: string | undefined = undefined;
 if (organization.isLoaded && user.isLoaded) {
  orgId = organization.organization?.id ?? user.user?.id;
 }

 const files = useQuery(
  api.files.getFiles,
  orgId
   ? {
      orgId,
      type: type === "all" ? undefined : type,
      query,
      favorite: favoritesOnly,
      deletedOnly,
     }
   : "skip"
 );
 const favorites = useQuery(
  api.files.getAllFavorites,
  orgId ? { orgId } : "skip"
 );
 const isLoading = files === undefined;
 const modifiedFiles = files?.map((file) => ({
  ...file,
  isFavorite: favorites?.some((f) => f.fileId === file._id),
 }));

 return (
  <div>
   <div className="grid grid-cols-4 gap-4 w-full  ">
    <>
     <div className="col-span-4 flex justify-between items-center mb-8 ">
      <h1 className="text-4xl font-bold">{title}</h1>
      <SearchBar query={query} setQuery={setQuery} />
      <UploadButton />
     </div>

     {files?.length === 0 && <PlacHolder />}
     {files?.length !== 0 && (
      <Tabs defaultValue="grid" className="col-span-4 ">
       <div className="flex gap-4 justify-between  mb-6 ">
        <TabsList>
         <TabsTrigger value="grid" className="gap-1">
          <Grid3X3 />
          <span>Grid</span>
         </TabsTrigger>
         <TabsTrigger value="table" className="gap-1">
          <TableOfContents />
          <span>Table</span>
         </TabsTrigger>
        </TabsList>
        <div className="flex gap-2 items-center">
         <Label htmlFor="type-select">Type Filter</Label>
         <Select
          onValueChange={(newType) => setType(newType as any)}
          value={type}
         >
          <SelectTrigger id="type-select" className="w-[180px]">
           <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
           <SelectItem value="all">All</SelectItem>
           <SelectItem value="image">Image</SelectItem>
           <SelectItem value="pdf">PDF</SelectItem>
           <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
         </Select>
        </div>
       </div>
       {isLoading && (
        <div className="flex justify-center h-[80vh] items-center">
         <Loader />
        </div>
       )}
       <TabsContent value="grid">
        <div className="grid grid-cols-4 gap-4">
         {modifiedFiles?.map((file) => {
          return (
           <FileCard
            key={file._id}
            file={
             file as Doc<"files"> & {
              url: string | null;
              user: { name: string; image: string };
              isFavorite: boolean;
             }
            }
           />
          );
         })}
        </div>
       </TabsContent>
       <TabsContent value="table">
        <DataTable
         //@ts-ignore
         columns={columns}
         data={modifiedFiles || []}
        />
       </TabsContent>
      </Tabs>
     )}
    </>
   </div>
  </div>
 );
}
