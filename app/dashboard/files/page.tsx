import React from "react";
import FileBrowser from "../_components/file-browser";

export default function page() {
 return (
  <div>
   {/* <h1 className="text-4xl font-bold">Your Files</h1> */}
   <FileBrowser title="Your Files" />
  </div>
 );
}
