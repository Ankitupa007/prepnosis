// app/custom-test/create/page.tsx
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { createClient } from "@/supabase/server";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import CreateCustomTestClient from "@/app/(dashboard)/custom-test/create/CreateCustomTestClient";

interface Subject {
    id: string;
    name: string;
}

// Server-side fetch for subjects with caching
async function getSubjects() {
    const cacheKey = ["subjects"];
    const supabase = await createClient();
    const cachedSubjects = unstable_cache(
        async () => {
            const { data, error } = await supabase
                .from("subjects")
                .select("id, name")
                .order("name");

            if (error) {
                throw new Error("Failed to fetch subjects");
            }
            return data as Subject[];
        },
        cacheKey,
        { tags: ["subjects"], revalidate: 604800 } // Cache for 7 days
    );

    return cachedSubjects();
}

// Server Component
export default async function CreateCustomTest() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login"); // Adjust redirect path as needed
    }

    const subjects = await getSubjects();

    return (
        <Suspense fallback={<LoadingSpinner text="Loading Subjects" />}>
            <CreateCustomTestClient subjects={subjects} />
        </Suspense>
    );
}
