// src/components/ui/toaster.tsx
"use client";

import { useToast, type Toast } from "../../hooks/use-toast";
import { Toast as ToastComp, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, ...props }: Toast) {
        return (
          <ToastComp key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            <ToastClose />
          </ToastComp>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
