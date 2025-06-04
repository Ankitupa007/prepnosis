// app/api/analytics/heatmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeframe = searchParams.get('timeframe') || '30'; // days
    const examPattern = searchParams.get('examPattern') || 'NEET_PG';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeframe));

    // Get user's topic performance data for heatmap
    const { data: topicPerformance, error: performanceError } = await supabase
      .from('user_topic_performance')
      .select(`
        topic_id,
        accuracy_percentage,
        total_questions_attempted,
        strength_level,
        last_updated,
        topics (
          name,
          subject_id,
          subjects (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .gte('last_updated', startDate.toISOString())
      .lte('last_updated', endDate.toISOString());

    if (performanceError) {
      return NextResponse.json(
        { error: 'Failed to fetch topic performance data' },
        { status: 500 }
      );
    }

    // Get recent test attempts to calculate activity intensity
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from('user_test_attempts')
      .select(`
        id,
        started_at,
        is_completed,
        user_answers (
          question_id,
          is_correct,
          questions (
            topic_id,
            topics (
              name,
              subjects (
                name
              )
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())
      .order('started_at', { ascending: false });

    if (attemptsError) {
      return NextResponse.json(
        { error: 'Failed to fetch recent attempts' },
        { status: 500 }
      );
    }

    // Process data for heatmap
    const heatmapData = processHeatmapData(topicPerformance, recentAttempts, timeframe);

    return NextResponse.json({
      success: true,
      data: heatmapData,
      metadata: {
        timeframe: parseInt(timeframe),
        examPattern,
        totalTopics: heatmapData.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Analytics heatmap error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processHeatmapData(topicPerformance: any[], recentAttempts: any[], timeframe: string) {
  const days = parseInt(timeframe);
  const heatmapData: any[] = [];

  // Create a map of topic activity by date
  const topicActivityMap = new Map();

  recentAttempts.forEach(attempt => {
    const date = new Date(attempt.started_at).toDateString();

    attempt.user_answers.forEach((answer: any) => {
      if (answer.questions?.topics) {
        const topicId = answer.questions.topic_id;
        const topicName = answer.questions.topics.name;
        const subjectName = answer.questions.topics.subjects.name;

        const key = `${topicId}-${date}`;

        if (!topicActivityMap.has(key)) {
          topicActivityMap.set(key, {
            topicId,
            topicName,
            subjectName,
            date,
            questionsAttempted: 0,
            correctAnswers: 0,
            activity: 0
          });
        }

        const activity = topicActivityMap.get(key);
        activity.questionsAttempted += 1;
        activity.correctAnswers += answer.is_correct ? 1 : 0;
        activity.activity += 1;
      }
    });
  });

  // Generate heatmap data for each day in the timeframe
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  // Get unique topics from performance data
  const uniqueTopics = new Map();
  topicPerformance.forEach(perf => {
    if (perf.topics) {
      uniqueTopics.set(perf.topic_id, {
        topicId: perf.topic_id,
        topicName: perf.topics.name,
        subjectName: perf.topics.subjects.name,
        overallAccuracy: perf.accuracy_percentage,
        strengthLevel: perf.strength_level,
        totalAttempted: perf.total_questions_attempted
      });
    }
  });

  // Generate calendar grid
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toDateString();
    const dayOfWeek = d.getDay();
    const weekOfYear = getWeekOfYear(d);

    uniqueTopics.forEach((topic, topicId) => {
      const key = `${topicId}-${dateStr}`;
      const activity = topicActivityMap.get(key);

      heatmapData.push({
        date: dateStr,
        day: dayOfWeek,
        week: weekOfYear,
        topicId: topic.topicId,
        topicName: topic.topicName,
        subjectName: topic.subjectName,
        activity: activity?.activity || 0,
        questionsAttempted: activity?.questionsAttempted || 0,
        correctAnswers: activity?.correctAnswers || 0,
        accuracy: activity?.questionsAttempted > 0
          ? Math.round((activity.correctAnswers / activity.questionsAttempted) * 100)
          : null,
        overallAccuracy: topic.overallAccuracy,
        strengthLevel: topic.strengthLevel,
        intensity: calculateIntensity(activity?.activity || 0)
      });
    });
  }

  return heatmapData;
}

function getWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function calculateIntensity(activity: number): 'none' | 'low' | 'medium' | 'high' | 'very-high' {
  if (activity === 0) return 'none';
  if (activity <= 2) return 'low';
  if (activity <= 5) return 'medium';
  if (activity <= 10) return 'high';
  return 'very-high';
}