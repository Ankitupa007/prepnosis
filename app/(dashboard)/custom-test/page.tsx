import UserHeader from "@/components/user-header"
import AllTests from "./AllTests"

export default function CustomTestPage() {
  return (
    <div className="mx-auto relative">
      <UserHeader text='Custom Tests' />
        <AllTests />
    </div>
  )
}