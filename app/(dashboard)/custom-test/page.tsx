'use client'
import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  BookOpen,
  Play,
  Eye,
  Trash2,
  MoreVertical,
  ClipboardPlus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { SidebarTrigger } from '@/components/ui/sidebar'
import UserAuthState from '@/components/user-auth-state'
import ShareCodeInput from '@/components/share-code-input'

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
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [showJoinModel, setShowJoinModel] = useState<boolean>(false)
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

    // Sort by most recent
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    setFilteredTests(filtered)
  }, [tests, searchTerm, filterBy])

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) {
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
      toast.success('Test deleted')
    } catch (error) {
      console.error('Error deleting test:', error)
      toast.error('Failed to delete test')
    }
  }

  const getBestScore = (attempts: TestAttempt[]) => {
    if (attempts.length === 0) return null
    return Math.max(...attempts.map(attempt => attempt.score))
  }

  const handleJoinTest = () => {
    setShowJoinModel(!showJoinModel)
  }
  return (
    <div className="mx-auto px-4 realtive">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="p-3 rounded-full w-10 h-10 bg-gray-100 hover:bg-gray-50" />
            <div className="hidden md:block">
            </div>
          </div>
          <div className="flex items-center gap-4">
            <UserAuthState />
          </div>
        </div>
      </header>
      {isLoading ? (<div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>) : (<section className='px-4 max-w-4xl mx-auto py-4'>
        {/* Header */}
        <div className="flex justify-between items-center mb-8 max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Test</h1>
            <p className="text-gray-600 text-sm mt-1">{tests.length} custom tests</p>
          </div>
          <div className='flex items-center gap-2'>
            <Dialog>
              <DialogTrigger className='flex items-center gap-2 border-2 bg-transparent border-[#66C3C1] hover:bg-[#5ab5b3] text-[#66c3c1] hover:text-white py-1 px-3 rounded-md'>
                <Plus className="h-4 w-4" />
                Join Test
              </DialogTrigger>
              <DialogContent className='max-w-md mx-auto px-6'>
                <DialogHeader className='flex flex-col items-center'>
                  <DialogTitle >Join Shared Test</DialogTitle>
                  <DialogDescription>
                    Enter the 8-character share code to access the test
                  </DialogDescription>
                  <DialogDescription className='text-xs text-gray-500'>
                    Example: ABC12345
                  </DialogDescription>
                </DialogHeader>
                <ShareCodeInput />
              </DialogContent>
            </Dialog>

            <Button
              onClick={() => router.push('/custom-test/create')}
              className="flex items-center gap-2 bg-[#66C3C1] hover:bg-[#5ab5b3] text-white"
            >
              <ClipboardPlus className="h-4 w-4" />
              Create Test
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-[#66C3C1] focus:ring-[#66C3C1]"
            />
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40 border-gray-300 focus:border-[#66C3C1] focus:ring-[#66C3C1]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tests</SelectItem>
              <SelectItem value="attempted">Attempted</SelectItem>
              <SelectItem value="not_attempted">New</SelectItem>
              <SelectItem value="exam">Exam Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tests List */}
        {filteredTests.length === 0 ? (
          <div className="text-center py-16">
            {tests.length === 0 ? (
              <div>
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
                <p className="text-gray-600 mb-6">Create your first custom test to get started</p>
                <Button
                  onClick={() => router.push('/custom-test/create')}
                  className="bg-[#66C3C1] hover:bg-[#5ab5b3] text-white"
                >
                  Create Your First Test
                </Button>
              </div>
            ) : (
              <div>
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                <p className="text-gray-600">Try a different search term</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onStart={() => router.push(`/custom-test/${test.id}`)}
                onView={() => router.push(`/custom-test/${test.id}`)}
                onDelete={() => handleDeleteTest(test.id)}
                bestScore={getBestScore(test.attempts)}
              />
            ))}
          </div>
        )}
      </section>)}
    </div>

  )
}

interface TestCardProps {
  test: CustomTest
  onStart: () => void
  onView: () => void
  onDelete: () => void
  bestScore: number | null
}

function TestCard({ test, onStart, onView, onDelete, bestScore }: TestCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium text-gray-900 text-lg truncate">{test.title}</h3>
              <div className="flex items-center gap-2 shrink-0">
                {test.test_mode === 'exam' && (
                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                    Exam
                  </Badge>
                )}
                {test._count.attempts > 0 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {test._count.attempts}x
                  </Badge>
                )}
                {bestScore !== null && (
                  <Badge
                    className="text-xs px-2 py-0.5 bg-[#66C3C1] text-white"
                  >
                    {bestScore}%
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {test.total_questions} questions
              </span>
              <span>Created {formatDistanceToNow(new Date(test.created_at), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={onStart}
              size="sm"
              className="bg-[#66C3C1] hover:bg-[#5ab5b3] text-white"
            >
              <Play className="h-3 w-3 mr-1" />
              {test._count.attempts > 0 ? 'Retake' : 'Start'}
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDropdown(!showDropdown)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>

              {showDropdown && (
                <div className="absolute right-0 top-9 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
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
        </div>
      </CardContent>
    </Card>
  )
}