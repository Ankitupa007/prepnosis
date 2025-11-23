'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import SubjectIcons from '@/components/common/SubjectIcons'
import BookmarkButton from '@/components/bookmark-button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/lib/auth-context'
import { useBookmarksQuery } from '@/hooks/use-bookmarks'
import { Bookmark, BookOpen, Calendar, Tag } from 'lucide-react'

interface BookmarkedQuestion {
  id: string
  created_at: string
  notes: string | null
  questions: {
    id: string
    question_text: string
    explanation: string
    option_a: string
    option_b: string
    option_c: string
    option_d: string
    correct_option: number
    difficulty_level: string
    subjects: {
      id: string
      name: string
    }
    topics: {
      id: string
      name: string
    }
  }
}

interface GroupedBookmarks {
  subject: {
    id: string
    name: string
  }
  bookmarks: BookmarkedQuestion[]
}

export default function AllBookmarks() {
  const { user } = useAuth()
  const { data: bookmarksData, isLoading } = useBookmarksQuery(user?.id)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedQuestion, setSelectedQuestion] = useState<BookmarkedQuestion | null>(null)

  const bookmarks: GroupedBookmarks[] = bookmarksData?.bookmarks || []

  // Auto-select first subject when data loads
  if (bookmarks.length > 0 && !selectedSubjectId) {
    setSelectedSubjectId(bookmarks[0].subject.id)
  }

  const selectedSubject = bookmarks.find(g => g.subject.id === selectedSubjectId)

  const renderBoldText = (text: string) => {
    const boldText = text.replace(/\*(.*?)\*/g, '<strong class="font-bold">$1</strong>')
    return <span dangerouslySetInnerHTML={{ __html: boldText }} />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTotalBookmarks = () => {
    return bookmarks.reduce((total, group) => total + group.bookmarks.length, 0)
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto text-center p-8">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Please Log In</h2>
          <p className="text-muted-foreground">You need to be logged in to view your bookmarks.</p>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingSpinner text="Loading bookmarks" />
        </div>
      </div>
    )
  }

  if (bookmarks.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto text-center p-8">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
          <p className="text-muted-foreground text-sm">
            Start bookmarking questions while taking tests to save them for later review.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl py-6 px-4">
      {/* Header with Subject Dropdown */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {getTotalBookmarks()} questions saved across {bookmarks.length} subjects
            </p>
          </div>
        </div>

        <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {bookmarks.map((group) => (
              <SelectItem key={group.subject.id} value={group.subject.id}>
                <div className="flex items-center gap-2">
                  <SubjectIcons subjectName={group.subject.name} styles="w-4 h-4" />
                  <span>{group.subject.name}</span>
                  <span className="text-xs text-muted-foreground">({group.bookmarks.length})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Questions Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Questions List */}
        <div className="lg:col-span-1 space-y-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <SubjectIcons subjectName={selectedSubject?.subject.name || ''} styles="w-5 h-5" />
                {selectedSubject?.subject.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {selectedSubject?.bookmarks.map((bookmark) => (
                <button
                  key={bookmark.id}
                  onClick={() => setSelectedQuestion(bookmark)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedQuestion?.id === bookmark.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent border-transparent'
                    }`}
                >
                  <div className="text-sm line-clamp-2">
                    {bookmark.questions.question_text}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(bookmark.created_at)}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Question Detail */}
        <div className="lg:col-span-2">
          {selectedQuestion ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {selectedQuestion.questions.topics.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {selectedQuestion.questions.difficulty_level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      Bookmarked on {formatDate(selectedQuestion.created_at)}
                    </div>
                  </div>
                  <BookmarkButton questionId={selectedQuestion.questions.id} size="sm" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    {selectedQuestion.questions.question_text}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {[
                      { label: 'A', text: selectedQuestion.questions.option_a },
                      { label: 'B', text: selectedQuestion.questions.option_b },
                      { label: 'C', text: selectedQuestion.questions.option_c },
                      { label: 'D', text: selectedQuestion.questions.option_d }
                    ].map((option, index) => {
                      const isCorrect = index + 1 === selectedQuestion.questions.correct_option

                      return (
                        <div
                          key={option.label}
                          className={`p-3 rounded-lg border ${isCorrect
                              ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                              : 'bg-gray-50 border-gray-200 dark:bg-gray-800'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-medium px-2 py-1 rounded text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                                }`}
                            >
                              {option.label}
                            </span>
                            <span className="flex-1">{option.text}</span>
                            {isCorrect && (
                              <Badge variant="secondary" className="text-xs text-green-700">
                                Correct
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <Separator />

                {/* Explanation */}
                <div>
                  <h4 className="font-medium text-sm uppercase text-muted-foreground mb-3">
                    Explanation
                  </h4>
                  <div className="prose prose-sm max-w-none">
                    {renderBoldText(selectedQuestion.questions.explanation)}
                  </div>
                </div>

                {/* Notes */}
                {selectedQuestion.notes && (
                  <div>
                    <h4 className="font-medium text-sm uppercase text-muted-foreground mb-3">
                      Your Notes
                    </h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20">
                      <p className="text-sm">{selectedQuestion.notes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a question to view</h3>
                <p className="text-muted-foreground text-sm">
                  Choose a question from the list to see its details and explanation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}