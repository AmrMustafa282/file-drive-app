import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import React from "react";

export function Spinner({ className }: { className?: string }) {
 return (
  <Loader2 className={cn(`h-4 w-4 text-gray-700 animate-spin`, className)} />
 );
}
