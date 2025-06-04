// app/api/grand-tests/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tests')
    .select(`
      id,
      title,
      description,
      exam_pattern,
      total_questions,
      total_marks,
      duration_minutes,
      negative_marking,
      scheduled_at,
      expires_at,
      created_at
    `)
    .eq('test_type', 'grand_test')
    .eq('is_active', true)
    .order('scheduled_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // console.log('Grand tests data:', data)

  return NextResponse.json(data, { status: 200 })
}
