
"use client";

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/supabase/client';
import { usePatientCaseStore } from '../store/patientCase.store';
import { PatientCase } from '../types/patientCase';
import { toast } from "sonner";

export function usePatientCase(caseId: string) {
    const supabase = createClient();
    const { setCase } = usePatientCaseStore();

    const query = useQuery({
        queryKey: ['patient-case', caseId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('patient_cases')
                .select('*')
                .eq('id', caseId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!caseId && caseId !== 'new',
    });

    // Sync data to store on load
    useEffect(() => {
        if (query.data) {
            // Map DB shape to Store shape
            // 'content' column holds the major JSON
            const dbContent = query.data.content as Partial<PatientCase>;

            const mergedCase: PatientCase = {
                ...dbContent, // defaults from JSON
                id: query.data.id,
                title: query.data.title || "Untitled Case",
                status: (query.data.status as any) || "draft",
                patientInfo: {
                    age: 0,
                    sex: "male",
                    tags: [],
                    ageUnit: "years",
                    ...(query.data.patient_info as any),
                    ...dbContent.patientInfo
                },
                // Ensure arrays exist
                chiefComplaints: dbContent.chiefComplaints || [],
                positiveFindings: dbContent.positiveFindings || [],
                personalHistory: dbContent.personalHistory || [],
                investigations: dbContent.investigations || [],
                medications: dbContent.medications || [],
                allergies: dbContent.allergies || [],
                imaging: dbContent.imaging || [],
                familyHistory: dbContent.familyHistory || [],

                // Ensure objects exist
                vitals: dbContent.vitals || { tempUnit: "F" },
                diagnosis: dbContent.diagnosis || { differentials: [] },
                management: dbContent.management || {},
                physicalExamination: dbContent.physicalExamination || { systemicExam: [] },

                sectionOrder: (() => {
                    const defaultOrder = [
                        "patientInfo",
                        "chiefComplaints",
                        "vitals",
                        "physicalExamination",
                        "positiveFindings",
                        "personalHistory",
                        "familyHistory",
                        "medications",
                        "allergies",
                        "investigations",
                        "imaging",
                        "diagnosis",
                        "management",
                    ];

                    if (!dbContent.sectionOrder) return defaultOrder;

                    // Merge: keep existing order but add missing default sections at the end
                    const existing = new Set(dbContent.sectionOrder);
                    const missing = defaultOrder.filter(s => !existing.has(s));
                    return [...dbContent.sectionOrder, ...missing];
                })(),
            };

            setCase(mergedCase);
        }
    }, [query.data, setCase]);

    return query;
}

export function useCreateCase() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (title: string) => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("You must be logged in to create a case");

            // Basic initial structure
            const { data, error } = await supabase.from('patient_cases').insert({
                title,
                user_id: user.id,
                content: {},
                patient_info: {}
            }).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['patient-cases-list'] });
            toast.success("Case created");
        },
        onError: (error) => {
            console.error("Failed to create case:", error);
            toast.error("Failed to create case. Please try again.");
        }
    })
}
export function useDeleteCase() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (caseId: string) => {
            const { error } = await supabase
                .from('patient_cases')
                .delete()
                .eq('id', caseId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patient-cases-list'] });
            toast.success("Case deleted successfully");
        },
        onError: (error) => {
            console.error("Failed to delete case:", error);
            toast.error("Failed to delete case. Please try again.");
        }
    });
}
