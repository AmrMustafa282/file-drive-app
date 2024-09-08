import React from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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
 Download,
 FolderSync,
 MoreVertical,
 StarIcon,
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
import { ConvexError } from "convex/values";

export function FileCardActions({
 file,
 isFavorite,
}: {
 file: Doc<"files"> & {
  url: string | null;
  user: { name: string; image: string };
 };
 isFavorite: boolean;
}) {
 const deleteFile = useMutation(api.files.deleteFile);
 const restoreFile = useMutation(api.files.restoreFile);
 const toggleFavorite = useMutation(api.files.toggleFavorite);

 const handleDeleteFile = async (fileId: string) => {
  const deleteFilePromise = () =>
   new Promise(async (resolve, reject) => {
    try {
     await deleteFile({ fileId: file._id });
     resolve("success");
    } catch (error) {
     reject(error);
    }
   });

  toast.promise(deleteFilePromise, {
   loading: "Loading...",
   success: () => {
    return `File marked for deletion, Your file will be deleted in 30 days`;
   },
   error: (err) => {
    if (err instanceof ConvexError) {
     console.log(err.message);
     return (
      err.message.split("Uncaught ConvexError:")[1]?.trim().split("at")[0] ||
      "An error occurred"
     );
    } else {
     return "Something went wrong";
    }
   },
  });
 };
 const handleRestoreFile = async (fileId: string) => {
  const restoreFilePromise = () =>
   new Promise(async (resolve, reject) => {
    try {
     await restoreFile({ fileId: file._id });
     resolve("success");
    } catch (error) {
     reject(error);
    }
   });

  toast.promise(restoreFilePromise, {
   loading: "Loading...",
   success: () => {
    return `File has been restored.`;
   },
   error: (err) => {
    if (err instanceof ConvexError) {
     console.log(err.message);
     return (
      err.message.split("Uncaught ConvexError:")[1]?.trim().split("at")[0] ||
      "An error occurred"
     );
    } else {
     return "Something went wrong";
    }
   },
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
     <Button
      className="w-full justify-start gap-1 "
      variant={"ghost"}
      size={"sm"}
      onClick={() => {
       if (file.url) {
        window.open(file.url, "_blank");
       }
      }}
     >
      <Download className="w-4 h-4" />
      <span>Download</span>
     </Button>
    </DropdownMenuItem>
    <DropdownMenuItem asChild>
     {/* <Protect role={"org:admin"} fallback={<></>}> */}
     <AlertDialog>
      <AlertDialogTrigger className="w-full">
       {file.shouldDelete ? (
        <Button
         className="w-full justify-start gap-1 px-2  text-green-600 hover:text-green-500 "
         variant={"ghost"}
         size={"sm"}
        >
         <FolderSync className="w-4 h-4" /> <span>Restore</span>
        </Button>
       ) : (
        <Button
         className="w-full justify-start gap-1 px-2 text-red-600 hover:text-red-500 "
         variant={"ghost"}
         size={"sm"}
        >
         <Trash2 className="w-4 h-4" /> <span>Delete</span>
        </Button>
       )}
      </AlertDialogTrigger>
      <AlertDialogContent>
       <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
         {file.shouldDelete ? (
          <span>
           This action will restore the file to its original location.
          </span>
         ) : (
          <span>
           This action will mark the file for deletion, you can restore it
           within 30 days or it will be permanently deleted.
          </span>
         )}
        </AlertDialogDescription>
       </AlertDialogHeader>
       <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>
         {file.shouldDelete ? (
          <Button
           variant={"outline"}
           className="bg-green-600 hover:bg-green-500 text-white hover:text-white"
           onClick={() => {
            handleRestoreFile(file._id);
           }}
          >
           Restore
          </Button>
         ) : (
          <Button
           variant="destructive"
           onClick={() => {
            handleDeleteFile(file._id);
           }}
          >
           Delete
          </Button>
         )}
        </AlertDialogAction>
       </AlertDialogFooter>
      </AlertDialogContent>
     </AlertDialog>
     {/* </Protect> */}
    </DropdownMenuItem>
   </DropdownMenuContent>
  </DropdownMenu>
 );
}
