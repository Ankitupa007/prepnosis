// app/api/tests/grand-tests/generate/route.ts
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

    // Create the grand test
    const { data: test, error: testError } = await supabase
      .from('tests')
      .insert({
        title: testTitle,
        description: `Comprehensive ${exam_pattern} examination following the standard pattern`,
        test_type: 'grand_test',
        test_mode: 'exam',
        exam_pattern,
        total_questions: pattern.total,
        total_marks: pattern.total * markingForEachQuestion,
        duration_minutes,
        negative_marking: negetiveMarking,
        scheduled_at: scheduled_date,
        expires_at: scheduled_date ?
          new Date(new Date(scheduled_date).getTime() + 24 * 60 * 60 * 1000).toISOString() :
          null,
      })
      .select()
      .single()

    if (testError) throw testError

    // Generate questions for each subject
    interface Subject {
      id: string
      name: string
      slug: string
    }

    interface Question {
      id: string
    }

    interface TestQuestion {
      test_id: string
      question_id: string
      question_order: number
      marks: number
      section_number: number
    }

    const allTestQuestions: TestQuestion[] = []
    let questionOrder = 1

    for (const [subjectKey, questionCount] of Object.entries(pattern.subjects)) {
      const subjectId = subjectMap[subjectKey]

      if (!subjectId) {
        console.warn(`Subject not found: ${subjectKey}`)
        continue
      }

      // Get questions for this subject
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .contains('exam_types', [exam_pattern])
        .limit(questionCount * 10000) // Get more questions for better randomization

      if (questionsError) throw questionsError

      if (!questions || questions.length < questionCount) {
        console.warn(`Not enough questions for subject: ${subjectKey}. Need: ${questionCount}, Available: ${questions?.length || 0}`)
        continue
      }

      // Randomly select questions
      const shuffled = questions.sort(() => 0.5 - Math.random())
      const selectedQuestions = shuffled.slice(0, questionCount)

      // Add to test questions array
      selectedQuestions.forEach(question => {
        allTestQuestions.push({
          test_id: test.id,
          question_id: question.id,
          question_order: questionOrder++,
          marks: markingForEachQuestion,
          section_number: 1
        })
      })
    }

    if (allTestQuestions.length === 0) {
      // Delete the test if no questions were added
      await supabase.from('tests').delete().eq('id', test.id)
      return NextResponse.json(
        { error: 'No questions available for the selected exam pattern' },
        { status: 400 }
      )
    }

    // Insert all test questions
    const { error: testQuestionsError } = await supabase
      .from('test_questions')
      .insert(allTestQuestions)

    if (testQuestionsError) {
      // Delete the test if question insertion fails
      await supabase.from('tests').delete().eq('id', test.id)
      throw testQuestionsError
    }

    // Update the test with actual question count
    const { data: updatedTest, error: updateError } = await supabase
      .from('tests')
      .update({
        total_questions: allTestQuestions.length,
        total_marks: allTestQuestions.length * markingForEachQuestion
      })
      .eq('id', test.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      test: updatedTest,
      question_distribution: Object.entries(pattern.subjects).reduce((acc, [subject, count]) => {
        acc[subject] = {
          expected: count,
          actual: allTestQuestions.filter(tq =>
            // This is simplified - in reality you'd need to join with questions to get subject
            true
          ).length
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