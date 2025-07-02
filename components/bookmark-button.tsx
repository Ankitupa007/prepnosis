'use client'

import { useState, useEffect } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

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
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if question is bookmarked on mount
  useEffect(() => {
    if (!user || !questionId) return

    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/bookmarks/`)
        if (response.ok) {
          const data = await response.json()
          console.log('API Response:', data) // Debug: Check API response structure
          const { allBookmarks } = data
          console.log('All Bookmarks:', allBookmarks) // Debug: Check bookmarks array
          console.log('Current Question ID:', questionId) // Debug: Check current question ID

          if (Array.isArray(allBookmarks)) {
            const bookmarkExists = allBookmarks.some((bookmark: any) => {
              console.log('Comparing:', bookmark.question_id, 'with', questionId) // Debug comparison
              return bookmark.question_id === questionId
            })
            console.log('Bookmark exists:', bookmarkExists)
            setIsBookmarked(bookmarkExists)
          } else {
            console.error('allBookmarks is not an array:', allBookmarks)
            setIsBookmarked(false)
          }
        } else {
          console.error('Failed to fetch bookmarks:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error)
      }
    }

    checkBookmarkStatus()
  }, [questionId, user])

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error('Please log in to bookmark questions')
      return
    }

    setIsLoading(true)

    try {
      if (isBookmarked) {
        // Remove bookmark
        const response = await fetch(`/api/bookmarks/${questionId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          setIsBookmarked(false)
          toast.success('Bookmark removed')
        } else {
          throw new Error('Failed to remove bookmark')
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ questionId })
        })

        if (response.ok) {
          setIsBookmarked(true)
          toast.success('Question bookmarked')
        } else if (response.status === 409) {
          setIsBookmarked(true)
          toast.info('Question already bookmarked')
        } else {
          throw new Error('Failed to add bookmark')
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to update bookmark')
    } finally {
      setIsLoading(false)
    }
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
      disabled={isLoading || !user}
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