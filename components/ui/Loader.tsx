
import React from "react";
import { FallingLines } from "react-loader-spinner";

export function Loader({
 className,
 color,
}: {
 className?: string;
 color?: string;
}) {
 return (
  <div className={className}>
   <FallingLines color={color || "#000"} width="200" visible={true} />
  </div>
 );
}
