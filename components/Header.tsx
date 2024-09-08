import { Button } from "@/components/ui/button";
import {
 OrganizationSwitcher,
 SignedOut,
 SignInButton,
 UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import logo from "@/public/logo.png";
import React from "react";
import Link from "next/link";

export default function Header() {
 return (
  <div className="border-b py-2 bg-gray-50 ">
   <div className="container mx-auto flex justify-between items-center">
    <Link href="/">
     <Image src={logo} alt="FileDrive" width={50} height={50} />
    </Link>
    {/* <div className="flex items-center gap-3 text-2xl ">
     File Drive
    </div> */}
    <div className=" flex gap-2">
     <OrganizationSwitcher />
     <UserButton />
     <SignedOut>
      <SignInButton>
       <Button>Sign In</Button>
      </SignInButton>
     </SignedOut>
    </div>
   </div>
  </div>
 );
}
