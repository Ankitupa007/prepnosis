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

    console.log('Received subjects:', subjects)
    console.log('Subjects type:', typeof subjects)
    console.log('Is array:', Array.isArray(subjects))

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

    // More efficient approach: Get questions from each subject separately
    // This ensures better distribution and avoids the 1000 row limit issue
    const allQuestions = []

    if (Array.isArray(subjects) && subjects.length > 0) {
      console.log('Fetching questions from each subject separately...')

      for (const subjectId of subjects) {
        const { data: subjectQuestions, error: subjectError } = await supabase
          .from('questions')
          .select('*')
          .eq('is_active', true)
          .eq('subject_id', subjectId)
          .limit(200) // Higher limit per subject if needed

        if (subjectError) {
          console.error(`Error fetching questions for subject ${subjectId}:, subjectError`)
          continue
        }

        if (subjectQuestions && subjectQuestions.length > 0) {
          allQuestions.push(...subjectQuestions)
          console.log(`✅ Added ${subjectQuestions.length} questions from subject ${subjectId}`)
        } else {
          console.log(`⚠  No questions found for subject ${subjectId}`)
        }
      }
    } else {
      // Fallback to original method for 'all' subjects
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('is_active', true)
        .limit(50000)

      if (questionsError) {
        console.error('Error fetching all questions:', questionsError)
        return NextResponse.json(
          { error: 'Failed to fetch questions' },
          { status: 500 }
        )
      }

      allQuestions.push(...(questions || []))
    }

    const availableQuestions = allQuestions

    console.log('Total available questions:', availableQuestions?.length)

    // Debug: Group questions by subject to see distribution
    if (availableQuestions) {
      const questionsBySubject = availableQuestions.reduce((acc, question) => {
        const subjectId = question.subject_id
        acc[subjectId] = (acc[subjectId] || 0) + 1
        return acc
      }, {})
      console.log('Questions by subject:', questionsBySubject)
    }

    if (!availableQuestions || availableQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for selected subjects' },
        { status: 400 }
      )
    }

    // Ensure balanced selection: guarantee questions from ALL selected subjects
    let selectedQuestions: any[] = []

    if (subjects !== 'all' && Array.isArray(subjects) && subjects.length > 0) {
      // Calculate how many questions to take from each subject
      const questionsPerSubject = Math.floor(numberOfQuestions / subjects.length)
      const remainingQuestions = numberOfQuestions % subjects.length

      console.log(`📊 Distributing ${numberOfQuestions} questions across ${subjects.length} subjects: `)
      console.log(`Base per subject: ${questionsPerSubject}, Extra questions: ${remainingQuestions}`)

      // Group available questions by subject
      const questionsBySubject = availableQuestions.reduce((acc, question) => {
        const subjectId = question.subject_id
        if (!acc[subjectId]) acc[subjectId] = []
        acc[subjectId].push(question)
        return acc
      }, {})

      // Select questions from each subject
      subjects.forEach((subjectId, index) => {
        const subjectQuestions = questionsBySubject[subjectId] || []
        if (subjectQuestions.length === 0) {
          console.log(`⚠  No questions available for subject ${subjectId}`)
          return
        }

        // Shuffle questions for this subject
        const shuffledSubjectQuestions = subjectQuestions.sort(() => Math.random() - 0.5)

        // Determine how many questions to take from this subject
        let questionsToTake = questionsPerSubject
        if (index < remainingQuestions) {
          questionsToTake += 1 // Distribute remaining questions to first few subjects
        }

        // Take the calculated number of questions (or all available if less)
        const selectedFromSubject = shuffledSubjectQuestions.slice(0, Math.min(questionsToTake, subjectQuestions.length))
        selectedQuestions.push(...selectedFromSubject)

        console.log(`✅ Selected ${selectedFromSubject.length} questions from subject ${subjectId}`)
      })

      // If we still need more questions (some subjects had fewer than required),
      // randomly fill from all available questions
      if (selectedQuestions.length < numberOfQuestions) {
        const remaining = numberOfQuestions - selectedQuestions.length
        const usedQuestionIds = new Set(selectedQuestions.map(q => q.id))
        const unusedQuestions = availableQuestions.filter(q => !usedQuestionIds.has(q.id))

        if (unusedQuestions.length > 0) {
          const shuffledUnused = unusedQuestions.sort(() => Math.random() - 0.5)
          const additionalQuestions = shuffledUnused.slice(0, remaining)
          selectedQuestions.push(...additionalQuestions)
          console.log(`📈 Added ${additionalQuestions.length} additional questions to reach target`)
        }
      }

    } else {
      // Original random selection for 'all' subjects
      const shuffledQuestions = availableQuestions.sort(() => Math.random() - 0.5)
      selectedQuestions = shuffledQuestions.slice(0, Math.min(numberOfQuestions, availableQuestions.length))
    }

    // Debug: Show distribution of selected questions
    const selectedBySubject = selectedQuestions.reduce((acc, question) => {
      const subjectId = question.subject_id
      acc[subjectId] = (acc[subjectId] || 0) + 1
      return acc
    }, {})
    console.log('Selected questions by subject:', selectedBySubject)

    // Create test record
    const testData = {
      title: `Custom Test - ${numberOfQuestions} Questions`,
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

    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert([testData])
      .select()
      .single()

    if (testError) {
      console.error('Error creating test:', testError)
      return NextResponse.json(
        { error: 'Failed to create test' },
        { status: 500 }
      )
    }

    // Create test-question mappings
    const testQuestions = selectedQuestions.map((question: Question, index: number) => ({
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
      console.error('Error creating test questions mapping:', mappingError)
      // Clean up the test record if mapping fails
      await supabase.from('tests').delete().eq('id', test.id)
      return NextResponse.json(
        { error: 'Failed to create test questions mapping' },
        { status: 500 }
      )
    }
    // const { data: RPCData, error } = await supabase.rpc('get_random_questions', {
    //   subject_ids: subjects,
    //   question_count: numberOfQuestions,
    // });

    // if (error) {
    //   console.error('Supabase RPC Error:', error);
    //   return NextResponse.json(
    //     { error: 'An error occurred while fetching questions.' },
    //     { status: 500 }
    //   );
    // }

    return NextResponse.json({
      success: true,
      testId: test.id,
      totalQuestions: selectedQuestions.length,
      subjects,
      shareCode: shareCode,
      selectedBySubject, // Include this for debugging
      message: shareCode
        ? 'Custom test created with share code'
        : 'Custom test created successfully'
    })
    // return NextResponse.json(RPCData);

  } catch (error) {
    console.error('Error in create test API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}