// app/api/tests/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Question } from '@/lib/types/test'
import { createClient } from '@/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { numberOfQuestions, testMode, subjects, createdBy } = await request.json()

    // Validate input
    if (!numberOfQuestions || !testMode || !subjects || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== createdBy) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Build question query
    let questionQuery = supabase
      .from('questions')
      .select('*')
      .eq('is_active', true)

    // Apply subject filter
    if (subjects !== 'all' && Array.isArray(subjects) && subjects.length > 0) {
      questionQuery = questionQuery.in('subject_id', subjects)
    }

    // Fetch available questions
    const { data: availableQuestions, error: questionsError } = await questionQuery

    if (questionsError) {
      console.error('Error fetching questions:', questionsError)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    if (!availableQuestions || availableQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for selected subjects' },
        { status: 400 }
      )
    }

    // Randomly select questions
    const shuffledQuestions = availableQuestions.sort(() => Math.random() - 0.5)
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(numberOfQuestions, availableQuestions.length))
    // console.log('Selected Questions:', selectedQuestions)

    // Create test record
    const testData = {
      title: `Custom Test - ${numberOfQuestions} Questions`,
      description: `Custom practice test with ${selectedQuestions.length} questions in ${testMode} mode`,
      test_type: 'custom',
      test_mode: testMode,
      exam_pattern: 'NEET_PG', // Default pattern
      total_questions: selectedQuestions.length,
      total_marks: selectedQuestions.length * 4, // 4 marks per question
      duration_minutes: 0, // No time limit for custom tests
      negative_marking: 0, // No negative marking for custom tests
      is_active: true,
      created_by: createdBy
    }

    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert([testData])
      .select()
      .single()

    if (testError) {
      console.error('Error creating test:', testError)
      return NextResponse.json(
        { error: 'Failed to create test' },
        { status: 500 }
      )
    }

    // Create test-question mappings
    const testQuestions = selectedQuestions.map((question: Question, index: number) => ({
      test_id: test.id,
      question_id: question.id,
      section_number: 1,
      question_order: index + 1,
      marks: 4
    }))

    const { error: mappingError } = await supabase
      .from('test_questions')
      .insert(testQuestions)

    if (mappingError) {
      console.error('Error creating test questions mapping:', mappingError)
      // Clean up the test record if mapping fails
      await supabase.from('tests').delete().eq('id', test.id)
      return NextResponse.json(
        { error: 'Failed to create test questions mapping' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      testId: test.id,
      totalQuestions: selectedQuestions.length,
      message: 'Custom test created successfully'
    })

  } catch (error) {
    console.error('Error in create test API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}