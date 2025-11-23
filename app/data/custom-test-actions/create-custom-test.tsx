// app/data/custom-test-actions/create-test-action.ts
"use server";

import { createClient } from "@/supabase/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Validation schema
const createTestSchema = z.object({
    numberOfQuestions: z.number().min(1).max(1000),
    testMode: z.enum(["regular", "exam"]),
    subjects: z.array(z.string()).min(1, "At least one subject is required"),
    enableSharing: z.enum(["true", "false"]).transform((val) => val === "true"),
});

function generateShareCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Utility to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export async function createCustomTest(formData: FormData) {
    let testId: string | null = null;

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error("Unauthorized");
        }

        // Parse and validate form data
        const data = createTestSchema.parse({
            numberOfQuestions: Number(formData.get("numberOfQuestions")),
            testMode: formData.get("testMode"),
            subjects: formData.getAll("subjects"),
            enableSharing: formData.get("enableSharing"),
        });

        console.log("Validated form data:", data);

        // Verify subjects exist
        const { data: validSubjects, error: subjectsError } = await supabase
            .from("subjects")
            .select("id")
            .in("id", data.subjects);

        if (subjectsError) {
            console.error("Subject validation error:", subjectsError);
            throw new Error("Failed to validate subjects");
        }
        if (!validSubjects || validSubjects.length !== data.subjects.length) {
            console.error("Invalid subjects:", { provided: data.subjects, valid: validSubjects });
            throw new Error("Invalid subjects selected");
        }

        // Fetch questions for selected subjects
        const questionsPerSubject = Math.floor(data.numberOfQuestions / data.subjects.length);
        const remainingQuestions = data.numberOfQuestions % data.subjects.length;
        let selectedQuestions: any[] = [];

        for (const [index, subjectId] of data.subjects.entries()) {
            const questionsToTake = questionsPerSubject + (index < remainingQuestions ? 1 : 0);
            const { data: subjectQuestions, error } = await supabase
                .from("questions")
                .select("id, subject_id")
                .eq("is_active", true)
                .eq("subject_id", subjectId)
                .limit(questionsToTake);

            if (error) {
                console.error(`Error fetching questions for subject ${subjectId}:`, error);
                continue;
            }

            console.log(`Fetched ${subjectQuestions?.length || 0} questions for subject ${subjectId}`);
            if (subjectQuestions) {
                selectedQuestions.push(...shuffleArray(subjectQuestions));
            }
        }

        if (selectedQuestions.length < data.numberOfQuestions) {
            const usedQuestionIds = new Set(selectedQuestions.map((q) => q.id));
            const { data: extraQuestions, error } = await supabase
                .from("questions")
                .select("id, subject_id")
                .eq("is_active", true)
                .in("subject_id", data.subjects)
                .not("id", "in", `(${Array.from(usedQuestionIds).join(",")})`)
                .limit(data.numberOfQuestions - selectedQuestions.length);

            if (error) {
                console.error("Error fetching extra questions:", error);
            } else if (extraQuestions) {
                console.log(`Fetched ${extraQuestions.length} extra questions`);
                selectedQuestions.push(...shuffleArray(extraQuestions));
            }
        }

        if (selectedQuestions.length === 0) {
            throw new Error("No questions available for selected subjects");
        }

        console.log(`Total selected questions: ${selectedQuestions.length}`);

        // Create test record
        const shareCode = data.enableSharing ? generateShareCode() : null;
        const { data: test, error: testError } = await supabase
            .from("tests")
            .insert({
                title: `Custom Test - ${selectedQuestions.length} Questions`,
                description: `Custom practice test with ${selectedQuestions.length} questions in ${data.testMode} mode`,
                test_type: "custom",
                test_mode: data.testMode,
                exam_pattern: "NEET_PG",
                total_questions: selectedQuestions.length,
                total_marks: selectedQuestions.length * 4,
                duration_minutes: 0,
                negative_marking: 0,
                is_active: true,
                created_by: user.id,
                share_code: shareCode,
                is_shareable: data.enableSharing,
            })
            .select("id, share_code")
            .single();

        if (testError) {
            console.error("Test creation error:", testError);
            throw new Error(`Failed to create test: ${testError.message}`);
        }

        // Insert test-question mappings
        const testQuestions = selectedQuestions.map((question, index) => ({
            test_id: test.id,
            question_id: question.id,
            section_number: 1,
            question_order: index + 1,
            marks: 4,
        }));

        const { error: mappingError } = await supabase
            .from("test_questions")
            .insert(testQuestions);

        if (mappingError) {
            console.error("Test questions mapping error:", mappingError);
            await supabase.from("tests").delete().eq("id", test.id); // Cleanup
            throw new Error(`Failed to create test questions mapping: ${mappingError.message}`);
        }

        // Revalidate cache
        revalidateTag(`custom-tests-${user.id}`);
        revalidatePath(`/custom-test/${test.id}`);

        testId = test.id;

    } catch (error) {
        console.error("Error creating test:", error);
        return { error: `Failed to create test: ${error instanceof Error ? error.message : "Unknown error"}` };
    }

    if (testId) {
        return { testId };
    }
}