'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'react-hot-toast'
import {
  Plus,
  Search,
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Play,
  Eye,
  Trash2,
  MoreVertical,
  Filter
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { CircleProgress } from '@/components/common/CircleProgress'

interface TestAttempt {
  id: string
  score: number
  total_questions: number
  correct_answers: number
  completed_at: string
  time_taken: number
}

interface CustomTest {
  id: string
  title: string
  description: string
  test_mode: 'regular' | 'exam'
  total_questions: number
  total_marks: number
  created_at: string
  attempts: TestAttempt[]
  subjects: Array<{
    id: string
    name: string
  }>
  _count: {
    attempts: number
  }
}

export default function CustomTestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [tests, setTests] = useState<CustomTest[]>([])
  const [filteredTests, setFilteredTests] = useState<CustomTest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [filterBy, setFilterBy] = useState('all')

  // Fetch user's custom tests
  useEffect(() => {
    const fetchTests = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/tests/user/${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch tests')
        }
        const data = await response.json()
        setTests(data.tests)
        setFilteredTests(data.tests)
      } catch (error) {
        console.error('Error fetching tests:', error)
        toast.error('Failed to load tests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTests()
  }, [user])

  // Filter and search tests
  useEffect(() => {
    let filtered = tests

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply category filter
    if (filterBy !== 'all') {
      if (filterBy === 'attempted') {
        filtered = filtered.filter(test => test._count.attempts > 0)
      } else if (filterBy === 'not_attempted') {
        filtered = filtered.filter(test => test._count.attempts === 0)
      } else if (filterBy === 'regular') {
        filtered = filtered.filter(test => test.test_mode === 'regular')
      } else if (filterBy === 'exam') {
        filtered = filtered.filter(test => test.test_mode === 'exam')
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'attempts':
          return b._count.attempts - a._count.attempts
        case 'questions':
          return b.total_questions - a.total_questions
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredTests(filtered)
  }, [tests, searchTerm, sortBy, filterBy])

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete test')
      }

      setTests(tests.filter(test => test.id !== testId))
      toast.success('Test deleted successfully')
    } catch (error) {
      console.error('Error deleting test:', error)
      toast.error('Failed to delete test')
    }
  }

  const getBestScore = (attempts: TestAttempt[]) => {
    if (attempts.length === 0) return null
    return Math.max(...attempts.map(attempt => attempt.score))
  }

  const getLastAttemptDate = (attempts: TestAttempt[]) => {
    if (attempts.length === 0) return null
    const lastAttempt = attempts.reduce((latest, current) =>
      new Date(current.completed_at) > new Date(latest.completed_at) ? current : latest
    )
    return lastAttempt.completed_at
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Custom Tests</h1>
          <p className="text-gray-600 mt-2">Create and manage your personalized practice tests</p>
        </div>
        <Button
          onClick={() => router.push('/custom-test/create')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Test
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.reduce((sum, test) => sum + test._count.attempts, 0)}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attempted Tests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.filter(test => test._count.attempts > 0).length}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tests.length > 0
                    ? Math.round(
                      tests
                        .filter(test => test.attempts.length > 0)
                        .reduce((sum, test) => {
                          const bestScore = getBestScore(test.attempts)
                          return sum + (bestScore || 0)
                        }, 0) / tests.filter(test => test.attempts.length > 0).length || 0
                    )
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tests by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tests</SelectItem>
                <SelectItem value="attempted">Attempted</SelectItem>
                <SelectItem value="not_attempted">Not Attempted</SelectItem>
                <SelectItem value="regular">Regular Mode</SelectItem>
                <SelectItem value="exam">Exam Mode</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Latest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="attempts">Most Attempted</SelectItem>
                <SelectItem value="questions">Most Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tests Grid */}
      {filteredTests.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            {tests.length === 0 ? (
              <div>
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Custom Tests Yet</h3>
                <p className="text-gray-600 mb-6">Create your first custom test to start practicing</p>
                <Button
                  onClick={() => router.push('/custom-test/create')}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Test
                </Button>
              </div>
            ) : (
              <div>
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onStart={() => router.push(`/custom-test/${test.id}/attempt`)}
              onView={() => router.push(`/custom-test/${test.id}`)}
              onDelete={() => handleDeleteTest(test.id)}
              bestScore={getBestScore(test.attempts)}
              lastAttemptDate={getLastAttemptDate(test.attempts)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TestCardProps {
  test: CustomTest
  onStart: () => void
  onView: () => void
  onDelete: () => void
  bestScore: number | null
  lastAttemptDate: string | null
}

function TestCard({ test, onStart, onView, onDelete, bestScore, lastAttemptDate }: TestCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant={test.test_mode === 'exam' ? 'destructive' : 'secondary'}
                className="text-xs"
              >
                {test.test_mode === 'exam' ? 'Exam Mode' : 'Regular Mode'}
              </Badge>
              {test._count.attempts > 0 && (
                <Badge variant="outline" className="text-xs">
                  {test._count.attempts} attempt{test._count.attempts !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {test.title}
            </CardTitle>
            {test.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {test.description}
              </CardDescription>
            )}
          </div>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showDropdown && (
              <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10 min-w-32">
                <button
                  onClick={() => {
                    onView()
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-left"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onDelete()
                    setShowDropdown(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 text-red-600 text-left"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Test Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>{test.total_questions} questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="h-4 w-4" />
            <span>{test.total_marks} marks</span>
          </div>
        </div>

        {/* Subjects */}
        {test.subjects && test.subjects.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {test.subjects.slice(0, 3).map((subject) => (
                <Badge key={subject.id} variant="outline" className="text-xs">
                  {subject.name}
                </Badge>
              ))}
              {test.subjects.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{test.subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Performance Info */}
        {bestScore !== null && (
          <div className="bg-green-50 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Best Score</span>
              <CircleProgress percentage={bestScore} size={50} strokeWidth={5} color='text-green-500'/>
            </div>
          </div>
        )}

        {/* Last Attempt */}
        {lastAttemptDate && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Clock className="h-3 w-3" />
            <span>Last attempted {formatDistanceToNow(new Date(lastAttemptDate), { addSuffix: true })}</span>
          </div>
        )}

        {/* Created Date */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Calendar className="h-3 w-3" />
          <span>Created {formatDistanceToNow(new Date(test.created_at), { addSuffix: true })}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onStart}
            className="flex-1 flex items-center gap-2"
            size="sm"
          >
            <Play className="h-4 w-4" />
            {test._count.attempts > 0 ? 'Retake' : 'Start Test'}
          </Button>
          <Button
            onClick={onView}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}