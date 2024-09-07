import { zodResolver } from "@hookform/resolvers/zod";
import React, { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
 Form,
 FormControl,
 FormField,
 FormItem,
 FormLabel,
 FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SearchIcon } from "lucide-react";

const formSchema = z.object({
 query: z.string().min(0).max(200),
});

export function SearchBar({
 query,
 setQuery,
}: {
 query: string;
 setQuery: Dispatch<SetStateAction<string>>;
}) {
 // 1. Define your form.
 const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
   query: "",
  },
 });
 // 2. Define a submit handler.
 async function onSubmit(values: z.infer<typeof formSchema>) {
  setQuery(values.query);
 }

 return (
  <div className="flex-grow px-12">
   <Form {...form}>
    <form
     onSubmit={form.handleSubmit(onSubmit)}
     className="flex gap-2 w-full justify-center"
    >
     <FormField
      control={form.control}
      name="query"
      render={({ field }) => (
       <FormItem>
        <FormControl>
         <Input placeholder="file name" {...field} />
        </FormControl>
        <FormMessage />
       </FormItem>
      )}
     />

     <Button type="submit" className="flex gap-2" size={"sm"}>
      {/* {isSubmitting && <Spinner />} */}
      <SearchIcon />
     </Button>
    </form>
   </Form>
  </div>
 );
}
