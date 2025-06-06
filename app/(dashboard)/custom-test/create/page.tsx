'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'react-hot-toast'
import { Play, Zap, Clock, ClipboardPlus } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import UserAuthState from '@/components/user-auth-state'

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

  // Preset configurations for quick start
  const presets = [
    { questions: 10, label: 'Quick', icon: Zap, description: '10 questions' },
    { questions: 25, label: 'Standard', icon: Zap, description: '25 questions' },
    { questions: 50, label: 'Extended', icon: Zap, description: '50 questions' }
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
          subjects: selectedSubjects.length === subjects.length ? 'all' : selectedSubjects,
          createdBy: user.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create test')
      }

      const result = await response.json()
      toast.success('Test ready!')
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4">
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
      <div className="max-w-3xl mx-auto py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Test</h1>
          <p className="text-gray-600">Quick setup, powerful practice</p>
        </div>

        <div className="space-y-2">
          <section className='flex flex-col md:flex-row gap-6'>
            {/* Quick Presets */}
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Choose Test Length</h3>
                <div className="flex flex-col  gap-3">
                  {presets.map((preset) => {
                    const Icon = preset.icon
                    const isSelected = numberOfQuestions === preset.questions
                    return (
                      <button
                        key={preset.questions}
                        onClick={() => setNumberOfQuestions(preset.questions)}
                        className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                          ? 'bg-[#66c3c1]/20 border-[#66c3c1] text-[#66c3c1] shadow-sm'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-[#66c3c1]' : 'text-gray-500'}`} />
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
                  className="grid grid-cols-1  gap-3"
                >
                  <Label htmlFor="regular" className="font-medium cursor-pointer text-gray-900">
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${testMode === 'regular' ? 'border-[#66c3c1] bg-[#66c3c1]/5' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="regular" id="regular" className="border-[#66c3c1] text-[#66c3c1]" />
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
                    <div className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${testMode === 'exam' ? 'border-[#66c3c1] bg-[#66c3c1]/5' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="exam" id="exam" className="border-[#66c3c1] text-[#66c3c1]" />
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
                    className="text-sm text-[#66c3c1] hover:text-[#66c3c1]/80 font-medium"
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
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${isSelected
                        ? 'bg-[#66c3c1] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
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
          <div className="">
            <Button
              onClick={handleCreateTest}
              disabled={isLoading || selectedSubjects.length === 0}
              className="w-full  text-lg font-semibold bg-[#66c3c1] hover:bg-[#66c3c1]/90 shadow-lg"
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
    </div >
  )
}