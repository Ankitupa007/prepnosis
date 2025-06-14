import { ToggleTheme } from "../toggle-theme"
import UserAuthState from "../user-auth-state"
import Logo from "./logo"

const WebsiteHeader = ({ }) => {
  return (
    <header className="container mx-auto py-4 px-6 flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-4">
        <ToggleTheme />
        <UserAuthState />
      </div>
    </header>
  )
}
export default WebsiteHeader