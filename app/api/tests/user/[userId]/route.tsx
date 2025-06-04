// app/api/tests/user/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createClient()
    const { userId } = await params
    // Verify the authenticated user matches the requested userId
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch user's custom tests with related data
    const { data: tests, error } = await supabase
      .from('tests')
      .select(`
        id,
        title,
        description,
        test_type,
        test_mode,
        exam_pattern,
        total_questions,
        total_marks,
        duration_minutes,
        created_at,
        test_questions!inner(
          questions(
            subjects(id, name),
            topics(id, name)
          )
        ),
        user_test_attempts(
          id,
          total_score,
          correct_answers,
          submitted_at,
          time_taken_minutes,
          is_completed
        )
      `)
      .eq('created_by', userId)
      .eq('test_type', 'custom')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch tests' }, { status: 500 })
    }

    // Transform the data to match the expected format
    const transformedTests = tests?.map(test => {
      // Get unique subjects from test questions
      const subjects = Array.from(
        new Map(
          test.test_questions
            .flatMap(tq => (tq.questions ?? []))
            .flatMap(question => question.subjects ?? [])
            .filter(Boolean)
            .map(subject => [subject.id, subject])
        ).values()
      )

      // Transform attempts data
      const attempts = test.user_test_attempts
        .filter(attempt => attempt.is_completed)
        .map(attempt => ({
          id: attempt.id,
          score: Math.round((attempt.correct_answers / test.total_questions) * 100),
          total_questions: test.total_questions,
          correct_answers: attempt.correct_answers,
          completed_at: attempt.submitted_at,
          time_taken: attempt.time_taken_minutes
        }))

      return {
        id: test.id,
        title: test.title,
        description: test.description,
        test_mode: test.test_mode,
        total_questions: test.total_questions,
        total_marks: test.total_marks,
        created_at: test.created_at,
        subjects: subjects,
        attempts: attempts,
        _count: {
          attempts: attempts.length
        }
      }
    }) || []

    return NextResponse.json({
      tests: transformedTests,
      total: transformedTests.length
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}