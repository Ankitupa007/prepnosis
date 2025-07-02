// app/api/questions/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { searchParams } = new URL(request.url)
  const subjectId = searchParams.get('subject_id')
  const topicId = searchParams.get('topic_id')
  const difficulty = searchParams.get('difficulty')
  const examType = searchParams.get('exam_type')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    let query = supabase
      .from('questions')
      .select(`
        id,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        choice_type,
        difficulty_level,
        exam_types,
        explanation,
        subjects!questions_subject_id_fkey (
          id,
          name
        ),
        topics!questions_topic_id_fkey (
          id,
          name
        )
      `)
      .eq('is_active', true)
      .range(offset, offset + limit - 1)

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    if (topicId) {
      query = query.eq('topic_id', topicId)
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty)
    }

    if (examType) {
      query = query.contains('exam_types', [examType])
    }

    const { data: questions, error } = await query

    if (error) throw error

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
      explanation,
      subject_id,
      topic_id,
      difficulty_level,
      exam_types,
      choice_type = 'single'
    } = body

    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation,
        subject_id,
        topic_id,
        difficulty_level,
        exam_types,
        choice_type
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}