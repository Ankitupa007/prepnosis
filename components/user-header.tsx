"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "./ui/sidebar"
import UserAuthState from "./user-auth-state"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Fragment } from "react"

// Configuration for custom breadcrumb labels and excluded paths
const breadcrumbConfig = {
  // Custom labels for specific paths
  labels: {
    "/dashboard": "Dashboard",
    "/grand-tests": "Grand Tests",
    "/custom-tests": "Custom Tests",
    "/qbank": "Q Bank",
    "/profile": "Profile",
    "/settings": "Settings",
    // Add more custom labels as needed
  } as Record<string, string>,
  // Paths to exclude from breadcrumbs (they won't show up)
  excludePaths: ["/api", "/auth"],
  // Maximum number of breadcrumbs to show before collapsing
  maxItems: 4,
}

// Helper function to format path segments into readable labels
const formatPathSegment = (segment: string): string => {
  // Remove hyphens and underscores, capitalize words
  return segment
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// Generate breadcrumb items from the current pathname
const generateBreadcrumbs = (pathname: string) => {
  // Handle root path
  if (pathname === "/dashboard") {
    return [{ href: "/dashboard", label: breadcrumbConfig.labels["/dashboard"] || "Home", isLast: true }]
  }

  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = []

  // Always include home
  breadcrumbs.push({
    href: "/dashboard",
    label: breadcrumbConfig.labels["/dashboard"] || "Daashboard",
    isLast: false
  })

  // Build breadcrumbs for each segment
  segments.forEach((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")

    // Skip if path is in excludePaths
    if (breadcrumbConfig.excludePaths.includes(href)) {
      return
    }

    const isLast = index === segments.length - 1
    const label = breadcrumbConfig.labels[href] || formatPathSegment(segment)

    breadcrumbs.push({
      href,
      label,
      isLast
    })
  })

  return breadcrumbs
}

// Component to handle collapsed breadcrumbs
const CollapsedBreadcrumbs = ({ items }: { items: Array<{ href: string; label: string }> }) => {
  return (
    <BreadcrumbItem>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-1 hover:bg-muted px-2 py-1 rounded">
          <BreadcrumbEllipsis className="size-4" />
          <span className="sr-only">Show more breadcrumbs</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {items.map((item, index) => (
            <DropdownMenuItem key={index} asChild>
              <Link href={item.href}>{item.label}</Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </BreadcrumbItem>
  )
}

const UserHeader = ({ text }: { text: string }) => {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  // Handle collapsing if there are too many breadcrumbs
  const shouldCollapse = breadcrumbs.length > breadcrumbConfig.maxItems
  let displayBreadcrumbs = breadcrumbs
  let collapsedItems: Array<{ href: string; label: string }> = []

  if (shouldCollapse) {
    // Show first item, collapsed items, and last 2 items
    const firstItem = breadcrumbs[0]
    const lastTwoItems = breadcrumbs.slice(-2)
    collapsedItems = breadcrumbs.slice(1, -2)

    displayBreadcrumbs = [firstItem, ...lastTwoItems]
  }

  return (
    <div>
      <header className="bg-background/80 backdrop-blur-sm border-border border-b sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger variant={"secondary"} className="p-3 rounded-full w-10 h-10" />
            <div className="hidden md:block font-semibold">
              <Breadcrumb>
                <BreadcrumbList>
                  {displayBreadcrumbs.map((breadcrumb, index) => (
                    <Fragment key={breadcrumb.href}>
                      {/* Show collapsed items after first breadcrumb */}
                      {index === 1 && shouldCollapse && collapsedItems.length > 0 && (
                        <>
                          <CollapsedBreadcrumbs items={collapsedItems} />
                          <BreadcrumbSeparator />
                        </>
                      )}

                      <BreadcrumbItem>
                        {breadcrumb.isLast ? (
                          <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>

                      {/* Add separator if not the last item */}
                      {!breadcrumb.isLast && (
                        <BreadcrumbSeparator />
                      )}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserAuthState />
          </div>
        </div>
      </header>
    </div>
  )
}

export default UserHeader