// app/api/grand-tests/generate/route.ts
import { createClient } from '@/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  try {
    const body = await request.json()
    const {
      exam_pattern = 'NEET_PG',
      scheduled_date,
      duration_minutes = 180
    } = body

    // Define question distribution based on exam pattern
    const questionDistribution = {
      NEET_PG: {
        total: 200,
        subjects: {
          'anat': 17,
          'physio': 17,
          'biochem': 16,
          'patho': 25,
          'pharma': 20,
          'micro': 20,
          'fmt': 10,
          'psm': 25,
          'medicine': 25,
          'psychiatry': 10,
          'derma': 10,
          'surgery': 25,
          'radio': 5,
          'anaesthesia': 5,
          'ortho': 10,
          'obgy': 30,
          'peds': 10,
          'ent': 10,
          'ophtha': 10,
        }
      },
      INICET: {
        total: 200,
        subjects: {
          'anat': 11,
          'physio': 10,
          'biochem': 10,
          'patho': 16,
          'pharma': 15,
          'micro': 14,
          'fmt': 6,
          'psm': 14,
          'medicine': 22,
          'psychiatry': 4,
          'derma': 5,
          'surgery': 17,
          'radio': 8,
          'anaesthesia': 5,
          'ortho': 6,
          'obgy': 16,
          'peds': 10,
          'ent': 5,
          'ophtha': 6,
        }
      }
    }

    const pattern = questionDistribution[exam_pattern as keyof typeof questionDistribution]
    if (!pattern) {
      return NextResponse.json(
        { error: 'Invalid exam pattern' },
        { status: 400 }
      )
    }

    // Get subjects with their IDs
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('id, name, slug')

    if (subjectsError) throw subjectsError

    const subjectMap = subjects?.reduce((acc, subject) => {
      acc[subject.slug] = subject.id
      return acc
    }, {} as Record<string, string>) || {}

    // Generate test title with date
    const testDate = scheduled_date ? new Date(scheduled_date) : new Date()
    const testTitle = `${exam_pattern} Grand Test - ${testDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`

    const markingForEachQuestion = exam_pattern === 'NEET_PG' ? 4 : 1
    const negetiveMarking = exam_pattern === 'NEET_PG' ? 1 : 0.33

    // Prepare arrays for RPC
    const subjectIds: string[] = []
    const counts: number[] = []

    for (const [subjectKey, questionCount] of Object.entries(pattern.subjects)) {
      const subjectId = subjectMap[subjectKey]
      if (subjectId) {
        subjectIds.push(subjectId)
        counts.push(questionCount as number)
      } else {
        console.warn(`Subject not found: ${subjectKey}`)
      }
    }

    // Call RPC to get random questions
    const { data: selectedQuestions, error: rpcError } = await supabase
      .rpc('get_random_questions_v2', {
        p_subject_ids: subjectIds,
        p_counts: counts,
        p_exam_type: exam_pattern
      })

    if (rpcError) throw rpcError

    if (!selectedQuestions || selectedQuestions.length === 0) {
      return NextResponse.json(
        { error: 'No questions available for the selected exam pattern' },
        { status: 400 }
      )
    }

    // Create the grand test
    const { data: test, error: testError } = await supabase
      .from('grand_tests')
      .insert({
        title: testTitle,
        description: `Comprehensive ${exam_pattern} examination following the standard pattern`,
        test_type: 'grand_test',
        test_mode: 'exam',
        exam_pattern,
        total_questions: selectedQuestions.length, // Use actual count
        total_marks: selectedQuestions.length * markingForEachQuestion,
        duration_minutes,
        negative_marking: negetiveMarking,
        scheduled_at: scheduled_date,
        expires_at: scheduled_date ?
          new Date(new Date(scheduled_date).getTime() + 24 * 60 * 60 * 1000).toISOString() :
          null,
        sections: [1, 2, 3, 4, 5] // Default sections
      })
      .select()
      .single()

    if (testError) throw testError

    // Prepare grand test questions (Copying data)
    const allTestQuestions = (selectedQuestions as any[]).map((question, index) => ({
      test_id: test.id,
      question_text: question.question_text,
      explanation: question.explanation,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option,
      choice_type: question.choice_type,
      subject_id: question.subject_id,
      topic_id: question.topic_id,
      difficulty_level: question.difficulty_level,
      exam_types: question.exam_types,
      is_active: true,
      question_order: index + 1,
      section_number: 1, // Logic to distribute across sections can be added here if needed
      marks: markingForEachQuestion,
      images: [] // Default empty images as questions table might not have it or it's not in the type
    }))

    // Insert all test questions into grand_tests_questions
    const { error: testQuestionsError } = await supabase
      .from('grand_tests_questions')
      .insert(allTestQuestions)

    if (testQuestionsError) {
      // Delete the test if question insertion fails
      await supabase.from('grand_tests').delete().eq('id', test.id)
      throw testQuestionsError
    }

    return NextResponse.json({
      test: test,
      question_distribution: Object.entries(pattern.subjects).reduce((acc, [subject, count]) => {
        acc[subject] = {
          expected: count,
          actual: 'Distributed via RPC'
        }
        return acc
      }, {} as Record<string, any>)
    })
  } catch (error) {
    console.error('Error generating grand test:', error)
    return NextResponse.json(
      { error: 'Failed to generate grand test' },
      { status: 500 }
    )
  }
}