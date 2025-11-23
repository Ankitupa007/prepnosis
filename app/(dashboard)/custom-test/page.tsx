// src/app/custom-test/page.tsx
import UserHeader from "@/components/user-header"
import AllTests from "./AllTests"
import {createClient} from "@/supabase/server";
import {redirect} from "next/navigation";
import {dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";
import {getCustomTests} from "@/app/data/custom-test-actions/custom-test-actions";
import {testsKeys} from "@/hooks/tests/useTests";

export default async function CustomTestPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login"); // Adjust redirect path as needed
    }

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: testsKeys.user(user.id),
        queryFn: () => getCustomTests(user.id),
    });

    return (
        <div className="mx-auto relative">
            <UserHeader text='Custom Tests' />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <AllTests />
            </HydrationBoundary>
        </div>
    );
}