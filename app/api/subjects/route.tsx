// app/api/subjects/route.ts

import {createClient} from "@/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {revalidateTag, unstable_cache} from "next/cache";

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    try {
        const getCachedSubjects = unstable_cache(
            async () => {
                const { data: subjects, error } = await supabase
                    .from("subjects")
                    .select(`
            id,
            name,
            description,
            weightage_neet_pg,
            weightage_inicet
          `)
                    .order("name");

                if (error) throw error;

                return { subjects };
            },
            ["subjects"],
            { tags: ["subjects"], revalidate: 86400 } // Cache for 24 hours
        );

        const data = await getCachedSubjects();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return NextResponse.json(
            { error: "Failed to fetch subjects" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, weightage_neet_pg, weightage_inicet } = body;

        const { data: subject, error } = await supabase
            .from("subjects")
            .insert({
                name,
                description,
                weightage_neet_pg,
                weightage_inicet,
            })
            .select()
            .single();

        if (error) throw error;

        // Revalidate subjects cache
        revalidateTag("subjects");

        return NextResponse.json({ subject });
    } catch (error) {
        console.error("Error creating subject:", error);
        return NextResponse.json(
            { error: "Failed to create subject" },
            { status: 500 }
        );
    }
}