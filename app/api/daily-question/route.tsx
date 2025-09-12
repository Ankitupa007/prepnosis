// app/api/daily-question/route.ts
import { createClient } from '@/supabase/server';

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), {
      status: 401,
    });
  }

  const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  const { data: alreadyShown } = await supabase
    .from('user_daily_question')
    .select('question_id, selected_option, is_correct')
    .eq('user_id', user.id)
    .eq('shown_on', today)
    .maybeSingle();

  if (alreadyShown) {
    const { data: question } = await supabase
      .from('clinical_questions')
      .select('*')
      .eq('id', alreadyShown.question_id)
      .single();
    // console.log("Question is alreadyShown")
    return Response.json({
      ...question,
      selected_option: alreadyShown.selected_option,
      is_correct: alreadyShown.is_correct,
    });
  }

  const { data: questions, error } = await supabase.rpc('get_random_unseen_question', {
    p_user_id: user.id,
  });
  console.log(questions)
  const question = Array.isArray(questions) ? questions[0] : questions;

  if (error || !question) {
    return Response.json({ error: 'No unseen questions left' }, { status: 404 });
  }

  const { error: InsertError } = await supabase.from('user_daily_question').insert({
    user_id: user.id,
    question_id: question.id,
    shown_on: today,
  });
  if (InsertError) console.log(InsertError)
  return Response.json(question);
}
