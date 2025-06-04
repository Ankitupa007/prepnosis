'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'react-hot-toast'
import { BookOpen, Settings, Play } from 'lucide-react'

interface Subject {
  id: string
  name: string
  description: string
}

export default function CreateCustomTest() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loadingSubjects, setLoadingSubjects] = useState(true)

  // Form state
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(25)
  const [testMode, setTestMode] = useState<'regular' | 'exam'>('regular')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [selectAllSubjects, setSelectAllSubjects] = useState(false)

  const questionOptions = [10, 25, 40, 50, 100]

  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects')
        if (response.ok) {
          const data = await response.json()
          setSubjects(data.subjects)
        } else {
          toast.error('Failed to load subjects')
        }
      } catch (error) {
        console.error('Error fetching subjects:', error)
        toast.error('Failed to load subjects')
      } finally {
        setLoadingSubjects(false)
      }
    }

    fetchSubjects()
  }, [])

  // Handle select all subjects
  useEffect(() => {
    if (selectAllSubjects) {
      setSelectedSubjects(subjects.map(s => s.id))
    } else {
      setSelectedSubjects([])
    }
  }, [selectAllSubjects, subjects])

  // Handle individual subject selection
  const handleSubjectChange = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId])
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId))
      setSelectAllSubjects(false)
    }
  }

  // Create custom test
  const handleCreateTest = async () => {
    if (!user) {
      toast.error('Please login to create tests')
      return
    }

    if (!selectAllSubjects && selectedSubjects.length === 0) {
      toast.error('Please select at least one subject')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/tests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numberOfQuestions,
          testMode,
          subjects: selectAllSubjects ? 'all' : selectedSubjects,
          createdBy: user.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create test')
      }

      const result = await response.json()
      toast.success('Custom test created successfully!')
      router.push(`/custom-test/${result.testId}`)
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error('Failed to create test. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingSubjects) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Custom Test</h1>
          <p className="text-gray-600 mt-2">Design your personalized practice test</p>
        </div>

        <div className="space-y-6">
          {/* Number of Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Number of Questions
              </CardTitle>
              <CardDescription>
                Choose how many questions you want in your test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={numberOfQuestions.toString()} onValueChange={(value) => setNumberOfQuestions(parseInt(value))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select number of questions" />
                </SelectTrigger>
                <SelectContent>
                  {questionOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option} Questions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Test Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Mode
              </CardTitle>
              <CardDescription>
                Choose how you want to take the test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={testMode} onValueChange={(value) => setTestMode(value as 'regular' | 'exam')}>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="regular" id="regular" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="regular" className="font-medium cursor-pointer">
                        Regular Mode
                      </Label>
                      <p className="text-sm text-gray-600">
                        See correct answer and explanation immediately after each question
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="exam" id="exam" className="mt-1" />
                    <div className="space-y-1">
                      <Label htmlFor="exam" className="font-medium cursor-pointer">
                        Exam Mode
                      </Label>
                      <p className="text-sm text-gray-600">
                        View results and explanations only after completing the entire test
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Subject Selection</CardTitle>
              <CardDescription>
                Choose subjects for your test questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Select All Option */}
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <Checkbox
                    id="select-all"
                    checked={selectAllSubjects}
                    onCheckedChange={(checked) => setSelectAllSubjects(checked as boolean)}
                  />
                  <Label htmlFor="select-all" className="font-medium cursor-pointer">
                    All Subjects
                  </Label>
                </div>

                {/* Individual Subjects */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2 p-2">
                      <Checkbox
                        id={subject.id}
                        checked={selectAllSubjects || selectedSubjects.includes(subject.id)}
                        disabled={selectAllSubjects}
                        onCheckedChange={(checked) => handleSubjectChange(subject.id, checked as boolean)}
                      />
                      <Label htmlFor={subject.id} className="cursor-pointer flex-1">
                        <div>
                          <div className="font-medium">{subject.name}</div>
                          {subject.description && (
                            <div className="text-sm text-gray-600">{subject.description}</div>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Test Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleCreateTest}
                disabled={isLoading || (!selectAllSubjects && selectedSubjects.length === 0)}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating Test...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Create Test ({numberOfQuestions} Questions)
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}