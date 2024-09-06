"use client";

import { api } from "@/convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";

import { Button } from "@/components/ui/button";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogHeader,
 DialogTitle,
 DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Spinner } from "./ui/Spinner";
import { Doc } from "@/convex/_generated/dataModel";

const formSchema = z.object({
 title: z.string().min(1).max(200),
 file: z
  .custom<FileList>((val) => val instanceof FileList, "Required")
  .refine((files) => files.length > 0, "Required"),
});

export function UploadButton() {
 const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const organization = useOrganization();
 const user = useUser();
 const generateUploadUrl = useMutation(api.files.generateUploadUrl);

 // 1. Define your form.
 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
   title: "",
   file: undefined,
  },
 });
 const fileRef = form.register("file");
 // 2. Define a submit handler.
 async function onSubmit(values: z.infer<typeof formSchema>) {
  const uploadFilePromise = () =>
   new Promise(async (resolve, reject) => {
    if (!orgId) return;
    try {
     setIsSubmitting(true);
     // Step 1: Get a short-lived upload URL
     const postUrl = await generateUploadUrl();

     // Step 2: POST the file to the URL
     const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
     });

     const { storageId } = await result.json();

     const types = {
      "image/png": "image",
      "image/jpeg": "image",
      "image/jpg": "image",
      "application/pdf": "pdf",
      "text/csv": "csv",
     } as Record<string, Doc<"files">["type"]>;
     // Step 3: Save the newly allocated storage id to the database
     const newFile = await createFile({
      name: values.title,
      fileId: storageId,
      type: types[values.file[0].type],
      orgId,
     });

     resolve(newFile); // Resolve the promise with the new file data
    } catch (error) {
     reject(error); // Reject the promise if any error occurs
    } finally {
     form.reset();
     setIsFileDialogOpen(false);
     setIsSubmitting(false);
    }
   });

  toast.promise(uploadFilePromise, {
   loading: "Uploading file...",
   success: (newFile) => `File uploaded successfully`,
   error: "Failed to upload the file",
  });
 }

 let orgId: string | undefined = undefined;
 if (organization.isLoaded && user.isLoaded) {
  orgId = organization.organization?.id ?? user.user?.id;
 }
 //  console.log(organization?.id);
 const createFile = useMutation(api.files.createFile);
 return (
  <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
   <DialogTrigger asChild>
    <Button>Upload File</Button>
   </DialogTrigger>
   <DialogContent>
    <DialogHeader>
     <DialogTitle className="mb-8">Upload Your File Here</DialogTitle>
     <DialogDescription>
      <Form {...form}>
       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
         control={form.control}
         name="title"
         render={({ field }) => (
          <FormItem>
           <FormLabel>Title</FormLabel>
           <FormControl>
            <Input placeholder="file name" {...field} />
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <FormField
         control={form.control}
         name="file"
         render={() => (
          <FormItem>
           <FormLabel>File</FormLabel>
           <FormControl>
            <Input type="file" {...fileRef} />
           </FormControl>
           <FormMessage />
          </FormItem>
         )}
        />
        <Button type="submit" disabled={isSubmitting} className="flex gap-2">
         {isSubmitting && <Spinner />}
         Submit
        </Button>
       </form>
      </Form>
     </DialogDescription>
    </DialogHeader>
   </DialogContent>
  </Dialog>
 );
}
