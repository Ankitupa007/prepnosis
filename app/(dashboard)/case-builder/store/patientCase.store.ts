
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import {
    PatientCase,
    ChiefComplaint,
    PositiveFinding,
    Investigation,
    Medication,
    Allergy,
    Imaging,
    PersonalHistory,
    PatientInfo,
    Vitals,
    Diagnosis,
    Management,
    FamilyHistory,
    PhysicalExamination
} from '../types/patientCase';

interface PatientCaseState {
    // Data
    data: PatientCase;

    // UI State
    isSaving: boolean;
    isDirty: boolean; // Tracking if changes happened since last save
    activeSectionId: string | null; // For focusing

    // Actions - Core
    setCase: (data: PatientCase) => void;
    resetCase: () => void;
    setSaving: (saving: boolean) => void;
    updateTitle: (title: string) => void;

    // Actions - Patient Info
    updatePatientInfo: (info: Partial<PatientInfo>) => void;

    // Actions - Chief Complaints
    addChiefComplaint: () => void;
    updateChiefComplaint: (id: string, updates: Partial<ChiefComplaint>) => void;
    removeChiefComplaint: (id: string) => void;
    reorderChiefComplaints: (newOrder: ChiefComplaint[]) => void;

    // Actions - Positive Findings
    addPositiveFinding: (text: string, category?: string) => void;
    updatePositiveFinding: (id: string, updates: Partial<PositiveFinding>) => void;
    removePositiveFinding: (id: string) => void;

    // Actions - Personal History
    addPersonalHistory: (item: Partial<PersonalHistory>) => void;
    removePersonalHistory: (id: string) => void;

    // Actions - Medications
    addMedication: () => void;
    updateMedication: (id: string, updates: Partial<Medication>) => void;
    removeMedication: (id: string) => void;

    // Actions - Allergies
    addAllergy: () => void;
    updateAllergy: (id: string, updates: Partial<Allergy>) => void;
    removeAllergy: (id: string) => void;

    // Actions - Investigations
    addInvestigation: () => void;
    updateInvestigation: (id: string, updates: Partial<Investigation>) => void;
    removeInvestigation: (id: string) => void;

    // Actions - Vitals
    updateVitals: (vitals: Partial<Vitals>) => void;

    // Actions - Diagnosis
    updateDiagnosis: (diagnosis: Partial<Diagnosis>) => void;

    // Actions - Management
    updateManagement: (management: Partial<Management>) => void;

    // Actions - Family History
    addFamilyHistory: () => void;
    updateFamilyHistory: (id: string, updates: Partial<FamilyHistory>) => void;
    removeFamilyHistory: (id: string) => void;

    // Actions - Physical Examination
    updatePhysicalExamination: (exam: Partial<PhysicalExamination>) => void;

    // Actions - Imaging
    addImaging: () => void;
    updateImaging: (id: string, updates: Partial<Imaging>) => void;
    removeImaging: (id: string) => void;

    // Actions - Generic Section Reorder
    reorderSections: (newOrder: string[]) => void;
    setDirty: (isDirty: boolean) => void;
}

const INITIAL_CASE: PatientCase = {
    // ID is optional initially
    title: "Untitled Case",
    status: "draft",
    patientInfo: {
        age: 0,
        sex: "male",
        tags: [],
        ageUnit: "years",
        department: ""
    },
    chiefComplaints: [],
    positiveFindings: [],
    personalHistory: [],
    investigations: [],
    medications: [],
    allergies: [],
    vitals: { tempUnit: "F" },
    diagnosis: { differentials: [] },
    familyHistory: [],
    physicalExamination: { systemicExam: [] },
    management: {},
    imaging: [],
    sectionOrder: [
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
    ]
};

export const usePatientCaseStore = create<PatientCaseState>()(
    devtools(
        persist(
            (set) => ({
                data: INITIAL_CASE,
                isSaving: false,
                isDirty: false,
                activeSectionId: null,

                setCase: (data) => set({ data, isDirty: false }),

                resetCase: () => set({ data: INITIAL_CASE, isDirty: false }),

                setSaving: (isSaving) => set({ isSaving }),

                updateTitle: (title) =>
                    set((state) => ({
                        data: { ...state.data, title },
                        isDirty: true,
                    })),

                updatePatientInfo: (info) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            patientInfo: { ...state.data.patientInfo, ...info },
                        },
                        isDirty: true,
                    })),

                addChiefComplaint: () =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            chiefComplaints: [
                                ...state.data.chiefComplaints,
                                { id: uuidv4(), symptom: "", duration: 0, durationUnit: "days" },
                            ],
                        },
                        isDirty: true,
                    })),

                updateChiefComplaint: (id, updates) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            chiefComplaints: state.data.chiefComplaints.map((c) =>
                                c.id === id ? { ...c, ...updates } : c
                            ),
                        },
                        isDirty: true,
                    })),

                removeChiefComplaint: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            chiefComplaints: state.data.chiefComplaints.filter((c) => c.id !== id),
                        },
                        isDirty: true,
                    })),

                reorderChiefComplaints: (newOrder) =>
                    set((state) => ({
                        data: { ...state.data, chiefComplaints: newOrder },
                        isDirty: true
                    })),

                addPositiveFinding: (text, category) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            positiveFindings: [
                                ...state.data.positiveFindings,
                                { id: uuidv4(), finding: text, category: category || 'general', tags: [], notes: '' }
                            ]
                        },
                        isDirty: true
                    })),

                removePositiveFinding: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            positiveFindings: state.data.positiveFindings.filter(f => f.id !== id)
                        },
                        isDirty: true
                    })),

                updatePositiveFinding: (id: string, updates: Partial<PositiveFinding>) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            positiveFindings: state.data.positiveFindings.map((f) =>
                                f.id === id ? { ...f, ...updates } : f
                            ),
                        },
                        isDirty: true,
                    })),

                addPersonalHistory: (item) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            personalHistory: [
                                ...state.data.personalHistory,
                                { id: uuidv4(), category: 'Other', value: '', ...item }
                            ]
                        },
                        isDirty: true
                    })),

                removePersonalHistory: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            personalHistory: state.data.personalHistory.filter(h => h.id !== id)
                        },
                        isDirty: true
                    })),

                addMedication: () =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            medications: [
                                ...state.data.medications,
                                { id: uuidv4(), drugName: "" },
                            ],
                        },
                        isDirty: true,
                    })),

                updateMedication: (id, updates) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            medications: state.data.medications.map((m) =>
                                m.id === id ? { ...m, ...updates } : m
                            ),
                        },
                        isDirty: true,
                    })),

                removeMedication: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            medications: state.data.medications.filter((m) => m.id !== id),
                        },
                        isDirty: true,
                    })),

                addAllergy: () =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            allergies: [
                                ...state.data.allergies,
                                { id: uuidv4(), allergen: "" },
                            ],
                        },
                        isDirty: true,
                    })),

                updateAllergy: (id, updates) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            allergies: state.data.allergies.map((a) =>
                                a.id === id ? { ...a, ...updates } : a
                            ),
                        },
                        isDirty: true,
                    })),

                removeAllergy: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            allergies: state.data.allergies.filter((a) => a.id !== id),
                        },
                        isDirty: true,
                    })),

                addInvestigation: () =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            investigations: [
                                ...state.data.investigations,
                                { id: uuidv4(), parameter: "", value: "" },
                            ],
                        },
                        isDirty: true,
                    })),

                updateInvestigation: (id, updates) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            investigations: state.data.investigations.map((i) =>
                                i.id === id ? { ...i, ...updates } : i
                            ),
                        },
                        isDirty: true,
                    })),

                removeInvestigation: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            investigations: state.data.investigations.filter((i) => i.id !== id),
                        },
                        isDirty: true,
                    })),

                updateVitals: (vitals) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            vitals: { ...state.data.vitals, ...vitals },
                        },
                        isDirty: true,
                    })),

                updateDiagnosis: (diagnosis) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            diagnosis: { ...state.data.diagnosis, ...diagnosis },
                        },
                        isDirty: true,
                    })),

                updateManagement: (management) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            management: { ...state.data.management, ...management },
                        },
                        isDirty: true,
                    })),

                addFamilyHistory: () =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            familyHistory: [
                                ...state.data.familyHistory,
                                { id: uuidv4(), condition: "", relation: "" },
                            ],
                        },
                        isDirty: true,
                    })),

                updateFamilyHistory: (id, updates) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            familyHistory: state.data.familyHistory.map((fh) =>
                                fh.id === id ? { ...fh, ...updates } : fh
                            ),
                        },
                        isDirty: true,
                    })),

                removeFamilyHistory: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            familyHistory: state.data.familyHistory.filter((fh) => fh.id !== id),
                        },
                        isDirty: true,
                    })),

                updatePhysicalExamination: (exam) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            physicalExamination: { ...state.data.physicalExamination, ...exam },
                        },
                        isDirty: true,
                    })),

                addImaging: () =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            imaging: [
                                ...state.data.imaging,
                                { id: uuidv4() },
                            ],
                        },
                        isDirty: true,
                    })),

                updateImaging: (id, updates) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            imaging: state.data.imaging.map((img) =>
                                img.id === id ? { ...img, ...updates } : img
                            ),
                        },
                        isDirty: true,
                    })),

                removeImaging: (id) =>
                    set((state) => ({
                        data: {
                            ...state.data,
                            imaging: state.data.imaging.filter((img) => img.id !== id),
                        },
                        isDirty: true,
                    })),

                reorderSections: (newOrder) =>
                    set((state) => ({
                        data: { ...state.data, sectionOrder: newOrder },
                        isDirty: true
                    })),

                setDirty: (isDirty) => set({ isDirty }),
            }),
            {
                name: 'patient-case-storage',
                version: 1,
                migrate: (persistedState: any, version: number) => {
                    if (version === 0) {
                        // Migration from old sectionOrder
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

                        if (persistedState?.data?.sectionOrder) {
                            const existing = new Set(persistedState.data.sectionOrder);
                            const missing = defaultOrder.filter(s => !existing.has(s));
                            persistedState.data.sectionOrder = [...persistedState.data.sectionOrder, ...missing];
                        }
                    }
                    return persistedState;
                },
                // Only persist 'data', not UI state
                partialize: (state) => ({ data: state.data }),
            }
        )
    )
);
