import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch only question IDs for lightweight response
        const { data: bookmarks, error } = await supabase
            .from('user_bookmarks')
            .select('question_id')
            .eq('user_id', user.id)

        if (error) {
            console.error('Error fetching bookmark IDs:', error)
            return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
        }

        // Return array of question IDs
        const questionIds = bookmarks?.map(b => b.question_id) || []

        return NextResponse.json({
            questionIds,
            total: questionIds.length
        })

    } catch (error) {
        console.error('Error in bookmark IDs API:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
