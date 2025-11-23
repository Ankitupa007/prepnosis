'use client'

import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { useIsBookmarked, useToggleBookmark } from '@/hooks/use-bookmarks'

interface BookmarkButtonProps {
  questionId: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'ghost' | 'outline'
  showText?: boolean
}

export default function BookmarkButton({
  questionId,
  size = 'md',
  variant = 'ghost',
  showText = false,
}: BookmarkButtonProps) {
  const { user } = useAuth()
  const isBookmarked = useIsBookmarked(questionId, user?.id)
  const toggleMutation = useToggleBookmark(user?.id)

  const handleBookmarkToggle = () => {
    if (!user) {
      toast.error('Please log in to bookmark questions')
      return
    }

    toggleMutation.mutate({ questionId, isBookmarked })
  }

  const getIconSize = () => {
    switch (size) {
      case 'sm': return 14
      case 'lg': return 20
      default: return 16
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm': return 'sm'
      case 'lg': return 'lg'
      default: return 'default'
    }
  }

  return (
    <Button
      variant={variant}
      size={getButtonSize()}
      onClick={handleBookmarkToggle}
      disabled={!user || toggleMutation.isPending}
      className={`${isBookmarked ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-500 hover:text-gray-600'} transition-colors`}
    >
      {isBookmarked ? (
        <BookmarkCheck size={getIconSize()} className="fill-current" />
      ) : (
        <Bookmark size={getIconSize()} />
      )}
      {showText && (
        <span className="ml-2">
          {isBookmarked ? 'Bookmarked' : 'Bookmark'}
        </span>
      )}
    </Button>
  )
}