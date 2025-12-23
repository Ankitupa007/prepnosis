
"use client";

import { useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce'; // Ensure this package is installed or use standard timeout
import { usePatientCaseStore } from '../store/patientCase.store';
import { createClient } from '@/supabase/client';
import { toast } from 'sonner';

export function useAutosave(caseId: string) {
    const supabase = createClient();
    const { data, isDirty, setSaving, isSaving, setDirty } = usePatientCaseStore();

    // Debounce the entire data object
    const [debouncedData] = useDebounce(data, 3000);

    useEffect(() => {
        if (!caseId || caseId === 'new') return;

        const save = async () => {
            // Check dirty state directly from store to avoid stale closures
            if (!usePatientCaseStore.getState().isDirty) return;

            setSaving(true);
            console.log("Autosaving...", debouncedData?.title || 'Unknown');

            const { title, status, patientInfo } = debouncedData;

            const { error } = await supabase
                .from('patient_cases')
                .update({
                    title: title,
                    status: status,
                    patient_info: patientInfo as any,
                    content: debouncedData as any,
                    updated_at: new Date().toISOString()
                })
                .eq('id', caseId);

            if (error) {
                toast.error("Failed to autosave changes");
                console.error("Autosave Error:", error);
            } else {
                // Successfully saved, reset dirty state
                setDirty(false);
            }
            setSaving(false);
        };

        if (isDirty) {
            save();
        }

    }, [debouncedData, caseId, supabase, setSaving, setDirty]);
}
