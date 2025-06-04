// app/api/webhooks/cron/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or your cron service
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const task = searchParams.get('task');

    switch (task) {
      case 'cleanup-expired-tests':
        await cleanupExpiredTests(supabase);
        break;
      case 'update-rankings':
        await updateTestRankings(supabase);
        break;
      case 'generate-daily-grand-test':
        await generateDailyGrandTest(supabase);
        break;
      case 'update-performance-analytics':
        await updatePerformanceAnalytics(supabase);
        break;
      case 'send-reminder-notifications':
        await sendReminderNotifications(supabase);
        break;
      default:
        return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
    }

    return NextResponse.json({ success: true, task });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

async function cleanupExpiredTests(supabase: any) {
  console.log('Starting cleanup of expired tests...');

  const now = new Date().toISOString();

  // Mark expired tests as inactive
  const { data: expiredTests, error: updateError } = await supabase
    .from('tests')
    .update({ is_active: false })
    .lt('expires_at', now)
    .eq('is_active', true)
    .select('id, title');

  if (updateError) {
    throw new Error(`Failed to cleanup expired tests: ${updateError.message}`);
  }

  console.log(`Cleaned up ${expiredTests?.length || 0} expired tests`);
}

async function updateTestRankings(supabase: any) {
  console.log('Starting test rankings update...');

  // Get all completed grand tests from the last 24 hours
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: recentTests, error: testsError } = await supabase
    .from('tests')
    .select('id')
    .eq('test_type', 'grand_test')
    .gte('created_at', yesterday.toISOString());

  if (testsError) {
    throw new Error(`Failed to fetch recent tests: ${testsError.message}`);
  }

  for (const test of recentTests || []) {
    await calculateRankingsForTest(supabase, test.id);
  }

  console.log(`Updated rankings for ${recentTests?.length || 0} tests`);
}

async function calculateRankingsForTest(supabase: any, testId: string) {
  // Get all completed attempts for this test
  const { data: attempts, error: attemptsError } = await supabase
    .from('user_test_attempts')
    .select(`
      id,
      user_id,
      total_score,
      time_taken_minutes,
      user_profiles (
        full_name
      )
    `)
    .eq('test_id', testId)
    .eq('is_completed', true)
    .order('total_score', { ascending: false })
    .order('time_taken_minutes', { ascending: true });

  if (attemptsError) {
    throw new Error(`Failed to fetch attempts: ${attemptsError.message}`);
  }

  if (!attempts || attempts.length === 0) return;

  // Calculate rankings and percentiles
  const totalAttempts = attempts.length;
  interface Attempt {
    id: string;
    user_id: string;
    total_score: number;
    time_taken_minutes: number;
    user_profiles: {
      full_name: string;
    };
  }

  interface RankingData {
    test_id: string;
    user_id: string;
    attempt_id: string;
    rank: number;
    score: number;
    percentile: number;
  }

  const rankingsData: RankingData[] = (attempts as Attempt[]).map((attempt, index) => {
    const rank = index + 1;
    const percentile = ((totalAttempts - rank) / totalAttempts) * 100;

    return {
      test_id: testId,
      user_id: attempt.user_id,
      attempt_id: attempt.id,
      rank,
      score: attempt.total_score,
      percentile: Math.round(percentile * 100) / 100
    };
  });

  // Insert or update rankings
  const { error: rankingsError } = await supabase
    .from('test_rankings')
    .upsert(rankingsData, {
      onConflict: 'test_id,user_id'
    });

  if (rankingsError) {
    throw new Error(`Failed to update rankings: ${rankingsError.message}`);
  }
}

async function generateDailyGrandTest(supabase: any) {
  console.log('Generating daily grand test...');

  const today = new Date();
  const testDate = new Date(today);
  testDate.setHours(6, 0, 0, 0); // 9 AM start time

  // Check if today's grand test already exists
  const { data: existingTest } = await supabase
    .from('tests')
    .select('id')
    .eq('test_type', 'grand_test')
    .gte('scheduled_at', testDate.toISOString())
    .lt('scheduled_at', new Date(testDate.getTime() + 24 * 60 * 60 * 1000).toISOString())
    .single();

  if (existingTest) {
    console.log('Daily grand test already exists for today');
    return;
  }

  // Get random questions for the grand test
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('id, subject_id, difficulty_level')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(200);

  if (questionsError || !questions || questions.length < 200) {
    throw new Error('Not enough questions available for daily grand test');
  }

  // Distribute questions by difficulty and subjects
  const selectedQuestions = selectQuestionsForGrandTest(questions);

  // Create the test
  const testData = {
    title: `Daily Grand Test - ${today.toDateString()}`,
    description: 'Daily practice test covering all subjects',
    test_type: 'grand_test',
    test_mode: 'exam',
    exam_pattern: 'NEET_PG',
    total_questions: 200,
    total_marks: 800,
    duration_minutes: 210, // 3.5 hours
    negative_marking: 1.00,
    scheduled_at: testDate.toISOString(),
    expires_at: new Date(testDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    is_active: true
  };

  const { data: newTest, error: testError } = await supabase
    .from('tests')
    .insert(testData)
    .select('id')
    .single();

  if (testError) {
    throw new Error(`Failed to create daily grand test: ${testError.message}`);
  }

  // Add questions to the test
  const testQuestions = selectedQuestions.map((questionId, index) => ({
    test_id: newTest.id,
    question_id: questionId,
    question_order: index + 1,
    marks: 4,
    section_number: Math.floor(index / 50) + 1 // 4 sections of 50 questions each
  }));

  const { error: questionsInsertError } = await supabase
    .from('test_questions')
    .insert(testQuestions);

  if (questionsInsertError) {
    throw new Error(`Failed to add questions to test: ${questionsInsertError.message}`);
  }

  console.log(`Created daily grand test with ID: ${newTest.id}`);
}

function selectQuestionsForGrandTest(allQuestions: any[]): string[] {
  const selectedQuestions: string[] = [];
  const questionsByDifficulty = {
    easy: allQuestions.filter(q => q.difficulty_level === 'easy'),
    medium: allQuestions.filter(q => q.difficulty_level === 'medium'),
    hard: allQuestions.filter(q => q.difficulty_level === 'hard')
  };

  // Select questions with desired distribution
  // 30% easy, 50% medium, 20% hard
  const easyCount = Math.floor(200 * 0.3);
  const mediumCount = Math.floor(200 * 0.5);
  const hardCount = 200 - easyCount - mediumCount;

  // Randomly select questions from each difficulty level
  selectedQuestions.push(...getRandomQuestions(questionsByDifficulty.easy, easyCount));
  selectedQuestions.push(...getRandomQuestions(questionsByDifficulty.medium, mediumCount));
  selectedQuestions.push(...getRandomQuestions(questionsByDifficulty.hard, hardCount));

  return selectedQuestions;
}

function getRandomQuestions(questions: any[], count: number): string[] {
  const shuffled = questions.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length)).map(q => q.id);
}

async function updatePerformanceAnalytics(supabase: any) {
  console.log('Updating performance analytics...');

  // This would typically recalculate aggregated analytics
  // For now, we'll just update the last_updated timestamps
  const { error } = await supabase
    .from('user_subject_performance')
    .update({ last_updated: new Date().toISOString() })
    .lt('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    throw new Error(`Failed to update performance analytics: ${error.message}`);
  }

  console.log('Performance analytics updated');
}

async function sendReminderNotifications(supabase: any) {
  console.log('Sending reminder notifications...');

  // Get users who haven't attempted any test in the last 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const { data: inactiveUsers, error } = await supabase
    .from('user_profiles')
    .select(`
      id,
      email,
      full_name
    `)
    .not('id', 'in', `(
      SELECT DISTINCT user_id
      FROM user_test_attempts
      WHERE started_at >= '${threeDaysAgo.toISOString()}'
    )`);

  if (error) {
    throw new Error(`Failed to fetch inactive users: ${error.message}`);
  }

  // Here you would integrate with your notification service
  // For now, we'll just log the count
  console.log(`Found ${inactiveUsers?.length || 0} inactive users for reminders`);

  // TODO: Implement actual notification sending
  // This could integrate with email services, push notifications, etc.
}