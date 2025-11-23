// app/api/bookmarks/[questionId]/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId: questionId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!questionId) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 })
    }

    // Delete the bookmark
    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', user.id)
      .eq('question_id', questionId)

    if (error) {
      console.error('Error deleting bookmark:', error)
      return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Bookmark deleted successfully' })

  } catch (error) {
    console.error('Error in bookmark deletion:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId: questionId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if question is bookmarked
    const { data: bookmark, error } = await supabase
      .from('user_bookmarks')
      .select('id, notes')
      .eq('user_id', user.id)
      .eq('question_id', questionId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking bookmark:', error)
      return NextResponse.json({ error: 'Failed to check bookmark' }, { status: 500 })
    }

    return NextResponse.json({
      isBookmarked: !!bookmark,
      notes: bookmark?.notes || null
    })

  } catch (error) {
    console.error('Error checking bookmark:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}