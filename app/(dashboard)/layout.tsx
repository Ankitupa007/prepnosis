import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full mx-auto">
        {children}
      </main>
    </SidebarProvider>
  </div>;
}
