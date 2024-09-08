import React, { ReactNode } from "react";
import {
 Card,
 CardContent,
 CardFooter,
 CardHeader,
 CardTitle,
} from "./ui/card";

import { Doc } from "@/convex/_generated/dataModel";
import { FileTextIcon, GanttChartIcon, ImageIcon } from "lucide-react";

import Image from "next/image";
import { Avatar, AvatarImage } from "./ui/avatar";
import { formatRelative } from "date-fns";
import { FileCardActions } from "./file-actions";

export function FileCard({
 file,
}: {
 file: Doc<"files"> & {
  url: string | null;
  user: { name: string; image: string };
  isFavorite: boolean;
 };
}) {
 const typeIcons = {
  image: <ImageIcon />,
  pdf: <FileTextIcon />,
  csv: <GanttChartIcon />,
 } as Record<Doc<"files">["type"], ReactNode>;
 //  console.log(file);

 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex justify-between items-center ">
     <div className="flex gap-2 items-center">
      <p>{typeIcons[file.type]}</p>
      <p>{file.name}</p>
     </div>
     <FileCardActions file={file} isFavorite={file.isFavorite} />
    </CardTitle>
    {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
   </CardHeader>
   <CardContent className="h-[200px] flex justify-center items-center ">
    {file.type === "image" && file.url && (
     <Image src={file.url} width={200} height={200} alt={file.name} />
    )}
    {file.type === "csv" && <GanttChartIcon className="w-20 h-20" />}
    {file.type === "pdf" && <FileTextIcon className="w-20 h-20" />}
   </CardContent>
   <CardFooter className=" text-gray-500 text-sm gap-2  ">
    <Avatar>
     <AvatarImage src={file.user.image} alt={file.user.name} />
    </Avatar>
    <div>
     <p>{file.user.name}</p>
     {formatRelative(new Date(file._creationTime), new Date())}
    </div>
   </CardFooter>
  </Card>
 );
}
