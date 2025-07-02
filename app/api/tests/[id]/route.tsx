// app/api/tests/[id]/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get test details
    const { data: test, error: testError } = await supabase
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
        negative_marking,
        sections,
        scheduled_at,
        expires_at,
        created_at,
        created_by,
        share_code
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (testError) {
      console.error('Test fetch error:', testError)
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    // Get test questions with question details
    const { data: testQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_id,
        question_order,
        marks,
        section_number,
        questions!test_questions_question_id_fkey (
          id,
          question_text,
          explanation,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          difficulty_level,
          subject_id,
          topic_id,
          subjects!questions_subject_id_fkey (
            id,
            name
          ),
          topics!questions_topic_id_fkey (
            id,
            name
          )
        )
      `)
      .eq('test_id', id)
      .order('question_order')

    if (questionsError) {
      console.error('Questions fetch error:', questionsError)
      throw questionsError
    }
    // Transform the data to match the expected format
    // Transform the data to match the expected format
    const subjects = Array.from(
      new Map(testQuestions
        .flatMap(tq => (tq.questions ?? []))
        .flatMap(question => question.subjects ?? [])
        .filter(Boolean)
        .map(subject => [subject.id, subject])
      ).values()
    )
    const transformedQuestions = testQuestions?.map(tq => ({
      id: tq.id,
      question_id: tq.question_id,
      question_order: tq.question_order,
      marks: tq.marks,
      subjects: subjects,
      section_number: tq.section_number,
      question: tq.questions && tq.questions.length > 0 ? {
        id: tq.id, // Also incorrect, should be tq.questions.id
        question_text: tq.questions[0].question_text, // Error here
        explanation: tq.questions[0].explanation,
        option_a: tq.questions[0].option_a,
        option_b: tq.questions[0].option_b,
        option_c: tq.questions[0].option_c,
        option_d: tq.questions[0].option_d,
        correct_option: tq.questions[0].correct_option,
        difficulty_level: tq.questions[0].difficulty_level,
        subject_id: tq.questions[0].subject_id,
        topic_id: tq.questions[0].topic_id,
        subject: tq.questions[0].subjects,
        topic: tq.questions[0].topics
      } : null
    })) || [];
    // Check if user has already attempted this test
    const { data: attempt, error: attemptError } = await supabase
      .from('user_test_attempts')
      .select('id, started_at, submitted_at, is_completed, total_score')
      .eq('test_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (attemptError) {
      console.error('Attempt fetch error:', attemptError)
      // Don't throw here, just log the error
    }

    return NextResponse.json({
      test: {
        ...test,
        user_attempt: attempt,
        subjects: subjects
      },
      questions: testQuestions
    })
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testo' },
      { status: 503 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  try {

    const { id } = await params
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is the creator of the test
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('created_by')
      .eq('id', id)
      .single()

    if (testError) {
      console.error('Test ownership check error:', testError)
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      )
    }

    if (!test || test.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete tests you created' },
        { status: 403 }
      )
    }

    // Soft delete the test
    const { error } = await supabase
      .from('tests')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Test deletion error:', error)
      throw error
    }

    return NextResponse.json({ message: 'Test deleted successfully' })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    )
  }
}