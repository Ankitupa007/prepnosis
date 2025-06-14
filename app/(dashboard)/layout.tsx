import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
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
