
import { z } from "zod";
import {
    PatientCaseSchema,
    ChiefComplaintSchema,
    PositiveFindingSchema,
    InvestigationSchema,
    MedicationSchema,
    ImagingSchema,
    AllergySchema,
    PersonalHistorySchema,
    PatientInfoSchema,
    VitalsSchema,
    DiagnosisSchema,
    ManagementSchema,
    FamilyHistorySchema,
    PhysicalExaminationSchema,
} from "../schemas/patientCase.schema";

export type PatientCase = z.infer<typeof PatientCaseSchema>;
export type ChiefComplaint = z.infer<typeof ChiefComplaintSchema>;
export type PositiveFinding = z.infer<typeof PositiveFindingSchema>;
export type Investigation = z.infer<typeof InvestigationSchema>;
export type Medication = z.infer<typeof MedicationSchema>;
export type Imaging = z.infer<typeof ImagingSchema>;
export type Allergy = z.infer<typeof AllergySchema>;
export type PersonalHistory = z.infer<typeof PersonalHistorySchema>;
export type PatientInfo = z.infer<typeof PatientInfoSchema>;
export type Vitals = z.infer<typeof VitalsSchema>;
export type Diagnosis = z.infer<typeof DiagnosisSchema>;
export type Management = z.infer<typeof ManagementSchema>;
export type FamilyHistory = z.infer<typeof FamilyHistorySchema>;
export type PhysicalExamination = z.infer<typeof PhysicalExaminationSchema>;

export type CaseSectionId = keyof Pick<PatientCase,
    | "patientInfo"
    | "chiefComplaints"
    | "vitals"
    | "positiveFindings"
    | "personalHistory"
    | "investigations"
    | "medications"
    | "allergies"
    | "imaging"
    | "diagnosis"
    | "management"
    | "familyHistory"
    | "physicalExamination"
>;
