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
  useSidebar,
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
  FileQuestionIcon,
} from "lucide-react"
import Logo from "./common/logo"
import { ToggleTheme } from "./toggle-theme"
import Link from "next/link";
import { logOut } from "@/app/(auth)/actions"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Custom Tests", url: "/custom-test", icon: FileQuestionIcon },
  { title: "Grand Tests", url: "/grand-tests", icon: FileText },
  { title: "Question Bank", url: "/qbank", icon: FileQuestion },
  { title: "Case Builder", url: "/case-builder", icon: ClipboardPlus },
  { title: "Subject Polygons", url: "/polygons", icon: Hexagon },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isMobile, setOpenMobile, state } = useSidebar()

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
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="border-b border-border/50 px-0 py-4 min-h-[73px] flex items-center justify-center">
        <div className="flex items-center justify-start w-full pl-4 gap-2">
          <Logo />
          {state === "expanded" && <span className="text-3xl font-bold tracking-tight uppercase">Prepnosis</span>}
        </div>
        {/* <ToggleTheme /> */}
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup className="px-0">
          <SidebarGroupLabel className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-4 mb-4 group-data-[collapsible=icon]:hidden">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {navigationItems.map((item) => {
                const isActive = pathname.startsWith(item.url)

                return (
                  <SidebarMenuItem key={item.title} className="flex justify-center">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      onClick={() => isMobile && setOpenMobile(false)}
                      className={cn(
                        "transition-all duration-300 rounded-xl group h-12 w-full flex items-center justify-start px-3",
                        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                        isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/15"
                          : "hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Link
                        href={item.url}
                        className="flex items-center gap-4 w-full"
                      >
                        <div className="flex shrink-0 items-center justify-center">
                          <item.icon
                            className={cn(
                              "h-[18px] w-[18px] transition-all duration-300",
                              isActive ? "text-primary scale-100 stroke-[2.5px]" : "group-hover:scale-110"
                            )}
                          />
                        </div>
                        <span className={`font-semibold text-[14px] tracking-tight group-data-[collapsible=icon]:hidden whitespace-nowrap ${isActive ? "text-primary" : ""}`}>
                          {item.title}
                        </span>
                        {isActive && state === "expanded" && (
                          <div className="absolute right-3 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
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

      <SidebarFooter className="border-t border-border/50 p-2 bg-accent/5">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton
              asChild
              tooltip="Profile"
              className={cn(
                "hover:bg-accent transition-all duration-200 rounded-xl h-11 w-full flex items-center justify-start px-3",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <Link href="/profile" className="flex items-center gap-4">
                <User className="h-18 w-18 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton
              asChild
              tooltip="Settings"
              className={cn(
                "hover:bg-accent transition-all duration-200 rounded-xl h-11 w-full flex items-center justify-start px-3",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <Link href="/settings" className="flex items-center gap-4">
                <Settings className="h-18 w-18 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex justify-center">
            <SidebarMenuButton
              tooltip="Sign Out"
              onClick={handleSignOut}
              className={cn(
                "hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-xl h-11 w-full flex items-center justify-start px-3",
                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              )}
            >
              <LogOut className="h-18 w-18 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden font-medium text-sm">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
