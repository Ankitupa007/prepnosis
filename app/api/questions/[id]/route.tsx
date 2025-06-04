// app/api/questions/[id]/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { use } from 'react'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {

  const supabase = await createClient()
  const { id } = use(params)

  try {
    const { data: question, error } = await supabase
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
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) throw error

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error fetching question:', error)
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = use(params)
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
      choice_type
    } = body

    const { data: question, error } = await supabase
      .from('questions')
      .update({
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
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ question })
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = use(params)
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('questions')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Question deleted successfully' })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    )
  }
}