"use client";

import { CustomCursor } from "./CustomCursor";
import { Chatbot } from "./Chatbot";
import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

export function LayoutClientEffects() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") || pathname?.startsWith("/chef");

  return (
    <>
      <CustomCursor />
      <Toaster position="top-right" theme="dark" />
      {!isAdmin && <Chatbot />}
    </>
  );
}
