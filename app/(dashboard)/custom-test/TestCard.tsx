import SubjectIcons from '@/components/common/SubjectIcons'
import CopyButton from '@/components/copy-to-clipboard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TestCardProps } from '@/lib/types/test'
import { formatDistanceToNow } from 'date-fns'
import {
  Award,
  BookOpen,
  Clock,
  Eye,
  MoreVertical,
  Play,
  Share2,
  Trash2
} from 'lucide-react'
import { useState } from 'react'

function TestCard({ test, onStart, onView, onDelete, bestScore }: TestCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const testDate = new Date(test.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <Card className={`
      group cursor-pointer transition-all duration-300 ease-out
      hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5
      border-border bg-card
    `}>
      <CardContent className="p-4 sm:p-5">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-base sm:text-lg leading-tight mb-4 group-hover:text-[#66C3C1] transition-colors duration-200">
              {test.title}
            </h3>

            {/* Badges - Responsive Layout */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary" className="shadow-sm">
                <Clock className="h-3 w-3 mr-1" />
                {testDate}
              </Badge>
              {test.test_mode === 'exam' && (
                <Badge variant="destructive" className="animate-pulse">
                  <Clock className="h-3 w-3 mr-1" />
                  Exam
                </Badge>
              )}
              {test._count.attempts > 0 && (
                <Badge variant="outline">
                  <span className="font-medium">{test._count.attempts}x</span>
                  <span className="hidden sm:inline ml-1">attempt(s)</span>
                </Badge>
              )}
              {bestScore !== null && (
                <Badge className="bg-gradient-to-r from-[#66C3C1] to-[#5ab5b3] text-white shadow-sm">
                  <Award className="h-3 w-3 mr-1" />
                  {bestScore}%
                </Badge>
              )}
            </div>
            <div className='flex flex-wrap py-4 gap-3'>
              {test.subjects.map(s => (
                <Badge
                  variant="secondary"
                  key={s.id}
                  className='text-xs rounded-full items-center justify-center py-1 flex gap-2'
                >
                  <SubjectIcons subjectName={s.name} styles="w-3 h-3" />
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              size="sm"
              className="bg-gradient-to-r from-[#66C3C1] to-[#5ab5b3] hover:from-[#5ab5b3] hover:to-[#4ea8a6] text-white shadow-sm dark:bg-gradient-to-r dark:from-[#66C3C1] dark:to-[#5ab5b3]"
            >
              <Play className="h-3 w-3 mr-1.5" />
              {test._count.attempts > 0 ? 'Retake' : 'Start'}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showDropdown && (
                <div className="absolute right-0 top-9 bg-popover border border-border rounded-md shadow-lg z-50 min-w-32">
                  <button
                    onClick={() => {
                      onView()
                      setShowDropdown(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-left transition-colors duration-150 text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  <button
                    onClick={() => {
                      onDelete()
                      setShowDropdown(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted text-destructive text-left transition-colors duration-150"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-[#66C3C1]" />
            <span className="font-medium">{test.total_questions}</span>
            <span>questions</span>
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Clock className="h-3 w-3" />
            <span>Created {formatDistanceToNow(new Date(test.created_at), { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-1 text-xs sm:text-sm">
            <Share2 className="h-3 w-3 text-[#66c3c1]" />
            <span className='text-[#66c3c1]'>{test.share_code}</span>
            <CopyButton size='sm' text={test.share_code} />
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex sm:hidden items-center gap-2 mt-4 pt-4 border-t border-border">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onStart();
            }}
            className="flex-1 bg-gradient-to-r from-[#66C3C1] to-[#5ab5b3] hover:from-[#5ab5b3] hover:to-[#4ea8a6] text-white shadow-sm dark:bg-gradient-to-r dark:from-[#66C3C1] dark:to-[#5ab5b3]"
          >
            <Play className="h-4 w-4 mr-2" />
            {test._count.attempts > 0 ? 'Retake Test' : 'Start Test'}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-10 w-10 p-0 hover:bg-muted"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>

            {showDropdown && (
              <div className="absolute right-0 bottom-12 bg-popover border border-border rounded-lg shadow-xl z-50 min-w-40">
                <button
                  onClick={() => {
                    onView()
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-muted text-left transition-colors duration-150 first:rounded-t-lg text-foreground"
                >
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  View Details
                </button>
                <hr className="border-border" />
                <button
                  onClick={() => {
                    onDelete()
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-destructive/10 text-destructive text-left transition-colors duration-150 last:rounded-b-lg"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default TestCard