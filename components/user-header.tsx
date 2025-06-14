import { SidebarTrigger } from "./ui/sidebar"
import UserAuthState from "./user-auth-state"

const UserHeader = ({ text }: { text: string }) => {
  return <div>
    <header className="bg-background/80 backdrop-blur-sm border-border border-b sticky top-0 z-10">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger variant={"secondary"} className="p-3 rounded-full w-10 h-10" />
          <div className="hidden md:block font-semibold">
            {text}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UserAuthState />
        </div>
      </div>
    </header>
  </div>
}

export default UserHeader