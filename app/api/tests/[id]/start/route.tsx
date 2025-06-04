import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Define interfaces for TypeScript
interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  difficulty_level: string;
}

interface TestQuestion {
  id: string;
  question_order: number;
  marks: number;
  section_number: number;
  questions: Question | null;
}

interface Test {
  id: string;
  title: string;
  duration_minutes: number;
  test_type: string;
  scheduled_at: string | null;
  expires_at: string | null;
}

interface UserAttempt {
  id: string;
  started_at: string;
  is_completed: boolean;
}

interface UserAnswer {
  question_id: string;
  selected_option: string;
  is_marked_for_review: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if test exists and is active
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, title, duration_minutes, test_type, scheduled_at, expires_at')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (testError || !test) {
      console.error('Test fetch error:', testError);
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // Check if test is scheduled and available
    const now = new Date();
    if (test.scheduled_at && new Date(test.scheduled_at) > now) {
      return NextResponse.json({ error: 'Test has not started yet' }, { status: 400 });
    }

    if (test.expires_at && new Date(test.expires_at) < now) {
      return NextResponse.json({ error: 'Test has expired' }, { status: 400 });
    }

    // Check if user has already completed this test
    const { data: existingAttempt, error: attemptError } = await supabase
      .from('user_test_attempts')
      .select('id, is_completed')
      .eq('test_id', id)
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .maybeSingle();

    if (attemptError) {
      console.error('Attempt fetch error:', attemptError);
      // return NextResponse.json({ error: 'Failed to check existing attempt' }, { status: 500 });
    }

    if (existingAttempt && test.test_type === 'grand_test') {
      return NextResponse.json({ error: 'You have already completed this test' }, { status: 400 });
    }

    // Check for ongoing attempt
    const { data: ongoingAttempt, error: ongoingError } = await supabase
      .from('user_test_attempts')
      .select('id, started_at, is_completed')
      .eq('test_id', id)
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .maybeSingle();

    if (ongoingError) {
      console.error('Ongoing attempt fetch error:', ongoingError);
      return NextResponse.json({ error: 'Failed to check ongoing attempt' }, { status: 500 });
    }

    let attempt: UserAttempt;
    if (ongoingAttempt) {
      attempt = ongoingAttempt;
    } else {
      // Create new attempt
      const { data: newAttempt, error: newAttemptError } = await supabase
        .from('user_test_attempts')
        .insert({
          user_id: user.id,
          test_id: id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (newAttemptError) {
        console.error('New attempt creation error:', newAttemptError);
        return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 });
      }
      attempt = newAttempt;
    }

    // Get test questions for the attempt
    const { data: questions, error: questionsError } = await supabase
      .from('test_questions')
      .select(`
        id,
        question_order,
        marks,
        section_number,
        questions!test_questions_question_id_fkey (
          id,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          difficulty_level
        )
      `)
      .eq('test_id', id)
      .order('question_order');

    if (questionsError) {
      console.error('Questions fetch error:', questionsError);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    // console.log('Raw questions:', questions);

    // Get existing answers if any
    const { data: existingAnswers, error: answersError } = await supabase
      .from('user_answers')
      .select('question_id, selected_option, is_marked_for_review')
      .eq('attempt_id', attempt.id);

    if (answersError) {
      console.error('Answers fetch error:', answersError);
      return NextResponse.json({ error: 'Failed to fetch answers' }, { status: 500 });
    }

    const answersMap = existingAnswers?.reduce(
      (acc, answer: UserAnswer) => {
        acc[answer.question_id] = {
          selected_option: answer.selected_option,
          is_marked_for_review: answer.is_marked_for_review,
        };
        return acc;
      },
      {} as Record<string, { selected_option: string; is_marked_for_review: boolean }>
    ) || {};

    // Calculate remaining time
    const startTime = new Date(attempt.started_at);
    const elapsedMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
    const remainingMinutes = Math.max(0, test.duration_minutes - elapsedMinutes);


    return NextResponse.json({
      attempt: {
        id: attempt.id,
        test_id: test.id,
        test_title: test.title,
        started_at: attempt.started_at,
        duration_minutes: test.duration_minutes,
        remaining_minutes: remainingMinutes,
        question: questions?.map((tq: any) => {
          const question = Array.isArray(tq.questions) ? tq.questions[0] : tq.questions;
          return {
            id: question?.id,
            question_text: question?.question_text,
            option_a: question?.option_a,
            option_b: question?.option_b,
            option_c: question?.option_c,
            option_d: question?.option_d,
            difficulty_level: question?.difficulty_level,
            test_question_id: tq.id,
            question_order: tq.question_order,
            marks: tq.marks,
            section_number: tq.section_number,
            user_answer: question ? answersMap[question.id] || null : null,
          };
        }) || [],
      },
    });
  } catch (error) {
    console.error('Error starting test:', error);
    return NextResponse.json({ error: 'Failed to start test' }, { status: 500 });
  }
}