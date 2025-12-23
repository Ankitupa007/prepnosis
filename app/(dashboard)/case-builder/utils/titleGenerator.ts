
import { PatientCase } from "../types/patientCase";

/**
 * Intelligent utility to generate a professional case title based on patient information and diagnosis.
 */
export function generateClinicalTitle(data: PatientCase): string {
    const { patientInfo, chiefComplaints, diagnosis } = data;

    // 1. Check for Final or Provisional Diagnosis first as they are most specific
    if (diagnosis?.finalDiagnosis) {
        return `Confirmed Case of ${diagnosis.finalDiagnosis}`;
    }
    if (diagnosis?.provisionalDiagnosis) {
        return `Provisional: ${diagnosis.provisionalDiagnosis}`;
    }

    // 2. Fallback to Demographics + Chief Complaints
    const age = patientInfo?.age;
    const sex = patientInfo?.sex ? (patientInfo.sex === 'male' ? 'M' : patientInfo.sex === 'female' ? 'F' : 'Other') : '';
    const demo = age && sex ? `${age}/${sex}` : age ? `${age}-year-old` : sex || "Adult";

    if (chiefComplaints && chiefComplaints.length > 0) {
        const primarySymptom = chiefComplaints[0].symptom;
        const duration = chiefComplaints[0].duration ? ` for ${chiefComplaints[0].duration} ${chiefComplaints[0].durationUnit || 'days'}` : '';
        return `${demo} presenting with ${primarySymptom}${duration}`;
    }

    // 3. Ultimate Fallback
    return `Clinical Case: ${demo}`;
}
