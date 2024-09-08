"use client";
import React from "react";
import FileBrowser from "../_components/file-browser";

export default function page() {
 return (
  <div>
   <FileBrowser title="Your Fevorites" deletedOnly />
  </div>
 );
}
