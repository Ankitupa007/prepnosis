// scripts/seed-prebuilt-grand-tests.toISOString
import { createClient } from '@/supabase/server'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

interface GrandTestQuestion {
  q_no: string
  question: string
  options: {
    A: string
    B: string
    C: string
    D: string
  }
  correct_answer: 'A' | 'B' | 'C' | 'D'
  explanation: string
  images: string[]
}

interface PrebuiltGrandTest {
  title: string
  exam_pattern: 'NEET_PG' | 'INICET'
  questions: GrandTestQuestion[]
  scheduled_date?: string
}


async function seedPrebuiltGrandTests() {
  try {
    console.log('Starting to seed prebuilt grand tests...')

    // Read all JSON files from grand-tests directory
    const grandTestsDir = join(process.cwd(), 'data', 'grand-tests')
    const files = readdirSync(grandTestsDir).filter(file => file.endsWith('.json'))

    console.log(`Found ${files.length} grand test files`)

    for (const file of files) {
      console.log(`Processing ${file}...`)

      const filePath = join(grandTestsDir, file)
      const fileContent = readFileSync(filePath, 'utf-8')
      const questions: GrandTestQuestion[] = JSON.parse(fileContent)

      if (!questions || questions.length === 0) {
        console.log(`Skipping ${file} - no questions found`)
        continue
      }

      // Extract metadata from filename or set defaults
      const testTitle = extractTestTitle(file)
      const examPattern = extractExamPattern(file) // 'NEET_PG' or 'INICET'
      const scheduledDate = extractScheduledDate(file) // Optional

      await createPrebuiltGrandTest({
        title: testTitle,
        exam_pattern: examPattern,
        questions,
        scheduled_date: scheduledDate
      })

      console.log(`✅ Successfully created: ${testTitle}`)
    }

    console.log('🎉 All prebuilt grand tests seeded successfully!')

  } catch (error) {
    console.error('❌ Error seeding prebuilt grand tests:', error)
    process.exit(1)
  }
}

async function createPrebuiltGrandTest(testData: PrebuiltGrandTest) {
  const supabase = await createClient()
  const { title, exam_pattern, questions, scheduled_date } = testData

  // Calculate test parameters
  const totalQuestions = questions.length
  const markingPerQuestion = exam_pattern === 'NEET_PG' ? 4 : 1
  const totalMarks = totalQuestions * markingPerQuestion
  const negativeMarking = exam_pattern === 'NEET_PG' ? 1 : 0.33
  const durationMinutes = 180 // 3 hours standard

  // 1. Create the test
  const { data: test, error: testError } = await supabase
    .from('tests')
    .insert({
      title,
      description: `Prebuilt ${exam_pattern} Grand Test with comprehensive question coverage`,
      test_type: 'grand_test',
      test_mode: 'exam',
      exam_pattern,
      total_questions: totalQuestions,
      total_marks: totalMarks,
      duration_minutes: durationMinutes,
      negative_marking: negativeMarking,
      scheduled_at: scheduled_date || null,
      expires_at: scheduled_date ?
        new Date(new Date(scheduled_date).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : // Expires 7 days after scheduled date
        null,
      is_active: true,
      created_by: null, // System-created, no specific user
      // Add metadata to identify as prebuilt
      sections: {
        is_prebuilt: true,
        source_file: testData.title,
        created_date: new Date().toISOString()
      }
    })
    .select()
    .single()

  if (testError) throw testError

  // 2. Process and insert questions
  const questionsToInsert = []
  const testQuestionsToInsert = []

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]

    // Convert correct_answer letter to number (A=1, B=2, C=3, D=4)
    const correctOptionMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 }
    const correctOption = correctOptionMap[q.correct_answer]

    // Determine subject_id and topic_id (you might need to enhance this logic)
    const { subject_id, topic_id } = await inferSubjectAndTopic(q.question, q.explanation)

    // Create question object
    const questionData = {
      question_text: q.question,
      option_a: q.options.A,
      option_b: q.options.B,
      option_c: q.options.C,
      option_d: q.options.D,
      correct_option: correctOption,
      explanation: q.explanation,
      choice_type: 'single', // Assuming single choice
      difficulty_level: 'medium', // Default, you can enhance this
      exam_types: [exam_pattern],
      subject_id,
      topic_id,
      is_active: true,
      // Store images in a custom field or handle separately
      // images: q.images // You might need to add this field to your schema
    }

    questionsToInsert.push(questionData)
  }

  // Insert questions in batches
  const batchSize = 100
  const insertedQuestions = []

  for (let i = 0; i < questionsToInsert.length; i += batchSize) {
    const batch = questionsToInsert.slice(i, i + batchSize)
    const { data: batchResult, error: batchError } = await supabase
      .from('questions')
      .insert(batch)
      .select('id')

    if (batchError) throw batchError
    insertedQuestions.push(...batchResult)
  }

  // 3. Create test_questions relationships
  for (let i = 0; i < insertedQuestions.length; i++) {
    testQuestionsToInsert.push({
      test_id: test.id,
      question_id: insertedQuestions[i].id,
      question_order: i + 1,
      marks: markingPerQuestion,
      section_number: 1
    })
  }

  // Insert test questions
  const { error: testQuestionsError } = await supabase
    .from('test_questions')
    .insert(testQuestionsToInsert)

  if (testQuestionsError) throw testQuestionsError

  return test
}

// Helper functions
function extractTestTitle(filename: string): string {
  // Extract meaningful title from filename
  // Example: "neet_pg_gt_2024_01.json" → "NEET PG Grand Test - January 2024"
  const baseName = filename.replace('.json', '')
  const parts = baseName.split('_')

  // Customize based on your filename convention
  if (parts.includes('neet') && parts.includes('pg')) {
    return `NEET PG Grand Test - ${extractDateFromFilename(filename)}`
  } else if (parts.includes('inicet')) {
    return `INICET Grand Test - ${extractDateFromFilename(filename)}`
  }

  return `Grand Test - ${baseName}`
}

function extractExamPattern(filename: string): 'NEET_PG' | 'INICET' {
  const lower = filename.toLowerCase()
  if (lower.includes('inicet')) return 'INICET'
  return 'NEET_PG' // Default
}

function extractScheduledDate(filename: string): string | undefined {
  // Extract date from filename if present
  // Example: "gt_2024_03_15.json" → "2024-03-15"
  const dateMatch = filename.match(/(\d{4})[_-](\d{1,2})[_-](\d{1,2})/)
  if (dateMatch) {
    const [, year, month, day] = dateMatch
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  return undefined
}

function extractDateFromFilename(filename: string): string {
  const scheduled = extractScheduledDate(filename)
  if (scheduled) {
    return new Date(scheduled).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

async function inferSubjectAndTopic(question: string, explanation: string): Promise<{
  subject_id: string | null
  topic_id: string | null
}> {
  // Basic keyword matching to infer subject
  // You can enhance this with more sophisticated logic or AI
  const supabase = await createClient()
  const text = (question + ' ' + explanation).toLowerCase()

  const subjectKeywords = {
    'anat': ['anatomy', 'anatomical', 'muscle', 'bone', 'nerve', 'artery', 'vein'],
    'physio': ['physiology', 'physiological', 'function', 'mechanism', 'homeostasis'],
    'biochem': ['biochemistry', 'enzyme', 'metabolism', 'protein', 'carbohydrate'],
    'patho': ['pathology', 'pathological', 'disease', 'tumor', 'cancer', 'inflammation'],
    'pharma': ['pharmacology', 'drug', 'medication', 'therapeutic', 'dosage'],
    'micro': ['microbiology', 'bacteria', 'virus', 'infection', 'antibiotic'],
    'medicine': ['medicine', 'internal medicine', 'hypertension', 'diabetes', 'cardiology'],
    'surgery': ['surgery', 'surgical', 'operation', 'trauma', 'fracture'],
    'obgy': ['obstetrics', 'gynecology', 'pregnancy', 'delivery', 'menstrual'],
    'peds': ['pediatrics', 'children', 'infant', 'neonatal', 'vaccination']
  }

  let detectedSubject = null
  let maxMatches = 0

  for (const [subject, keywords] of Object.entries(subjectKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length
    if (matches > maxMatches) {
      maxMatches = matches
      detectedSubject = subject
    }
  }

  if (detectedSubject) {
    // Get subject ID from database
    const { data: subject } = await supabase
      .from('subjects')
      .select('id')
      .eq('slug', detectedSubject)
      .single()

    return {
      subject_id: subject?.id || null,
      topic_id: null // Could be enhanced to detect topics too
    }
  }

  return { subject_id: null, topic_id: null }
}

// Run the seeder
if (require.main === module) {
  seedPrebuiltGrandTests()
}

export { seedPrebuiltGrandTests }