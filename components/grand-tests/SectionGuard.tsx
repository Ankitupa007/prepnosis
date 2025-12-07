"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SectionGuardProps {
    testId: string;
    currentSection: number;
    isCompleted?: boolean;
}

export default function SectionGuard({
    testId,
    currentSection,
    isCompleted = false,
}: SectionGuardProps) {
    const router = useRouter();

    useEffect(() => {
        if (isCompleted) {
            localStorage.removeItem(`grand_test_${testId}_current_section`);
            return;
        }

        const storedSection = localStorage.getItem(
            `grand_test_${testId}_current_section`
        );

        if (storedSection) {
            const storedSectionNum = parseInt(storedSection);
            if (storedSectionNum !== currentSection) {
                // If we are on the wrong section according to local storage, redirect immediately
                // But only if the stored section is valid (greater than 0)
                if (storedSectionNum > 0) {
                    console.log(
                        `[SectionGuard] Redirecting from ${currentSection} to ${storedSectionNum}`
                    );
                    toast.warning(`Resuming Section ${storedSectionNum}`);
                    router.replace(`/grand-tests/${testId}/section/${storedSectionNum}`);
                }
            }
        } else {
            // If no stored section, set it to the current one (assuming this component is rendered when we are on the correct section)
            localStorage.setItem(
                `grand_test_${testId}_current_section`,
                currentSection.toString()
            );
        }
    }, [testId, currentSection, isCompleted, router]);

    // Update storage when props change (e.g. after server fetch confirms section)
    useEffect(() => {
        if (!isCompleted && currentSection > 0) {
            localStorage.setItem(
                `grand_test_${testId}_current_section`,
                currentSection.toString()
            );
        }
    }, [testId, currentSection, isCompleted]);

    return null;
}
