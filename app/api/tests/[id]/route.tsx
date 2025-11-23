import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Question } from '@/lib/types/test';

export const dynamic = 'force-dynamic';

interface Test {
    id: string;
    title: string;
    description: string;
    test_type: string;
    test_mode: 'regular' | 'exam';
    exam_pattern: string;
    total_questions: number;
    total_marks: number;
    duration_minutes: number;
    negative_marking: number;
    sections: string | null;
    scheduled_at: string | null;
    expires_at: string | null;
    created_at: string;
    created_by: string;
    share_code: string | null;
}

interface TestQuestion {
    id: string;
    question_id: string;
    question_order: number;
    marks: number;
    section_number: number;
    questions: (Question & {
        choice_type: 'single' | 'multiple';
        subjects?: { id: string; name: string };
        topics?: { id: string; name: string };
    }) | null;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get test details with a timeout to prevent hanging
        const { data: test, error: testError } = await Promise.race([
            supabase
                .from('tests')
                .select(`
          id,
          title,
          description,
          test_type,
          test_mode,
          exam_pattern,
          total_questions,
          total_marks,
          duration_minutes,
          negative_marking,
          sections,
          scheduled_at,
          expires_at,
          created_at,
          created_by,
          share_code
        `)
                .eq('id', id)
                .eq('is_active', true)
                .single(),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timed out')), 5000)
            ),
        ]) as { data: Test | null, error: any };

        if (testError || !test) {
            console.error('Test fetch error:', testError?.message);
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        // Get test questions with a limit to prevent overload
        const { data: testQuestions, error: questionsError } = await supabase
            .from('test_questions')
            .select(`
        id,
        question_id,
        question_order,
        marks,
        section_number,
        questions!test_questions_question_id_fkey (
          id,
          question_text,
          explanation,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          difficulty_level,
          subject_id,
          subjects!questions_subject_id_fkey (
            id,
            name
          ),
          topic_id,
          topics!questions_topic_id_fkey (
            id,
            name
          )
        )
      `)
            .eq('test_id', id)
            .order('question_order')
            .limit(1000); // Arbitrary limit to prevent excessive data

        if (questionsError) {
            console.error('Questions fetch error:', questionsError.message);
            return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
        }

        // Transform questions with type safety
        const transformedQuestions: any[] = (testQuestions as any[]).map((tq) => {
            const rawQuestion = tq.questions;
            const question = Array.isArray(rawQuestion) ? rawQuestion[0] : rawQuestion;

            if (!question) {
                return {
                    id: tq.id,
                    question_id: tq.question_id,
                    question_order: tq.question_order,
                    marks: tq.marks,
                    section_number: tq.section_number,
                    questions: null,
                };
            }

            const rawSubject = question.subjects;
            const subject = Array.isArray(rawSubject) ? rawSubject[0] : rawSubject;

            const rawTopic = question.topics;
            const topic = Array.isArray(rawTopic) ? rawTopic[0] : rawTopic;

            return {
                id: tq.id,
                question_id: tq.question_id,
                question_order: tq.question_order,
                marks: tq.marks,
                section_number: tq.section_number,
                questions: {
                    id: question.id,
                    question_text: question.question_text || '',
                    explanation: question.explanation || '',
                    option_a: question.option_a || '',
                    option_b: question.option_b || '',
                    option_c: question.option_c || '',
                    option_d: question.option_d || '',
                    correct_option: question.correct_option || 1,
                    difficulty_level: question.difficulty_level || '',
                    subject_id: question.subject_id || '',
                    subjects: subject || { id: '', name: 'Unknown' },
                    topic_id: question.topic_id || '',
                    topics: topic || { id: '', name: 'Unknown' },
                },
            };
        });

        // Extract unique subjects with fallback
        const uniqueSubjectsMap = new Map<string, { id: string; name: string }>();
        transformedQuestions.forEach((tq) => {
            if (tq.questions?.subjects && tq.questions.subjects.id) {
                uniqueSubjectsMap.set(tq.questions.subjects.id, tq.questions.subjects);
            }
        });
        const subjects = Array.from(uniqueSubjectsMap.values());

        // Check user attempt
        const { data: attempt, error: attemptError } = await supabase
            .from('user_test_attempts')
            .select(`
                id, 
                started_at, 
                submitted_at, 
                is_completed, 
                total_score, 
                correct_answers, 
                incorrect_answers, 
                unanswered,
                user_answers (
                    question_id,
                    selected_option,
                    is_correct
                )
            `)
            .eq('test_id', id)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (attemptError) {
            console.error('Attempt fetch error:', attemptError.message);
        }

        return NextResponse.json({
            test: {
                ...test,
                user_attempt: attempt,
                subjects: subjects.length > 0 ? subjects : [{ id: 'unknown', name: 'Unknown' }],
            } as Test & { user_attempt: typeof attempt; subjects: { id: string; name: string }[] },
            questions: transformedQuestions,
        });
    } catch (error) {
        console.error('Error fetching test:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    try {
        const { id } = await params;
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is the creator
        const { data: test, error: testError } = await supabase
            .from('tests')
            .select('created_by')
            .eq('id', id)
            .single();

        if (testError || !test) {
            console.error('Test ownership check error:', testError?.message);
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        if (test.created_by !== user.id) {
            return NextResponse.json(
                { error: 'Forbidden - You can only delete tests you created' },
                { status: 403 }
            );
        }

        // Perform soft delete with additional cleanup
        const { error: deleteError } = await supabase
            .from('tests')
            .delete() // hard delete
            .eq('id', id);
            

        if (deleteError) {
            console.error('Test deletion error:', deleteError.message);
            throw deleteError;
        }

        // Revalidate cache and path
        revalidateTag(`custom-tests-${user.id}`);

        return NextResponse.json({ message: 'Test deleted successfully' });
    } catch (error) {
        console.error('Error deleting test:', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Failed to delete test' }, { status: 500 });
    }
}