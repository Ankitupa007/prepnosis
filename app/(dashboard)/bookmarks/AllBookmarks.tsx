'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import SubjectIcons from '@/components/common/SubjectIcons'
import  BookmarkButton  from '@/components/bookmark-button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import UserHeader from '@/components/user-header'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import {
  Bookmark,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Calendar,
  Tag
} from 'lucide-react'

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
  const [bookmarks, setBookmarks] = useState<GroupedBookmarks[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
  const [selectedQuestion, setSelectedQuestion] = useState<BookmarkedQuestion | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchBookmarks = async () => {
      try {
        const response = await fetch('/api/bookmarks')
        if (response.ok) {
          const data = await response.json()
          setBookmarks(data.bookmarks)
          // Expand first subject by default
          if (data.bookmarks.length > 0) {
            setExpandedSubjects(new Set([data.bookmarks[0].subject.id]))
          }
        } else {
          throw new Error('Failed to fetch bookmarks')
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
        toast.error('Failed to load bookmarks')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookmarks()
  }, [user])

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects)
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId)
    } else {
      newExpanded.add(subjectId)
    }
    setExpandedSubjects(newExpanded)
  }

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
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view your bookmarks.</p>
        </div>
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

  return (
    <div className="container mx-auto">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header Stats */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bookmark className="h-6 w-6 text-yellow-500" />
                My Bookmarks
              </h1>
              <p className="text-gray-600 mt-1">
                {getTotalBookmarks()} questions saved across {bookmarks.length} subjects
              </p>
            </div>
          </div>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
              <p className="text-gray-600 mb-4">
                Start bookmarking questions while taking tests to save them for later review.
              </p>
              <Button onClick={() => window.location.href = '/custom-test/create'}>
                <BookOpen className="h-4 w-4 mr-2" />
                Take a Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Subjects List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subjects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {bookmarks.map((group) => (
                    <div key={group.subject.id}>
                      <Button
                        variant="ghost"
                        onClick={() => toggleSubject(group.subject.id)}
                        className="w-full justify-between p-3 h-auto"
                      >
                        <div className="flex items-center gap-3">
                          <SubjectIcons
                            subjectName={group.subject.name}
                            styles="w-5 h-5"
                          />
                          <div className="text-left">
                            <div className="font-medium">{group.subject.name}</div>
                            <div className="text-xs text-gray-500">
                              {group.bookmarks.length} questions
                            </div>
                          </div>
                        </div>
                        {expandedSubjects.has(group.subject.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      {expandedSubjects.has(group.subject.id) && (
                        <div className="ml-8 mt-2 space-y-2">
                          {group.bookmarks.map((bookmark) => (
                            <Button
                              key={bookmark.id}
                              variant={selectedQuestion?.id === bookmark.id ? "secondary" : "ghost"}
                              onClick={() => setSelectedQuestion(bookmark)}
                              className="w-full justify-start text-sm p-2 h-auto"
                            >
                              <div className="text-left truncate">
                                {bookmark.questions.question_text.substring(0, 60)}...
                              </div>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
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
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            <SubjectIcons
                              subjectName={selectedQuestion.questions.subjects.name}
                              styles="w-3 h-3 mr-1"
                            />
                            {selectedQuestion.questions.subjects.name}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Tag className="w-3 h-3 mr-1" />
                            {selectedQuestion.questions.topics.name}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          Bookmarked on {formatDate(selectedQuestion.created_at)}
                        </div>
                      </div>
                      <BookmarkButton
                        questionId={selectedQuestion.questions.id}
                        size="sm"
                      />
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
                                <span className={`font-medium px-2 py-1 rounded text-sm ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                                  }`}>
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
                      <h4 className="font-medium text-sm uppercase text-gray-500 mb-3">
                        Explanation
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        {renderBoldText(selectedQuestion.questions.explanation)}
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedQuestion.notes && (
                      <div>
                        <h4 className="font-medium text-sm uppercase text-gray-500 mb-3">
                          Your Notes
                        </h4>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20">
                          <p className="text-sm">{selectedQuestion.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Question Meta */}
                    <div className="text-xs text-gray-500 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span>Difficulty: {selectedQuestion.questions.difficulty_level}</span>
                        <span>ID: {selectedQuestion.questions.id}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Select a question to view
                    </h3>
                    <p className="text-gray-600">
                      Choose a question from the subjects list to see its details and explanation.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}