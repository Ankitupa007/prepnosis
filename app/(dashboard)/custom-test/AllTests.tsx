'use client'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ShareCodeInput from '@/components/share-code-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCustomTests } from '@/hooks/tests/useTests'
import { deleteCustomTest } from '@/lib/actions/custom-test'
import { useAuth } from '@/lib/auth-context'
import { CustomTest, TestAttempt } from '@/lib/types/test'
import { useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  ClipboardPlus,
  Plus,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import TestCard from './TestCard'


export default function AllTests() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [deletingTestId, setDeletingTestId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { customTestsError, customTests, isDeletingCustomTest, refetchCustomTests, isLoadingCustomTests } = useCustomTests()
  const tests: CustomTest[] = customTests || []

  // Track when data has been initially loaded
  useEffect(() => {
    if (!isLoadingCustomTests && (customTests !== undefined || customTestsError)) {
      setHasInitiallyLoaded(true)
    }
  }, [isLoadingCustomTests, customTests, customTestsError])

  // Handle error state
  useEffect(() => {
    if (customTestsError) {
      console.error('Error fetching tests:', customTestsError)
      toast.error('Failed to load tests')
    }
  }, [customTestsError])

  // Filter and search tests with useMemo for performance
  const filteredTests = useMemo(() => {
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
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [tests, searchTerm, filterBy])

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) {
      return
    }

    try {
      setDeletingTestId(testId)
      await deleteCustomTest(testId)

      // Invalidate and refetch the custom tests query
      await queryClient.invalidateQueries({ queryKey: ['customTests'] })

      // Or refetch manually if the hook provides this method
      await refetchCustomTests()

      toast.success('Test deleted successfully')
    } catch (error) {
      console.error('Error deleting test:', error)
      toast.error('Failed to delete test')
    } finally {
      setDeletingTestId(null)
    }
  }

  const getBestScore = (attempts: TestAttempt[]) => {
    if (attempts.length === 0) return null
    return Math.max(...attempts.map(attempt => attempt.score))
  }

  // Show loading spinner while data is being fetched OR hasn't initially loaded
  if (isLoadingCustomTests || !hasInitiallyLoaded || customTests === undefined) {
    return (
      <div className="mx-auto relative">
        <section className='px-4 max-w-4xl mx-auto py-4'>
          {/* Header - show even during loading */}
          <div className="flex justify-between items-center max-w-4xl">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Your Custom Tests</h1>
              <p className="text-muted-foreground text-sm mt-1">Loading...</p>
            </div>
          </div>

          <div className='flex items-center gap-4 py-8'>
            <Button
              onClick={() => router.push('/custom-test/create')}
              className="flex items-center gap-2 bg-[#66C3C1] hover:bg-[#5ab5b3] text-white dark:bg-[#66C3C1] dark:hover:bg-[#5ab5b3]"
            >
              <ClipboardPlus className="h-4 w-4" />
              Create Test
            </Button>
            <div>
              <Dialog>
                <DialogTrigger className='flex items-center gap-2 border-2 bg-transparent border-[#66C3C1] hover:bg-[#66C3C1] text-[#66c3c1] hover:text-white dark:hover:bg-[#66C3C1] py-1 px-3 rounded-md transition-colors'>
                  <Plus className="h-4 w-4" />
                  Join Test
                </DialogTrigger>
                <DialogContent className='w-[88vw] max-w-md rounded-md'>
                  <DialogHeader className='flex flex-col items-center'>
                    <DialogTitle>Join Shared Test</DialogTitle>
                    <DialogDescription>
                      Enter the 8-character share code to access the test
                    </DialogDescription>
                    <DialogDescription className='text-xs text-muted-foreground'>
                      Example: ABC12345
                    </DialogDescription>
                  </DialogHeader>
                  <ShareCodeInput />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6 flex justify-center items-center">
              <LoadingSpinner text='Loading Custom tests...' />
            </div>
          </div>
        </section>
      </div>
    )
  }

  // Error state
  if (customTestsError) {
    return (
      <div className="mx-auto relative">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Failed to load tests</h3>
              <p className="text-muted-foreground mb-6">
                {customTestsError instanceof Error ? customTestsError.message : 'Something went wrong'}
              </p>
              <Button
                onClick={refetchCustomTests}
                className="bg-[#66C3C1] hover:bg-[#5ab5b3] text-white dark:bg-[#66C3C1] dark:hover:bg-[#5ab5b3]"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto relative">
      <section className='px-4 max-w-4xl mx-auto py-4'>
        {/* Header */}
        <div className="flex justify-between items-center max-w-4xl">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Your Custom Tests</h1>
            <p className="text-muted-foreground text-sm mt-1">{tests.length} custom tests</p>
          </div>
        </div>

        <div className='flex items-center gap-4 py-8'>
          <Button
            onClick={() => router.push('/custom-test/create')}
            className="flex items-center gap-2 bg-[#66C3C1] hover:bg-[#5ab5b3] text-white dark:bg-[#66C3C1] dark:hover:bg-[#5ab5b3]"
          >
            <ClipboardPlus className="h-4 w-4" />
            Create Test
          </Button>
          <div>
            <Dialog>
              <DialogTrigger className='flex items-center gap-2 border-2 bg-transparent border-[#66C3C1] hover:bg-[#66C3C1] text-[#66c3c1] hover:text-white dark:hover:bg-[#66C3C1] py-1 px-3 rounded-md transition-colors'>
                <Plus className="h-4 w-4" />
                Join Test
              </DialogTrigger>
              <DialogContent className='w-[88vw] max-w-md rounded-md'>
                <DialogHeader className='flex flex-col items-center'>
                  <DialogTitle>Join Shared Test</DialogTitle>
                  <DialogDescription>
                    Enter the 8-character share code to access the test
                  </DialogDescription>
                  <DialogDescription className='text-xs text-muted-foreground'>
                    Example: ABC12345
                  </DialogDescription>
                </DialogHeader>
                <ShareCodeInput />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3 mb-6 py-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl border-input focus:border-[#66C3C1] focus:ring-[#66C3C1] bg-background"
            />
          </div>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-30 px-2 space-x-2 border-input focus:border-[#66C3C1] focus:ring-[#66C3C1] bg-background">
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
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tests yet</h3>
                <p className="text-muted-foreground mb-6">Create your first custom test to get started</p>
                <Button
                  onClick={() => router.push('/custom-test/create')}
                  className="bg-[#66C3C1] hover:bg-[#5ab5b3] text-white dark:bg-[#66C3C1] dark:hover:bg-[#5ab5b3]"
                >
                  Create Your First Test
                </Button>
              </div>
            ) : (
              <div>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No tests found</h3>
                <p className="text-muted-foreground">Try a different search term</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                onStart={() => router.push(`/custom-test/${test.id}`)}
                onView={() => router.push(`/custom-test/${test.id}`)}
                onDelete={() => handleDeleteTest(test.id)}
                bestScore={getBestScore(test.attempts)}
                isDeleting={deletingTestId === test.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}