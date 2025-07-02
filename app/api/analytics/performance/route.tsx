// app/api/analytics/performance/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get('time_range') || '30' // days
  const subjectId = searchParams.get('subject_id')

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const days = parseInt(timeRange)
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    // Get user's test attempts in the specified time range
    let attemptsQuery = supabase
      .from('user_test_attempts')
      .select(`
        id,
        test_id,
        total_score,
        correct_answers,
        incorrect_answers,
        unanswered,
        time_taken_minutes,
        submitted_at,
        tests!user_test_attempts_test_id_fkey (
          id,
          title,
          test_type,
          exam_pattern,
          total_questions,
          total_marks
        )
      `)
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .gte('submitted_at', fromDate.toISOString())
      .order('submitted_at', { ascending: true })

    const { data: attempts, error: attemptsError } = await attemptsQuery

    if (attemptsError) throw attemptsError

    // Get subject-wise performance
    let subjectQuery = supabase
      .from('user_subject_performance')
      .select(`
        total_questions_attempted,
        correct_answers,
        accuracy_percentage,
        average_time_per_question,
        last_updated,
        subjects!user_subject_performance_subject_id_fkey (
          id,
          name,
          weightage_neet_pg,
          weightage_inicet
        )
      `)
      .eq('user_id', user.id)

    if (subjectId) {
      subjectQuery = subjectQuery.eq('subject_id', subjectId)
    }

    const { data: subjectPerformance, error: subjectError } = await subjectQuery

    if (subjectError) throw subjectError

    // Get topic-wise performance for weak areas
    const { data: topicPerformance, error: topicError } = await supabase
      .from('user_topic_performance')
      .select(`
        total_questions_attempted,
        correct_answers,
        accuracy_percentage,
        strength_level,
        topics!user_topic_performance_topic_id_fkey (
          id,
          name
        ),
        subjects!user_topic_performance_subject_id_fkey (
          id,
          name
        )
      `)
      .eq('user_id', user.id)
      .lte('accuracy_percentage', 60) // Topics with accuracy <= 60%
      .order('accuracy_percentage', { ascending: true })
      .limit(10)

    if (topicError) throw topicError

    // Calculate overall statistics
    const totalAttempts = attempts?.length || 0
    const totalQuestions = attempts?.reduce((sum, attempt) =>
      sum + (attempt.tests?.[0]?.total_questions || 0), 0) || 0
    const totalCorrect = attempts?.reduce((sum, attempt) =>
      sum + attempt.correct_answers, 0) || 0
    const totalIncorrect = attempts?.reduce((sum, attempt) =>
      sum + attempt.incorrect_answers, 0) || 0
    const totalUnanswered = attempts?.reduce((sum, attempt) =>
      sum + attempt.unanswered, 0) || 0
    const totalTime = attempts?.reduce((sum, attempt) =>
      sum + attempt.time_taken_minutes, 0) || 0

    const overallAccuracy = totalQuestions > 0 ?
      Math.round((totalCorrect / totalQuestions) * 100) : 0
    const averageTimePerQuestion = totalQuestions > 0 ?
      Math.round((totalTime * 60) / totalQuestions) : 0 // in seconds

    // Calculate trend data (daily performance)
    const dailyPerformance = attempts?.reduce((acc, attempt) => {
      const date = new Date(attempt.submitted_at).toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          attempts: 0,
          total_questions: 0,
          correct_answers: 0,
          accuracy: 0,
          average_score: 0,
          total_score: 0
        }
      }

      acc[date].attempts++
      acc[date].total_questions += attempt.tests?.[0]?.total_questions || 0
      acc[date].correct_answers += attempt.correct_answers
      acc[date].total_score += attempt.total_score
      acc[date].accuracy = acc[date].total_questions > 0 ?
        Math.round((acc[date].correct_answers / acc[date].total_questions) * 100) : 0
      acc[date].average_score = Math.round(acc[date].total_score / acc[date].attempts)

      return acc
    }, {} as Record<string, any>) || {}

    // Get recent test performances for chart
    const recentTests = attempts?.slice(-10).map(attempt => ({
      test_name: attempt.tests?.[0]?.title || 'Unknown Test',
      test_type: attempt.tests?.[0]?.test_type,
      score: attempt.total_score,
      max_score: attempt.tests?.[0]?.total_marks || 0,
      accuracy: attempt.tests?.[0]?.total_questions ?
        Math.round((attempt.correct_answers / attempt.tests[0].total_questions) * 100) : 0,
      submitted_at: attempt.submitted_at
    })) || []

    return NextResponse.json({
      overall_stats: {
        total_attempts: totalAttempts,
        total_questions_attempted: totalQuestions,
        correct_answers: totalCorrect,
        incorrect_answers: totalIncorrect,
        unanswered: totalUnanswered,
        overall_accuracy: overallAccuracy,
        average_time_per_question: averageTimePerQuestion,
        total_study_time_minutes: totalTime
      },
      daily_performance: Object.values(dailyPerformance),
      subject_performance: subjectPerformance?.map(perf => ({
        subject: perf.subjects?.[0]?.name,
        subject_id: perf.subjects?.[0]?.id,
        questions_attempted: perf.total_questions_attempted,
        correct_answers: perf.correct_answers,
        accuracy: Math.round(perf.accuracy_percentage || 0),
        average_time: perf.average_time_per_question,
        weightage_neet_pg: perf.subjects?.[0]?.weightage_neet_pg,
        weightage_inicet: perf.subjects?.[0]?.weightage_inicet,
        last_updated: perf.last_updated
      })) || [],
      weak_topics: topicPerformance?.map(perf => ({
        topic: perf.topics?.[0]?.name,
        topic_id: perf.topics?.[0]?.id,
        subject: perf.subjects?.[0]?.name,
        subject_id: perf.subjects?.[0]?.id,
        questions_attempted: perf.total_questions_attempted,
        correct_answers: perf.correct_answers,
        accuracy: Math.round(perf.accuracy_percentage || 0),
        strength_level: perf.strength_level
      })) || [],
      recent_tests: recentTests,
      time_range_days: days
    })
  } catch (error) {
    console.error('Error fetching performance analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance analytics' },
      { status: 500 }
    )
  }
}