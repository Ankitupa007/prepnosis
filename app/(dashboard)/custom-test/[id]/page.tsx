'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'react-hot-toast'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  BookOpen,
  Clock,
  Award,
  RotateCcw,
  Circle
} from 'lucide-react'
import { CircleProgress } from '@/components/common/CircleProgress'

interface Question {
  id: string
  question_text: string
  explanation: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 1 | 2 | 3 | 4
  subject_id: string
  subjects: {
    id: string
    name: string
  }
  topics: {
    id: string
    name: string
  }
  topic_id: string
  difficulty_level: string
}

interface TestQuestion {
  id: string
  question_id: string
  question_order: number
  marks: number
  questions: Question
}

interface Test {
  id: string
  title: string
  description: string
  test_mode: 'regular' | 'exam'
  total_questions: number
  total_marks: number
}

interface UserAnswer {
  questionId: string
  selectedOption: number | null
  isCorrect?: boolean
}

export default function CustomTestPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { user } = useAuth()
  const [test, setTest] = useState<Test | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [testStarted, setTestStarted] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [showReviewMode, setShowReviewMode] = useState(false) // New state for review mode
  const { id } = use(params)

  // Fetch test data
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(`/api/tests/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch test')
        }
        const data = await response.json()
        // console.log('Fetched Test Data:', data)
        setTest(data.test)
        setQuestions(data.questions)

        // Initialize user answers
        const initialAnswers = data.questions.map((q: TestQuestion) => ({
          questionId: q.question_id,
          selectedOption: null,
          isCorrect: false
        }))
        setUserAnswers(initialAnswers)
      } catch (error) {
        console.error('Error fetching test:', error)
        toast.error('Failed to load test')
        router.push('/custom-test/create')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchTest()
    }
  }, [id, router])

  // Start test attempt
  const startTest = async () => {
    if (!user || !test) return

    try {
      const response = await fetch(`/api/tests/${test.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (response.ok) {
        const data = await response.json()
        // console.log('Test started:', questions)
        toast.success('Test started successfully!')
        setAttemptId(data.attempt.id)
        setTestStarted(true)
      } else {
        throw new Error('Failed to start test')
      }
    } catch (error) {
      console.error('Error starting test:', error)
      toast.error('Failed to start test')
    }
  }

  // Handle answer selection
  const handleAnswerSelect = (selectedOption: number) => {
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedOption === currentQuestion.questions.correct_option

    const updatedAnswers = userAnswers.map((answer) =>
      answer.questionId === currentQuestion.question_id
        ? { ...answer, selectedOption, isCorrect }
        : answer
    )
    setUserAnswers(updatedAnswers)

    // In regular mode, show explanation immediately
    if (test?.test_mode === 'regular') {
      setShowExplanation(true)
    }
  }

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setShowExplanation(false)
    } else if (test?.test_mode === 'exam' && !testCompleted) {
      // In exam mode, submit test when reaching the end
      submitTest()
    }
  }

  // Navigate to previous question
  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setShowExplanation(false)
    }
  }

  // Submit test
  const submitTest = async () => {
    if (!attemptId || !test) return

    try {
      const response = await fetch(`/api/tests/${test.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          answers: userAnswers
        })
      })

      if (response.ok) {
        setTestCompleted(true)
        setShowReviewMode(true) // Enable review mode for exam mode
        toast.success('Test submitted successfully!')
      } else {
        throw new Error('Failed to submit test')
      }
    } catch (error) {
      console.error('Error submitting test:', error)
      toast.error('Failed to submit test')
    }
  }

  // Calculate results
  const calculateResults = () => {
    const totalQuestions = userAnswers.length
    const answeredQuestions = userAnswers.filter(a => a.selectedOption !== null).length
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length
    const incorrectAnswers = answeredQuestions - correctAnswers
    const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers,
      unanswered: totalQuestions - answeredQuestions,
      percentage
    }
  }

  const retakeTest = () => {
    setCurrentQuestionIndex(0)
    setTestStarted(false)
    setTestCompleted(false)
    setAttemptId(null)
    setShowExplanation(false)
    setShowReviewMode(false)

    // Reset answers
    const resetAnswers = userAnswers.map(answer => ({
      ...answer,
      selectedOption: null,
      isCorrect: false
    }))
    setUserAnswers(resetAnswers)
  }

  // Toggle review mode
  const toggleReviewMode = () => {
    setShowReviewMode(!showReviewMode)
    setCurrentQuestionIndex(0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h1>
          <p className="text-gray-600 mb-6">The test you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/custom-test/create')}>
            Create New Test
          </Button>
        </div>
      </div>
    )
  }

  // Test completion screen
  if (testCompleted && !showReviewMode) {
    const results = calculateResults()
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Award className="h-6 w-6 text-yellow-500" />
                Test Completed!
              </CardTitle>
              <CardDescription>{test.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center">
                <CircleProgress percentage={results.percentage} size={120} strokeWidth={10}/>
                <p className="text-gray-600">Overall Score</p>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                  <div className="text-sm text-green-600">Correct</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.incorrectAnswers}</div>
                  <div className="text-sm text-red-600">Incorrect</div>
                </div>
              </div>

              {results.unanswered > 0 && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{results.unanswered}</div>
                  <div className="text-sm text-gray-600">Unanswered</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {/* Show Review Answers button for exam mode */}
                {test.test_mode === 'exam' && (
                  <Button onClick={toggleReviewMode} variant="outline" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Review Answers
                  </Button>
                )}
                <Button onClick={retakeTest} variant="outline" className="flex-1">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Test
                </Button>
                <Button onClick={() => router.push('/custom-test/create')} className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create New Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Test start screen
  if (!testStarted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{test.title}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{test.total_questions}</div>
                  <div className="text-sm text-blue-600">Questions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{test.total_marks}</div>
                  <div className="text-sm text-purple-600">Total Marks</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Test Mode:</h3>
                <Badge variant={test.test_mode === 'regular' ? 'default' : 'secondary'}>
                  {test.test_mode === 'regular' ? 'Regular Mode' : 'Exam Mode'}
                </Badge>
                <p className="text-sm text-gray-600">
                  {test.test_mode === 'regular'
                    ? 'You will see explanations immediately after each question'
                    : 'Explanations will be shown after completing the test'
                  }
                </p>
              </div>

              <Button onClick={startTest} className="w-full" size="lg">
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Test taking interface
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = userAnswers.find(a => a.questionId === currentQuestion.question_id)

  // Determine if we should show explanations
  const shouldShowExplanation = (test.test_mode === 'regular' && showExplanation) ||
    (test.test_mode === 'exam' && showReviewMode)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-0">
          <div className="">
            <Card className='shadow-none border-none'>
              <CardContent>
                <div className="flex items-center gap-2">
                  {questions.map((_, index) => {
                    const answer = userAnswers[index]
                    const isAnswered = answer?.selectedOption !== null
                    const isCurrent = index === currentQuestionIndex
                    const isCorrect = answer?.isCorrect || false

                    // For exam mode after completion, show correct/incorrect colors
                    // For regular mode or during test, show answered/unanswered
                    const getButtonStyle = () => {
                      if (isCurrent) {
                        return 'bg-gray-300 p-1 text-white border-gray-300'
                      }

                      // Show correct/incorrect colors only in review modes
                      if ((test.test_mode === 'exam' && testCompleted) || (test.test_mode === 'regular' && isAnswered)) {
                        if (isAnswered) {
                          return isCorrect
                            ? 'bg-green-500 text-green-800 border-green-500'
                            : 'bg-red-300 text-red-800 border-red-300'
                        }
                      }
                      // Default answered/unanswered colors
                      return isAnswered
                        ? 'bg-blue-500 text-green-800 border-blue-500'
                        : 'bg-white  border-gray-300 hover:border-gray-400'
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index)
                          setShowExplanation(false)
                        }}
                        className={`w-2 h-2 text-xs rounded-full border-2 transition-colors ${getButtonStyle()}`}
                      >
                        {/* {index + 1} */}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <Card className='shadow-none border-none'>
              <CardHeader>
                <CardTitle className="flex items-start gap-3 pt-0">
                  <span className="flex-1 whitespace-pre-wrap  text-xl font-semibold">{currentQuestionIndex + 1}. {currentQuestion.questions.question_text}</span>
                </CardTitle>
                <CardDescription>
                  {/* <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Marks: {currentQuestion.marks}</span>
                    <Badge variant="secondary" className="ml-2">
                      {currentQuestion.questions.difficulty_level}
                    </Badge>
                  </div> */}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Answer Options */}
                <RadioGroup
                  value={currentAnswer?.selectedOption?.toString() || ''}
                  onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                  disabled={shouldShowExplanation || showReviewMode}
                >
                  <div className="space-y-3">
                    {[
                      { value: '1', text: currentQuestion.questions.option_a, label: 'A' },
                      { value: '2', text: currentQuestion.questions.option_b, label: 'B' },
                      { value: '3', text: currentQuestion.questions.option_c, label: 'C' },
                      { value: '4', text: currentQuestion.questions.option_d, label: 'D' }
                    ].map((option) => {
                      const isSelected = currentAnswer?.selectedOption === parseInt(option.value)
                      const isCorrect = parseInt(option.value) === currentQuestion.questions.correct_option
                      const showResult = shouldShowExplanation

                      return (
                        <div key={option.value}>
                          <Label
                            htmlFor={option.value}
                            className={`flex justify-between items-center space-x-3 py-4 px- rounded-lg border transition-colors ${showResult
                              ? isCorrect
                                ? 'bg-green-50 border-none'
                                : isSelected && !isCorrect
                                  ? 'bg-red-50 border-none'
                                  : 'border-none bg-white shadow'
                              : isSelected
                                ? 'bg-blue-50 border-none'
                                : 'bg-white shadow  border-none hover:bg-gray-50'
                              }`}
                          >
                            <div className='flex items-center space-x-3 py-1 px-3 rounded-lg w-full'>
                              <RadioGroupItem value={option.value} id={option.value} />
                              <span className="font-medium text-sm px-2 py-1 rounded">
                                {option.label}
                              </span>
                              <span className="flex-1">{option.text}</span>
                              {showResult && isCorrect && (
                                <span className='text-xs text-green-500 font-bold'>correct</span>
                              )}
                              {showResult && isSelected && !isCorrect && (
                                <span className='text-xs text-red-500 font-bold'>incorrect</span>
                              )}
                            </div>
                          </Label>
                        </div>
                      )
                    })}
                  </div>
                </RadioGroup>

                {/* Explanation */}
                {shouldShowExplanation && (
                  <div className="mt-6 py-4 border-none rounded-lg w-full">
                    <h4 className="font-medium text-sm text-gray-400 mb-2">Explanation</h4>
                    <p className="text-gray-800 text-sm/7  whitespace-pre-wrap py-4 prose w-full">{currentQuestion.questions.explanation}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className='text-xs text-gray-600 font-bold'>
                        {currentQuestion.questions.subjects.name}
                      </p>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-xs text-gray-600">{currentQuestion.questions.topics.name}</span>
                    </div>
                    <p className='text-xs py-4'>{currentQuestion.question_id}</p>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t">
                  <Button
                    onClick={previousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    {showReviewMode ? (
                      <Button onClick={toggleReviewMode} variant="outline">
                        See Results
                      </Button>
                    ) : currentQuestionIndex === questions.length - 1 ? (
                      <Button onClick={submitTest} className="bg-green-600 hover:bg-green-700">
                        Submit Test
                      </Button>
                    ) : (
                      <Button
                        onClick={nextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1 && test.test_mode === 'regular'}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Question Navigator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
                  {questions.map((_, index) => {
                    const answer = userAnswers[index]
                    const isAnswered = answer?.selectedOption !== null
                    const isCurrent = index === currentQuestionIndex
                    const isCorrect = answer?.isCorrect || false

                    // For exam mode after completion, show correct/incorrect colors
                    // For regular mode or during test, show answered/unanswered
                    const getButtonStyle = () => {
                      if (isCurrent) {
                        return 'bg-blue-500 text-white border-blue-500'
                      }

                      // Show correct/incorrect colors only in review modes
                      if ((test.test_mode === 'exam' && testCompleted) || (test.test_mode === 'regular' && isAnswered)) {
                        if (isAnswered) {
                          return isCorrect
                            ? 'bg-green-100 text-green-800 border-green-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }
                      }

                      // Default answered/unanswered colors
                      return isAnswered
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index)
                          setShowExplanation(false)
                        }}
                        className={`w-8 h-8 text-xs rounded-full border-2 transition-colors ${getButtonStyle()}`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span>Current</span>
                  </div>
                  {(test.test_mode === 'exam' && testCompleted) ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded-full"></div>
                        <span>Correct</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded-full"></div>
                        <span>Incorrect</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded-full"></div>
                        <span>Answered</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
                        <span>Not Answered</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Test Summary */}
                {/* <div className="mt-6 pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-medium">
                      {userAnswers.filter(a => a.selectedOption !== null).length}/{questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium">
                      {questions.length - userAnswers.filter(a => a.selectedOption !== null).length}
                    </span>
                  </div>
                  {testCompleted && (
                    <div className="flex justify-between">
                      <span>Correct:</span>
                      <span className="font-medium text-green-600">
                        {userAnswers.filter(a => a.isCorrect).length}
                      </span>
                    </div>
                  )}
                </div> */}

                {/* Submit Button for Exam Mode */}
                {test.test_mode === 'exam' && !testCompleted && (
                  <Button
                    onClick={submitTest}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Submit Test
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div >
  )
}