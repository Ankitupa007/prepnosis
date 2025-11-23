import supabaseAdmin from '@/supabase/admin';
import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete user data from various tables
        // 1. Delete custom tests
        await supabase.from('tests').delete().eq('created_by', user.id).eq('test_type', 'custom');

        // 2. Delete test rankings (must be done before attempts)
        await supabase.from('test_rankings').delete().eq('user_id', user.id);

        // 3. Delete test attempts (regular)
        await supabase.from('user_test_attempts').delete().eq('user_id', user.id);

        // 4. Delete grand test attempts
        await supabase.from('user_grand_tests_attempts').delete().eq('user_id', user.id);

        // 5. Delete user profile
        // const { error: profileError } = await supabase
        //     .from('user_profiles')
        //     .delete()
        //     .eq('id', user.id);

        // if (profileError) {
        //     console.error('Error deleting user profile:', profileError.message);
        //     return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
        // }

        const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(
            user.id
        );

        if (deleteUserError) {
            console.error('Error deleting auth user:', deleteUserError.message);
            return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error in delete-account:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
