// app/api/tests/grand-tests/rankings/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const testId = searchParams.get('test_id')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      )
    }

    // Get test details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('id, title, test_type, total_questions, total_marks')
      .eq('id', testId)
      .eq('test_type', 'grand_test')
      .single()

    if (testError) throw testError

    if (!test) {
      return NextResponse.json(
        { error: 'Grand test not found' },
        { status: 404 }
      )
    }

    // Get rankings with user details
    const { data: rankings, error: rankingsError } = await supabase
      .from('test_rankings')
      .select(`
        rank,
        score,
        percentile,
        created_at,
        user_profiles!test_rankings_user_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        user_test_attempts!test_rankings_attempt_id_fkey (
          time_taken_minutes,
          correct_answers,
          incorrect_answers,
          unanswered
        )
      `)
      .eq('test_id', testId)
      .order('rank')
      .range(offset, offset + limit - 1)

    if (rankingsError) throw rankingsError

    // Get current user's ranking
    const { data: userRanking, error: userRankingError } = await supabase
      .from('test_rankings')
      .select(`
        rank,
        score,
        percentile,
        user_test_attempts!test_rankings_attempt_id_fkey (
          time_taken_minutes,
          correct_answers,
          incorrect_answers,
          unanswered
        )
      `)
      .eq('test_id', testId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (userRankingError) throw userRankingError

    // Get total participants count
    const { count: totalParticipants, error: countError } = await supabase
      .from('test_rankings')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId)

    if (countError) throw countError

    // Calculate statistics
    const { data: stats, error: statsError } = await supabase
      .from('user_grand_test_attempts')
      .select('total_score, time_taken_minutes')
      .eq('test_id', testId)
      .eq('is_completed', true)

    if (statsError) throw statsError

    let testStats = null
    if (stats && stats.length > 0) {
      const scores = stats.map(s => s.total_score).sort((a, b) => b - a)
      const times = stats.map(s => s.time_taken_minutes).sort((a, b) => a - b)

      testStats = {
        total_participants: stats.length,
        highest_score: scores[0],
        lowest_score: scores[scores.length - 1],
        average_score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        median_score: scores[Math.floor(scores.length / 2)],
        average_time: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        median_time: times[Math.floor(times.length / 2)]
      }
    }

    return NextResponse.json({
      test: {
        id: test.id,
        title: test.title,
        total_questions: test.total_questions,
        total_marks: test.total_marks
      },
      rankings: rankings?.map(ranking => ({
        rank: ranking.rank,
        score: ranking.score,
        percentile: ranking.percentile,
        user: {
          id: ranking.user_profiles?.[0]?.id,
          name: ranking.user_profiles?.[0]?.full_name || 'Anonymous',
          avatar: ranking.user_profiles?.[0]?.avatar_url
        },
        performance: {
          time_taken: ranking.user_test_attempts?.[0]?.time_taken_minutes,
          correct: ranking.user_test_attempts?.[0]?.correct_answers,
          incorrect: ranking.user_test_attempts?.[0]?.incorrect_answers,
          unanswered: ranking.user_test_attempts?.[0]?.unanswered,
          accuracy: Math.round(((ranking.user_test_attempts?.[0]?.correct_answers || 0) / test.total_questions) * 100)
        }
      })) || [],
      user_ranking: userRanking ? {
        rank: userRanking.rank,
        score: userRanking.score,
        percentile: userRanking.percentile,
        performance: {
          time_taken: userRanking.user_test_attempts?.[0]?.time_taken_minutes,
          correct: userRanking.user_test_attempts?.[0]?.correct_answers,
          incorrect: userRanking.user_test_attempts?.[0]?.incorrect_answers,
          unanswered: userRanking.user_test_attempts?.[0]?.unanswered,
          accuracy: Math.round(((userRanking.user_test_attempts?.[0]?.correct_answers || 0) / test.total_questions) * 100)
        }
      } : null,
      statistics: testStats,
      pagination: {
        total: totalParticipants || 0,
        limit,
        offset,
        has_more: (totalParticipants || 0) > offset + limit
      }
    })
  } catch (error) {
    console.error('Error fetching rankings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rankings' },
      { status: 500 }
    )
  }
}