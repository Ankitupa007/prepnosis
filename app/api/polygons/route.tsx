// /api/analytics/subject-polygons/route.ts
import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timeframe = searchParams.get('timeframe') || '1'; // days
    const examPattern = searchParams.get('examPattern') || 'INICET';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(timeframe));

    // Get all subjects with their performance data
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, weightage_neet_pg, weightage_inicet')
      .order('name');

    if (subjectsError) {
      return NextResponse.json(
        { error: 'Failed to fetch subjects' },
        { status: 500 }
      );
    }

    // Get user's subject performance
    const { data: subjectPerformance, error: perfError } = await supabase
      .from('user_subject_performance')
      .select('*')
      .eq('user_id', user.id)
      .gte('last_updated', startDate.toISOString());

    if (perfError) {
      return NextResponse.json(
        { error: 'Failed to fetch subject performance' },
        { status: 500 }
      );
    }

    // Get aggregated topic performance for each subject
    const { data: topicPerformance, error: topicError } = await supabase
      .from('user_topic_performance')
      .select(`
        subject_id,
        accuracy_percentage,
        total_questions_attempted,
        strength_level
      `)
      .eq('user_id', user.id)
      .gte('last_updated', startDate.toISOString());

    if (topicError) {
      return NextResponse.json(
        { error: 'Failed to fetch topic performance' },
        { status: 500 }
      );
    }

    // Get test attempt data for additional insights
    const { data: testAttempts, error: testError } = await supabase
      .from('user_test_attempts')
      .select(`
        total_score,
        correct_answers,
        incorrect_answers,
        unanswered,
        started_at,
        user_answers (
          is_correct,
          questions (
            subject_id,
            subjects (name)
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_completed', true)
      .gte('started_at', startDate.toISOString());

    if (testError) {
      return NextResponse.json(
        { error: 'Failed to fetch test attempts' },
        { status: 500 }
      );
    }

    // Process data for polygon generation
    const polygonData = processSubjectPolygons(
      subjects,
      subjectPerformance,
      topicPerformance,
      testAttempts
    );

    return NextResponse.json({
      success: true,
      data: polygonData,
      metadata: {
        timeframe: parseInt(timeframe),
        examPattern,
        totalSubjects: subjects.length,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Subject polygons API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processSubjectPolygons(
  subjects: any[],
  subjectPerformance: any[],
  topicPerformance: any[],
  testAttempts: any[]
) {
  // Create performance maps
  const subjectPerfMap = new Map();
  subjectPerformance.forEach(perf => {
    subjectPerfMap.set(perf.subject_id, perf);
  });

  // Aggregate topic performance by subject
  const topicPerfMap = new Map();
  topicPerformance.forEach(topic => {
    if (!topicPerfMap.has(topic.subject_id)) {
      topicPerfMap.set(topic.subject_id, []);
    }
    topicPerfMap.get(topic.subject_id).push(topic);
  });

  // Aggregate test performance by subject
  const testPerfMap = new Map();
  testAttempts.forEach(attempt => {
    attempt.user_answers?.forEach((answer: any) => {
      if (answer.questions?.subject_id) {
        const subjectId = answer.questions.subject_id;
        if (!testPerfMap.has(subjectId)) {
          testPerfMap.set(subjectId, { correct: 0, total: 0 });
        }
        const subjectTest = testPerfMap.get(subjectId);
        subjectTest.total += 1;
        subjectTest.correct += answer.is_correct ? 1 : 0;
      }
    });
  });

  // Generate polygon data for each subject
  const polygonData = subjects.map(subject => {
    const subjectPerf = subjectPerfMap.get(subject.id);
    const topicPerfs = topicPerfMap.get(subject.id) || [];
    const testPerf = testPerfMap.get(subject.id);
    // Calculate various accuracy metrics
    const overallAccuracy = subjectPerf?.accuracy_percentage || 0;
    const questionsAttempted = subjectPerf?.total_questions_attempted || 0;

    // Topic-based accuracy
    const topicAccuracy: number = topicPerfs.length > 0
      ? topicPerfs.reduce((sum: number, topic: any) => sum + topic.accuracy_percentage, 0) / topicPerfs.length
      : 0;

    // Test-based accuracy
    const testAccuracy = testPerf?.total > 0
      ? (testPerf.correct / testPerf.total) * 100
      : 0;

    // Strength distribution
    const strengthCounts = { weak: 0, beginner: 0, intermediate: 0, strong: 0 };
    topicPerfs.forEach((topic: any) => {
      strengthCounts[topic.strength_level as keyof typeof strengthCounts]++;
    });

    const totalTopics = topicPerfs.length || 1;
    const strengthScore = (
      (strengthCounts.weak * 0.25) +
      (strengthCounts.beginner * 0.5) +
      (strengthCounts.intermediate * 0.75) +
      (strengthCounts.strong * 1)
    ) / totalTopics * 100;

    // Consistency score (based on variance in topic performance)
    const topicAccuracies = topicPerfs.map((t: any) => t.accuracy_percentage);
    const avgTopicAcc = topicAccuracies.reduce((sum: number, acc: any) => sum + acc, 0) / (topicAccuracies.length || 1);
    const variance = topicAccuracies.reduce((sum: number, acc: any) => sum + Math.pow(acc - avgTopicAcc, 2), 0) / (topicAccuracies.length || 1);
    const consistencyScore = Math.max(0, 100 - Math.sqrt(variance));

    // Activity score (based on questions attempted relative to subject weightage)
    const expectedQuestions = (subject.weightage_neet_pg * 100) / 200; // Assume 10 questions per weightage point
    const activityScore = Math.min(100, (questionsAttempted / expectedQuestions) * 100);

    return {
      subject: {
        id: subject.id,
        name: subject.name,
        weightage: subject.weightage_neet_pg || 5
      },
      accuracyMetrics: {
        overall: Math.round(overallAccuracy * 100) / 100,
        topicBased: Math.round(topicAccuracy * 100) / 100,
        testBased: Math.round(testAccuracy * 100) / 100,
        strength: Math.round(strengthScore * 100) / 100,
        consistency: Math.round(consistencyScore * 100) / 100,
        activity: Math.round(activityScore * 100) / 100
      },
      stats: {
        questionsAttempted,
        topicsStudied: topicPerfs.length,
        testQuestions: testPerf?.total || 0,
        strengthDistribution: strengthCounts
      },
      polygon: generatePolygonPoints({
        overall: overallAccuracy,
        topicBased: topicAccuracy,
        testBased: testAccuracy,
        strength: strengthScore,
        consistency: consistencyScore,
        activity: activityScore
      })
    };
  });

  return polygonData;
}

function generatePolygonPoints(metrics: any) {
  const angles = [0, 60, 120, 180, 240, 300]; // 6 points for hexagon
  const center = { x: 100, y: 100 };
  const maxRadius = 80;

  const values = [
    metrics.overall,
    metrics.topicBased,
    metrics.testBased,
    metrics.strength,
    metrics.consistency,
    metrics.activity
  ];

  const points = angles.map((angle, index) => {
    const value = values[index] || 0;
    const radius = (value / 100) * maxRadius;
    const radian = (angle * Math.PI) / 180;

    return {
      x: center.x + radius * Math.cos(radian),
      y: center.y + radius * Math.sin(radian),
      value,
      label: ['Overall', 'Topic-Based', 'Test-Based', 'Strength', 'Consistency', 'Activity'][index]
    };
  });

  return points;
}
