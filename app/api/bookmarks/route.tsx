// app/api/bookmarks/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all bookmarks for the user with question details
    const { data: bookmarks, error } = await supabase
      .from('user_bookmarks')
      .select(`
        id,
        created_at,
        notes,
        questions (
          id,
          question_text,
          explanation,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          difficulty_level,
          subjects (
            id,
            name
          ),
          topics (
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookmarks:', error)
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
    }

    // Group bookmarks by subject
    const groupedBookmarks = bookmarks?.reduce((acc: any, bookmark: any) => {
      const subject = bookmark.questions?.subjects
      if (subject) {
        if (!acc[subject.id]) {
          acc[subject.id] = {
            subject: subject,
            bookmarks: []
          }
        }
        acc[subject.id].bookmarks.push(bookmark)
      }
      return acc
    }, {}) || {}

    return NextResponse.json({
      allBookmarks: bookmarks,
      bookmarks: Object.values(groupedBookmarks),
      total: bookmarks?.length || 0
    })

  } catch (error) {
    console.error('Error in bookmarks API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questionId, notes } = await request.json()

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Check if bookmark already exists
    const { data: existingBookmark } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .single()

    if (existingBookmark) {
      return NextResponse.json({ error: 'Question already bookmarked' }, { status: 409 })
    }

    // Create new bookmark
    const { data: bookmark, error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: user.id,
        question_id: questionId,
        notes: notes || null
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating bookmark:', error)
      return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Bookmark created successfully',
      bookmarkId: bookmark.id
    }, { status: 201 })

  } catch (error) {
    console.error('Error in bookmark creation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}