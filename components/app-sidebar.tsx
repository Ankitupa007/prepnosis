"use client"
import { usePathname } from "next/navigation"
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
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    isActive: true,
  },
  {
    title: "Custom Tests",
    url: "/custom-test",
    icon: ClipboardPlus,
  },
  {
    title: "Grand Tests",
    url: "/grand-tests",
    icon: FileText,
  },
  {
    title: "Question Bank",
    url: "/qbank",
    icon: FileQuestion,
  },
  {
    title: "Analytics",
    url: "/dashboard/performance",
    icon: BarChart3,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar className="border-r border-gray-200/50 bg-white/95 backdrop-blur-sm">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#66C3C1] to-[#4A9B99] bg-clip-text text-transparent">
              prepnosis
            </h1>
            <p className="text-xs text-gray-500">Medical Exam Prep</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
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
                      className={`hover:bg-[#66C3C1]/10 hover:text-[#66C3C1] transition-all duration-200 rounded-lg group ${isActive
                        ? 'bg-gradient-to-r from-[#66C3C1]/20 to-[#66C3C1]/10 text-[#66C3C1] font-bold border-0 border-[#66C3C1] shadow-sm'
                        : ''
                        }`}
                    >
                      <a href={item.url} className="flex items-center gap-3 w-full py-4">
                        <item.icon className={`h-4 w-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-105'
                          }`} />
                        <span className="font-bold">{item.title}</span>
                        {/* {isActive && (<div className="absolute right-2 w-2 h-2 bg-[#66c3c1] rounded-full"></div>)} */}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-gray-100 p-4">
        {/* Settings and Logout */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-gray-100 transition-colors duration-200 rounded-lg"
            >
              <a href="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg"
            >
              <a href="/logout" className="flex items-center gap-3">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Version 2.1.0 • Made with ❤️
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}