import UserHeader from "@/components/user-header"
import AllGrandTests from "./AllGrandTests"

export default function GrandTestPage() {
  return (
    <div className="mx-auto relative">
      <UserHeader text='Grand Tests' />
      <AllGrandTests />
    </div>
  )
}