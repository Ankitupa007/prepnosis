// app/api/submit-daily-answer/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const body = await req.json();
  const selected = Number(body.selected_option);

  const { data: record, error } = await supabase
    .from('user_daily_question')
    .select('id, question_id, selected_option, is_correct')
    .eq('user_id', user.id)
    .eq('shown_on', today)
    .maybeSingle();

  if (!record || record.selected_option !== null) {
    return new Response(JSON.stringify({ error: 'Already submitted or no question today' }), {
      status: 400,
    });
  }

  const { data: question } = await supabase
    .from('clinical_questions')
    .select('correct_option')
    .eq('id', record.question_id)
    .single();

  if (!question) {
    return new Response(JSON.stringify({ error: 'Question not found' }), { status: 404 });
  }

  const isCorrect = question.correct_option === selected;

  await supabase
    .from('user_daily_question')
    .update({
      selected_option: selected,
      is_correct: isCorrect,
    })
    .eq('id', record.id);

  return Response.json({ is_correct: isCorrect });
}
