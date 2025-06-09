// app/api/tests/[id]/submit/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import React, { use } from 'react';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { attemptId, answers } = body // answers: Array of { questionId, selectedOption, isCorrect }

    // Define the type for answer objects
    type Answer = {
      selectedOption: number;
      isCorrect: boolean;
      questionId: string;
    };

    const calculateResults = () => {
      const totalQuestions = answers.length
      const answeredQuestions = answers.filter((a: Answer) => a.selectedOption !== null).length
      const correctAnswers = answers.filter((a: Answer) => a.isCorrect).length
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

    const results = calculateResults()

    // Get the ongoing attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('user_test_attempts')
      .select('id, started_at, test_id')
      .eq('test_id', id)
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .maybeSingle()

    if (attemptError) throw attemptError

    if (!attempt) {
      return NextResponse.json(
        { error: 'No active attempt found' },
        { status: 404 }
      )
    }

    // Get test details for negative marking
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('negative_marking, test_type')
      .eq('id', id)
      .single()

    if (testError) throw testError

    // Prepare user answers for insertion
    const userAnswerInserts = []

    // Iterate through the answers array properly
    for (const answer of answers) {
      const { questionId, selectedOption, isCorrect } = answer

      // Calculate marks awarded based on correctness and negative marking
      let marksAwarded = 0
      if (selectedOption !== null && selectedOption !== undefined) {
        if (isCorrect) {
          marksAwarded = 4 // Assuming 4 mark for correct answer
        } else if (test.negative_marking) {
          marksAwarded = test.negative_marking // Assuming -1 for incorrect answer with negative marking
        }
      }

      userAnswerInserts.push({
        attempt_id: attemptId,
        question_id: questionId,
        selected_option: selectedOption,
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
        answered_at: new Date().toISOString()
      })
    }

    // Insert all user answers
    const { error: answersError } = await supabase
      .from('user_answers')
      .upsert(userAnswerInserts, {
        onConflict: 'attempt_id,question_id'
      })

    if (answersError) throw answersError

    // Calculate total time taken
    const startTime = new Date(attempt.started_at)
    const endTime = new Date()
    const timeTakenMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    // Update the attempt
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('user_test_attempts')
      .update({
        submitted_at: endTime.toISOString(),
        total_score: results.percentage,
        correct_answers: results.correctAnswers,
        incorrect_answers: results.incorrectAnswers,
        unanswered: results.unanswered,
        time_taken_minutes: timeTakenMinutes,
        is_completed: true,
        section_times: null
      })
      .eq('id', attempt.id)
      .select()
      .single()

    if (updateError) throw updateError

    // If it's a grand test, calculate rankings
    if (test.test_type === 'grand_test') {
      // Get all completed attempts for this test
      const { data: allAttempts, error: rankingError } = await supabase
        .from('user_test_attempts')
        .select(`
          id,
          user_id,
          total_score,
          time_taken_minutes,
          user_profiles!user_test_attempts_user_id_fkey (
            full_name
          )
        `)
        .eq('test_id', id)
        .eq('is_completed', true)
        .order('total_score', { ascending: false })
        .order('time_taken_minutes', { ascending: true })

      if (rankingError) throw rankingError

      // Calculate rankings and percentiles
      const totalAttempts = allAttempts?.length || 0
      const rankings = allAttempts?.map((attempt, index) => {
        const rank = index + 1
        const percentile = totalAttempts > 1 ?
          ((totalAttempts - rank) / (totalAttempts - 1)) * 100 : 100

        return {
          test_id: id,
          user_id: attempt.user_id,
          attempt_id: attempt.id,
          rank: rank,
          score: attempt.total_score,
          percentile: Math.round(percentile * 100) / 100
        }
      }) || []

      // Upsert rankings
      if (rankings.length > 0) {
        const { error: rankingsError } = await supabase
          .from('test_rankings')
          .upsert(rankings, {
            onConflict: 'test_id,user_id'
          })

        if (rankingsError) {
          console.error('Error updating rankings:', rankingsError)
          // Don't fail the submission if ranking update fails
        }
      }
    }

    return NextResponse.json({
      attempt: updatedAttempt,
      results: {
        total_score: results.percentage,
        correct_answers: results.correctAnswers,
        incorrect_answers: results.incorrectAnswers,
        unanswered: results.unanswered,
        time_taken_minutes: timeTakenMinutes,
        total_questions: answers?.length || 0,
        accuracy: answers?.length ?
          Math.round((results.correctAnswers / answers.length) * 100) : 0
      }
    })
  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    )
  }
}