"use client";
import React, { PropsWithChildren } from "react";
import { Button } from "./button";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

const SubmitButton = ({ children, className, ...props }: PropsWithChildren<{ className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>>) => {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      aria-disabled={pending} 
      disabled={pending} 
      className={`w-full mt-2 ${className || ""}`}
      {...props}
    >
      {pending ? (
        <span className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
          <span className="sr-only">Submitting...</span>
        </span>
      ) : (
        children
      )}
    </Button>
  );
};

export default SubmitButton;

