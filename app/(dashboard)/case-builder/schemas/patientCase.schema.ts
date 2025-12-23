
import { z } from "zod";

// --- Enums & Helpers ---

export const DurationUnitSchema = z.enum([
    "minutes",
    "hours",
    "days",
    "weeks",
    "months",
    "years",
]);

export const SexSchema = z.enum(["male", "female", "other"]);

// --- Components Schemas ---

export const PatientInfoSchema = z.object({
    age: z.coerce.number().min(0).max(150).optional(), // Allow empty, coerce if string input
    ageUnit: z.enum(["years", "months", "days"]).default("years"),
    sex: SexSchema.optional(),
    name: z.string().optional(), // Often anonymized, but good to have fields
    uhid: z.string().optional(), // Unique Hospital ID (optional)
    occupation: z.string().optional(),
    socioeconomicStatus: z.string().optional(), // Modified Kuppuswamy etc.
    nationality: z.string().optional(),
    tags: z.array(z.string()).default([]), // e.g., "Critical", "Follow-up"
    department: z.string().optional(), // e.g., "Internal Medicine", "Surgery"
});

export const ChiefComplaintSchema = z.object({
    id: z.string().uuid(),
    symptom: z.string().min(1, "Symptom is required"),
    duration: z.coerce.number().min(0).optional(),
    durationUnit: DurationUnitSchema.optional(),
    notes: z.string().optional(), // Qualitative descriptors
});

export const PositiveFindingSchema = z.object({
    id: z.string().uuid(),
    finding: z.string().min(1, "Finding is required"),
    category: z.string().optional(), // General, CVS, CNS, etc.
    tags: z.array(z.string()).default([]),
    notes: z.string().optional(),
});

export const PersonalHistorySchema = z.object({
    id: z.string().uuid(),
    category: z.string(), // "Smoking", "Alcohol", "Diet"
    value: z.string(), // "Smoker", "Non-smoker"
    duration: z.string().optional(), // "10 years" - strict schema might represent this better, but loose text is flexible
    notes: z.string().optional(),
});

export const InvestigationSchema = z.object({
    id: z.string().uuid(),
    parameter: z.string().min(1, "Parameter is required"), // e.g., "Hemoglobin"
    value: z.string(), // "12.5" or "Positive"
    unit: z.string().optional(), // "g/dL"
    notes: z.string().optional(),
});

export const MedicationSchema = z.object({
    id: z.string().uuid(),
    drugName: z.string().min(1, "Drug name is required"),
    dose: z.string().optional(), // "500"
    unit: z.string().optional(), // "mg"
    frequency: z.string().optional(), // "BD", "OD"
    duration: z.string().optional(), // "5 days"
    route: z.string().optional(), // "PO", "IV"
    notes: z.string().optional(),
});

export const AllergySchema = z.object({
    id: z.string().uuid(),
    allergen: z.string().min(1, "Allergen is required"),
    reaction: z.string().optional(), // "Rash", "Anaphylaxis"
    severity: z.enum(["mild", "moderate", "severe"]).optional(),
    notes: z.string().optional(),
});

export const ImagingSchema = z.object({
    id: z.string().uuid(),
    url: z.string().optional(),
    modality: z.string().optional(), // X-Ray, MRI
    view: z.string().optional(), // PA view, Lateral
    fileType: z.string().optional(),
    findings: z.string().optional(),
    title: z.string().optional(),
});

export const VitalsSchema = z.object({
    pulse: z.coerce.number().optional(), // bpm
    bpSystolic: z.coerce.number().optional(), // mmHg
    bpDiastolic: z.coerce.number().optional(), // mmHg
    temp: z.coerce.number().optional(), // °F or °C
    tempUnit: z.enum(["F", "C"]).default("F"),
    rr: z.coerce.number().optional(), // breaths/min
    spo2: z.coerce.number().optional(), // %
    weight: z.coerce.number().optional(), // kg
    height: z.coerce.number().optional(), // cm
    bmi: z.coerce.number().optional(),
});

export const DiagnosisSchema = z.object({
    differentials: z.array(z.string()).default([]),
    provisionalDiagnosis: z.string().optional(),
    finalDiagnosis: z.string().optional(),
    notes: z.string().optional(),
});

export const ManagementSchema = z.object({
    strategy: z.string().optional(), // Overall clinical strategy
    nursingCare: z.string().optional(),
    followUp: z.string().optional(),
    notes: z.string().optional(),
});

export const FamilyHistorySchema = z.object({
    id: z.string().uuid(),
    condition: z.string(), // e.g. "Diabetes", "Hypertension"
    relation: z.string(), // e.g. "Father", "Mother"
    notes: z.string().optional(),
});

export const PhysicalExaminationSchema = z.object({
    generalAppearance: z.string().optional(),
    systemicExam: z.array(z.object({
        system: z.string(), // CNS, CVS, RS, GIT
        findings: z.string()
    })).default([]),
    notes: z.string().optional(),
});

// --- Main Case Schema ---

export const PatientCaseSchema = z.object({
    id: z.string().uuid().optional(), // Optional on client before first save
    title: z.string().default("Refractory Hypertension in 45/M"), // Smart default
    status: z.enum(["draft", "published", "archived"]).default("draft"),

    // Sections
    patientInfo: PatientInfoSchema.default({}),
    chiefComplaints: z.array(ChiefComplaintSchema).default([]),
    vitals: VitalsSchema.default({}),
    positiveFindings: z.array(PositiveFindingSchema).default([]),
    personalHistory: z.array(PersonalHistorySchema).default([]),
    investigations: z.array(InvestigationSchema).default([]),
    imaging: z.array(ImagingSchema).default([]),
    medications: z.array(MedicationSchema).default([]),
    allergies: z.array(AllergySchema).default([]),
    diagnosis: DiagnosisSchema.default({}),
    management: ManagementSchema.default({}),
    familyHistory: z.array(FamilyHistorySchema).default([]),
    physicalExamination: PhysicalExaminationSchema.default({}),

    // Metadata
    sectionOrder: z.array(z.string()).default([
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
        "management"
    ]), // For custom ordering

    updatedAt: z.date().optional(),
    createdAt: z.date().optional(),
});
