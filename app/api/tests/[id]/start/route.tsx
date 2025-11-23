// app/api/tests/[id]/start/route.ts
import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { id } = await params;
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if test exists and is active
        const { data: test, error: testError } = await supabase
            .from('tests')
            .select('id, title, duration_minutes, test_type, scheduled_at, expires_at')
            .eq('id', id)
            .eq('is_active', true)
            .single();

        if (testError || !test) {
            console.error('Test fetch error:', testError);
            return NextResponse.json({ error: 'Test not found' }, { status: 404 });
        }

        // Check test availability
        const now = new Date();
        if (test.scheduled_at && new Date(test.scheduled_at) > now) {
            return NextResponse.json({ error: 'Test has not started yet' }, { status: 412 });
        }
        if (test.expires_at && new Date(test.expires_at) < now) {
            return NextResponse.json({ error: 'Test has expired' }, { status: 413 });
        }

        // Check if user has completed the test
        const { data: existingAttempt, error: attemptError } = await supabase
            .from('user_test_attempts')
            .select('id, is_completed')
            .eq('test_id', id)
            .eq('user_id', user.id)
            .eq('is_completed', true)
            .maybeSingle();

        if (attemptError) {
            console.error('Attempt fetch error:', attemptError);
        }

        if (existingAttempt && test.test_type === 'grand_test') {
            return NextResponse.json({ error: 'You have already completed this test' }, { status: 400 });
        }

        // Check for ongoing attempt
        const { data: ongoingAttempt, error: ongoingError } = await supabase
            .from('user_test_attempts')
            .select('id, started_at, is_completed')
            .eq('test_id', id)
            .eq('user_id', user.id)
            .eq('is_completed', false)
            .maybeSingle();

        if (ongoingError) {
            console.error('Ongoing attempt fetch error:', ongoingError);
            return NextResponse.json({ error: 'Failed to check ongoing attempt' }, { status: 500 });
        }

        let attempt;
        if (ongoingAttempt) {
            attempt = ongoingAttempt;
        } else {
            const { data: newAttempt, error: newAttemptError } = await supabase
                .from('user_test_attempts')
                .insert({
                    user_id: user.id,
                    test_id: id,
                    started_at: new Date().toISOString(),
                })
                .select()
                .single();

            if (newAttemptError) {
                console.error('New attempt creation error:', newAttemptError);
                return NextResponse.json({ error: 'Failed to create attempt' }, { status: 500 });
            }
            attempt = newAttempt;
        }

        return NextResponse.json({
            attempt: {
                id: attempt.id,
                test_id: test.id,
                test_title: test.title,
                started_at: attempt.started_at,
                duration_minutes: test.duration_minutes,
            },
        });
    } catch (error) {
        console.error('Error starting test:', error);
        return NextResponse.json({ error: 'Failed to start test' }, { status: 500 });
    }
}