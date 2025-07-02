import UserHeader from "@/components/user-header"
import AllBookmarks from "./AllBookmarks"

export default function BookmarksPage() {
  return (
    <div className="mx-auto relative">
      <UserHeader text='Bookmarks' />
        <AllBookmarks />
    </div>
  )
}