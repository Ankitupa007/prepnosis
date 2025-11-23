// app/api/tests/create/route.ts (Fixed Version)
import { NextRequest, NextResponse } from 'next/server'
import { Question } from '@/lib/types/test'
import { createClient } from '@/supabase/server'

function generateShareCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const { numberOfQuestions, testMode, subjects, createdBy, enableSharing, shareExpiration } = await request.json()

    // Validate input
    if (!numberOfQuestions || !testMode || !subjects || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user || user.id !== createdBy) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let shareCode = generateShareCode()
    let targetSubjects: string[] = []

    // 1. Determine target subjects
    if (subjects === 'all') {
      const { data: allSubjects, error: subjectsError } = await supabase
        .from('subjects')
        .select('id')

      if (subjectsError) throw subjectsError
      targetSubjects = allSubjects.map(s => s.id)
    } else if (Array.isArray(subjects)) {
      targetSubjects = subjects
    } else {
      return NextResponse.json({ error: 'Invalid subjects format' }, { status: 400 })
    }

    if (targetSubjects.length === 0) {
      return NextResponse.json({ error: 'No subjects selected' }, { status: 400 })
    }

    // 2. Calculate distribution
    const subjectIds: string[] = []
    const counts: number[] = []

    const baseCount = Math.floor(numberOfQuestions / targetSubjects.length)
    let remainder = numberOfQuestions % targetSubjects.length

    // Shuffle subjects to randomize who gets the extra questions
    const shuffledSubjects = [...targetSubjects].sort(() => Math.random() - 0.5)

    shuffledSubjects.forEach((subjectId) => {
      let count = baseCount
      if (remainder > 0) {
        count++
        remainder--
      }
      if (count > 0) {
        subjectIds.push(subjectId)
        counts.push(count)
      }
    })

    // 3. Call RPC to get random questions
    // Note: We cast to any because the RPC is not yet in the generated types
    const { data: selectedQuestions, error: rpcError } = await supabase
      .rpc('get_random_questions_v2', {
        p_subject_ids: subjectIds,
        p_counts: counts
      })

    if (rpcError) {
      console.error('RPC Error:', rpcError)
      throw rpcError
    }

    if (!selectedQuestions || selectedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for the selected criteria' },
        { status: 400 }
      )
    }

    // 4. Create Test Record
    const testData = {
      title: `Custom Test - ${selectedQuestions.length} Questions`,
      description: `Custom practice test with ${selectedQuestions.length} questions in ${testMode} mode`,
      test_type: 'custom',
      test_mode: testMode,
      exam_pattern: 'NEET_PG',
      total_questions: selectedQuestions.length,
      total_marks: selectedQuestions.length * 4,
      duration_minutes: 0,
      negative_marking: 0,
      is_active: true,
      created_by: createdBy,
      share_code: shareCode,
      is_shareable: enableSharing
    }

    console.log('Creating test with data:', JSON.stringify(testData, null, 2))

    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert([testData])
      .select()
      .single()

    if (testError) {
      console.error('Error inserting test record:', testError)
      throw testError
    }

    // 5. Create Test-Question Mappings
    const testQuestions = (selectedQuestions as Question[]).map((question, index) => ({
      test_id: test.id,
      question_id: question.id,
      section_number: 1,
      question_order: index + 1,
      marks: 4
    }))

    const { error: mappingError } = await supabase
      .from('test_questions')
      .insert(testQuestions)

    if (mappingError) {
      console.error('Error inserting test questions:', mappingError)
      // Cleanup
      await supabase.from('tests').delete().eq('id', test.id)
      throw mappingError
    }

    return NextResponse.json({
      success: true,
      testId: test.id,
      totalQuestions: selectedQuestions.length,
      shareCode: shareCode,
      message: shareCode
        ? 'Custom test created with share code'
        : 'Custom test created successfully'
    })

  } catch (error) {
    console.error('Error in create test API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}