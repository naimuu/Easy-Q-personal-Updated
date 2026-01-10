"use client";

import { ReactNode } from "react";
// import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import Button from "./Button";
// import { Button } from "@/components/ui/button";

type SimpleDialogProps = {
  triggerLabel?: string;
  children: ReactNode;
};

export function SimpleDialog({
  triggerLabel = "Open Dialog",
  children,
}: SimpleDialogProps) {
  return (
    // <Dialog>
    //   <DialogTrigger asChild>
    //     <Button mode="outline">{triggerLabel}</Button>
    //   </DialogTrigger>
    //   <DialogContent className="sm:max-w-[425px]">{children}</DialogContent>
    // </Dialog>
    <></>
  );
}
