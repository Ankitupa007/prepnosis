'use client'

import LoadingSpinner from '@/components/common/LoadingSpinner'
import SubjectIcons from '@/components/common/SubjectIcons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import UserHeader from '@/components/user-header'
import { useAuth } from '@/lib/auth-context'
import { ClipboardPlus, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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

  // Simplified form state with smart defaults
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(25)
  const [testMode, setTestMode] = useState<'regular' | 'exam'>('regular')
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  // New sharing state
  const [enableSharing, setEnableSharing] = useState(true)

  // Preset configurations for quick start
  const presets = [
    { questions: 10, label: 'Quick', icon: Zap, description: '10 questions' },
    { questions: 25, label: 'Standard', icon: Zap, description: '25 questions' },
    { questions: 50, label: 'Extended', icon: Zap, description: '50 questions' },
    { questions: 100, label: 'TestLike', icon: Zap, description: '100 questions' }
  ]


  // Fetch subjects on component mount
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/subjects')
        if (response.ok) {
          const data = await response.json()
          setSubjects(data.subjects)
          // Auto-select all subjects by default for minimal friction
          setSelectedSubjects(data.subjects.map((s: Subject) => s.id))
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

  // Create custom test
  const handleCreateTest = async () => {
    if (!user) {
      toast.error('Please login to create tests')
      return
    }

    if (selectedSubjects.length === 0) {
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
          subjects: selectedSubjects,
          createdBy: user.id,
          enableSharing,
          shareExpiration: null, // Default to no expiration
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create test')
      }

      const result = await response.json()

      if (result.shareCode) {
        toast.success(`Test created with share code: ${result.shareCode}`)
        router.push(`/custom-test/${result.testId}`)
      }
    } catch (error) {
      console.error('Error creating test:', error)
      toast.error('Failed to create test. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader text='Create Custom Test' />

      {loadingSubjects ? (
        <div className="h-[80vh] bg-gray-50 flex items-center justify-center">
          <LoadingSpinner text='Loading Subjects' />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto py-6 px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Test</h1>
            <p className="text-gray-600">Quick setup, powerful practice</p>
          </div>

          <div className="space-y-4">
            <section className='flex flex-col lg:flex-row gap-6'>
              {/* Quick Presets */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Choose Test Length</h3>
                  <div className="flex flex-col gap-3">
                    {presets.map((preset) => {
                      const Icon = preset.icon
                      const isSelected = numberOfQuestions === preset.questions
                      return (
                        <button
                          key={preset.questions}
                          onClick={() => setNumberOfQuestions(preset.questions)}
                          className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                            ? 'bg-[#6FCCCA]/20 border-[#6FCCCA] text-[#6FCCCA] shadow-sm'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex items-center justify-center gap-3">
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-[#6FCCCA]' : 'text-gray-500'}`} />
                            <p className="text-sm text-gray-600">{preset.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Test Mode - Simplified */}
              <Card className="border-none shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Test Style</h3>
                  <RadioGroup
                    value={testMode}
                    onValueChange={(value) => setTestMode(value as 'regular' | 'exam')}
                    className="grid grid-cols-1 gap-3"
                  >
                    <Label htmlFor="regular" className="font-medium cursor-pointer text-gray-900">
                      <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${testMode === 'regular' ? 'border-[#6FCCCA] bg-[#6FCCCA]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="regular" id="regular" className="border-[#6FCCCA] text-[#6FCCCA]" />
                          <div>
                            Regular Mode
                            <p className="text-sm text-gray-600 mt-1">
                              Instant feedback after each question
                            </p>
                          </div>
                        </div>
                      </div>
                    </Label>
                    <Label htmlFor="exam" className="font-medium cursor-pointer text-gray-900">
                      <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${testMode === 'exam' ? 'border-[#6FCCCA] bg-[#6FCCCA]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="exam" id="exam" className="border-[#6FCCCA] text-[#6FCCCA]" />
                          <div>
                            Exam Mode
                            <p className="text-sm text-gray-600 mt-1">
                              Results shown at the end
                            </p>
                          </div>
                        </div>
                      </div>
                    </Label>
                  </RadioGroup>
                </CardContent>
              </Card>
            </section>

            {/* Subject Selection - Simplified */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Subjects</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSubjects(subjects.map(s => s.id))}
                      className="text-sm text-[#6FCCCA] hover:text-[#6FCCCA]/80 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setSelectedSubjects([])}
                      className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => {
                    const isSelected = selectedSubjects.includes(subject.id)
                    return (
                      <button
                        key={subject.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSubjects(prev => prev.filter(id => id !== subject.id))
                          } else {
                            setSelectedSubjects(prev => [...prev, subject.id])
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-all duration-200 ${isSelected
                          ? 'bg-[#6FCCCA] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                      >
                        <SubjectIcons subjectName={subject.name} styles='w-4 h-4' />
                        {subject.name}
                      </button>
                    )
                  })}
                </div>

                {selectedSubjects.length > 0 && (
                  <p className="text-sm text-gray-600 mt-3">
                    {selectedSubjects.length} of {subjects.length} subjects selected
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Start Test Button */}
            <div>
              <Button
                onClick={handleCreateTest}
                disabled={isLoading || selectedSubjects.length === 0}
                className="w-full text-lg font-semibold bg-[#6FCCCA] hover:bg-[#6FCCCA]/90 shadow"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Creating Test...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ClipboardPlus className="h-5 w-5" />
                    Create Test ({numberOfQuestions} Questions)
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}