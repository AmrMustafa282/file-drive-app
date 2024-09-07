import React, { ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
 FileTextIcon,
 GanttChartIcon,
 ImageIcon,
 MoreVertical,
 StarHalf,
 StarIcon,
 TextIcon,
 Trash2,
} from "lucide-react";
import {
 AlertDialog,
 AlertDialogCancel,
 AlertDialogContent,
 AlertDialogDescription,
 AlertDialogFooter,
 AlertDialogHeader,
 AlertDialogTitle,
 AlertDialogTrigger,
} from "./ui/alert-dialog";
import { AlertDialogAction } from "@radix-ui/react-alert-dialog";
import { toast } from "sonner";
import Image from "next/image";

function FileCardActions({
 file,
 isFavorite,
}: {
 file: Doc<"files">;
 isFavorite: boolean;
}) {
 const deleteFile = useMutation(api.files.deleteFile);
 const toggleFavorite = useMutation(api.files.toggleFavorite);
 const handleDeleteFile = async (fileId: string) => {
  const deleteFilePromise = () =>
   new Promise(async (resolve, reject) => {
    try {
     await deleteFile({ fileId: file._id });
     resolve("success");
    } catch (error) {
     reject("error");
    }
   });

  toast.promise(deleteFilePromise, {
   loading: "Loading...",
   success: () => {
    return `File deleted successfully`;
   },
   error: "Something went wrong",
  });
 };
 const handleToggleFavorite = async (fileId: Id<"files">) => {
  try {
   const res = await toggleFavorite({ fileId: file._id });
   console.log(res);
   toast.success(res.message);
  } catch (error) {
   toast.error("Something went wrong");
  }
 };
 return (
  <DropdownMenu>
   <DropdownMenuTrigger asChild>
    <Button size={"icon"} variant={"ghost"}>
     <MoreVertical />
    </Button>
   </DropdownMenuTrigger>
   <DropdownMenuContent>
    <DropdownMenuLabel>Actions</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem asChild>
     <Button
      className="w-full justify-start gap-1 "
      variant={"ghost"}
      size={"sm"}
      onClick={() => {
       handleToggleFavorite(file._id);
      }}
     >
      {isFavorite ? (
       <>
        <StarIcon className="w-4 h-4 text-yellow-600 fill-yellow-500 " />
        <span>Unfevorite</span>
       </>
      ) : (
       <>
        <StarIcon className="w-4 h-4 " />
        <span>Fevorite</span>
       </>
      )}
     </Button>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
     <AlertDialog>
      <AlertDialogTrigger className="text-red-600 w-full">
       <Button
        className="w-full justify-start gap-1 px-2   "
        variant={"ghost"}
        size={"sm"}
       >
        <Trash2 className="w-4 h-4" /> <span>Delete</span>
       </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
       <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
         This action cannot be undone. This will permanently delete your account
         and remove your data from our servers.
        </AlertDialogDescription>
       </AlertDialogHeader>
       <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>
         <Button
          variant="destructive"
          onClick={() => {
           //  deleteFile({ fileId: file._id })
           handleDeleteFile(file._id);
          }}
         >
          Delete
         </Button>
        </AlertDialogAction>
       </AlertDialogFooter>
      </AlertDialogContent>
     </AlertDialog>
    </DropdownMenuItem>
   </DropdownMenuContent>
  </DropdownMenu>
 );
}

export function FileCard({
 file,
 favorites,
}: {
 file: Doc<"files"> & { url: string | null };
 favorites: Doc<"fevorites">[];
}) {
 const typeIcons = {
  image: <ImageIcon />,
  pdf: <FileTextIcon />,
  csv: <GanttChartIcon />,
 } as Record<Doc<"files">["type"], ReactNode>;
 //  console.log(file);

 const isFavorite = favorites.some((f) => f.fileId === file._id);
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex justify-between items-center ">
     <div className="flex gap-2 items-center">
      <p>{typeIcons[file.type]}</p>
      <p>{file.name}</p>
     </div>
     <FileCardActions file={file} isFavorite={isFavorite} />
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
   <CardFooter className="flex justify-center">
    <Button
     onClick={() => {
      if (file.url) {
       window.open(file.url, "_blank");
      }
     }}
    >
     Download
    </Button>
   </CardFooter>
  </Card>
 );
}
