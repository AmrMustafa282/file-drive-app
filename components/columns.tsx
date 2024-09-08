"use client";

import { Doc } from "@/convex/_generated/dataModel";
import { ColumnDef } from "@tanstack/react-table";
import { formatRelative } from "date-fns";
import { Avatar, AvatarImage } from "./ui/avatar";
import { FileCardActions } from "./file-actions";

export const columns: ColumnDef<
 Doc<"files"> & {
  url: string | null;
  user: { name: string; image: string };
  isFavorite: boolean;
 }
>[] = [
 {
  accessorKey: "name",
  header: "Name",
 },
 {
  header: "User",
  cell: ({ row }) => {
   return (
    <div className="flex items-center gap-2">
     <Avatar>
      <AvatarImage src={row.original.user.image} />
     </Avatar>
     <div>{row.original.user.name}</div>
    </div>
   );
  },
 },
 {
  accessorKey: "type",
  header: "Type",
 },
 {
  header: "Uploaded",
  cell: ({ row }) => {
   return (
    <div>
     {formatRelative(new Date(row.original._creationTime), new Date())}
    </div>
   );
  },
 },
 {
  header: "Actions",
  cell: ({ row }) => {
   return (
    <div>
     <FileCardActions
      file={row.original}
      isFavorite={row.original.isFavorite}
     />
    </div>
   );
  },
 },
];
