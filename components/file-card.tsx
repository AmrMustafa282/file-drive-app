import React from "react";
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
import { Doc } from "@/convex/_generated/dataModel";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
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

function FileCardActions({ file }: { file: Doc<"files"> }) {
 const deleteFile = useMutation(api.files.deleteFile);
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
     <AlertDialog>
      <AlertDialogTrigger className="flex items-center px-2  gap-2 text-red-600 w-full">
       <Trash2 className="w-4 h-4" /> <span>Delete</span>
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

export function FileCard({ file }: { file: Doc<"files"> }) {
 return (
  <Card>
   <CardHeader>
    <CardTitle className="flex justify-between items-center">
     <p>{file.name}</p>

     <FileCardActions file={file} />
    </CardTitle>
    {/* <CardDescription>Deploy your new project in one-click.</CardDescription> */}
   </CardHeader>
   <CardContent>
    <p>card content</p>
   </CardContent>
   <CardFooter className="flex justify-between">
    <Button>Download</Button>
   </CardFooter>
  </Card>
 );
}
