import { createClient } from '@/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function DELETE(request: NextRequest) {
    const supabase = await createClient();
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete all tests created by the user where test_type is 'custom'
        // We also need to ensure we don't delete grand tests if they are stored in the same table
        // Based on schema, 'tests' table has 'test_type' enum.

        const { error: deleteError } = await supabase
            .from('tests')
            .delete()
            .eq('created_by', user.id)
            .eq('test_type', 'custom');

        if (deleteError) {
            console.error('Error deleting all tests:', deleteError.message);
            return NextResponse.json({ error: 'Failed to delete tests' }, { status: 500 });
        }

        revalidateTag(`custom-tests-${user.id}`);

        return NextResponse.json({ message: 'All custom tests deleted successfully' });
    } catch (error) {
        console.error('Error in delete-all-tests:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
