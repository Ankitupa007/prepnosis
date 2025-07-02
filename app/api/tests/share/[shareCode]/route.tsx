// app/api/tests/share/[shareCode]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareCode: string }> }
) {
  try {
    const { shareCode } = await params

    if (!shareCode) {
      return NextResponse.json(
        { error: 'Share code is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find test by share code
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select(`
        *,
        test_questions (
          id,
          question_id,
          section_number,
          question_order,
          marks,
          question:questions (
            id,
            question_text,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_option,
            choice_type,
            subject_id,
            topic_id,
            difficulty_level,
            explanation
          )
        )
      `)
      .eq('share_code', shareCode.toUpperCase())
      .eq('is_active', true)
      .eq('is_shareable', true)
      .single()

    if (testError || !test) {
      return NextResponse.json(
        { error: 'Test not found or not shareable' },
        { status: 404 }
      )
    }

    // Check if test has expired (if share_expires_at is set)
    if (test.share_expires_at) {
      const now = new Date()
      const expirationDate = new Date(test.share_expires_at)
      if (now > expirationDate) {
        return NextResponse.json(
          { error: 'This shared test has expired' },
          { status: 410 }
        )
      }
    }

    // Get test statistics (optional)
    const { data: attemptStats } = await supabase
      .from('user_test_attempts')
      .select('id, total_score, is_completed')
      .eq('test_id', test.id)
      .eq('is_completed', true)

    const stats = {
      total_attempts: attemptStats?.length || 0,
      average_score: attemptStats?.length
        ? attemptStats.reduce((sum, attempt) => sum + attempt.total_score, 0) / attemptStats.length
        : 0
    }

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        test_type: test.test_type,
        test_mode: test.test_mode,
        total_questions: test.total_questions,
        total_marks: test.total_marks,
        duration_minutes: test.duration_minutes,
        negative_marking: test.negative_marking,
        share_code: test.share_code,
        created_at: test.created_at
      },
      questions: test.test_questions?.map((tq: any) => ({
        id: tq.question.id,
        question_text: tq.question.question_text,
        option_a: tq.question.option_a,
        option_b: tq.question.option_b,
        option_c: tq.question.option_c,
        option_d: tq.question.option_d,
        choice_type: tq.question.choice_type,
        subject_id: tq.question.subject_id,
        topic_id: tq.question.topic_id,
        difficulty_level: tq.question.difficulty_level,
        explanation: tq.question.explanation,
        marks: tq.marks,
        question_order: tq.question_order,
        section_number: tq.section_number
      })).sort((a: any, b: any) => a.question_order - b.question_order) || [],
      stats
    })

  } catch (error) {
    console.error('Error fetching shared test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}