import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Delete test rankings for the user (must be done before deleting attempts)
        const { error: rankingError } = await supabase
            .from('test_rankings')
            .delete()
            .eq('user_id', user.id);

        if (rankingError) {
            console.error('Error deleting test rankings:', rankingError.message);
            return NextResponse.json({ error: 'Failed to delete test rankings' }, { status: 500 });
        }

        // 2. Delete grand test attempts
        const { error: deleteError } = await supabase
            .from('user_grand_tests_attempts')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('Error resetting grand tests:', deleteError.message);
            return NextResponse.json({ error: 'Failed to reset grand tests' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Grand test progress reset successfully' });
    } catch (error) {
        console.error('Error in reset-grand-tests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
