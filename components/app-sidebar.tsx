"use client"

import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  Home,
  ClipboardPlus,
  FileText,
  FileQuestion,
  BarChart3,
  Settings,
  LogOut,
  Hexagon,
  Bookmark,
  User,
} from "lucide-react"
import Logo from "./common/logo"
import { ToggleTheme } from "./toggle-theme"
import Link from "next/link";
import { logOut } from "@/app/(auth)/actions"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Custom Tests", url: "/custom-test", icon: ClipboardPlus },
  { title: "Grand Tests", url: "/grand-tests", icon: FileText },
  { title: "Question Bank", url: "/qbank", icon: FileQuestion },
  { title: "Subject Polygons", url: "/polygons", icon: Hexagon },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleSignOut = async () => {
    try {
      const response = await logOut()
      if (response?.error) {
        toast.error("Failed to sign out")
        return
      }
      queryClient.invalidateQueries({ queryKey: ["user"] })
      toast.success("Signed out successfully")
      router.push("/login")
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <Sidebar className="">
      <SidebarHeader className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <Logo />
          <ToggleTheme />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`hover:bg-accent hover:text-accent-foreground transition-all duration-200 rounded-lg group ${isActive
                        ? "bg-accent text-accent-foreground font-medium border border-accent-foreground/10 shadow-sm"
                        : ""
                        }`}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-3 w-full py-4 relative"
                      >
                        <item.icon
                          className={`h-4 w-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"
                            }`}
                        />
                        <span className="font-medium">{item.title}</span>
                        {isActive && (
                          <div className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 rounded-lg"
            >
              <Link href="/profile" className="flex items-center gap-3">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 rounded-lg"
            >
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 rounded-lg cursor-pointer w-full flex items-center gap-3"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

        </SidebarMenu>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Version 2.1.0 • Made with ❤️
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
