
import { PatientCase } from "../types/patientCase";

/**
 * Generates a formal medical narrative from the patient case data.
 */
export function generateMedicalNarrative(data: PatientCase) {
    const {
        patientInfo,
        chiefComplaints,
        vitals,
        physicalExamination,
        positiveFindings,
        personalHistory,
        familyHistory,
        medications,
        allergies,
        investigations,
        imaging,
        diagnosis,
        management
    } = data;

    // 1. Introduction & Demographics
    const ageStr = patientInfo.age ? `${patientInfo.age}-${patientInfo.ageUnit === 'years' ? 'year-old' : patientInfo.ageUnit}` : "An adult";
    const sexStr = patientInfo.sex || "patient";
    let intro = `${ageStr} ${sexStr} presented with `;

    if (chiefComplaints && chiefComplaints.length > 0) {
        const complaints = chiefComplaints.map(c => `${c.symptom || 'unspecified complaints'} for a duration of ${c.duration || 'unknown'} ${c.durationUnit || 'days'}`).join(", ");
        intro += complaints + ". ";
    } else {
        intro += "unspecified concerns. ";
    }

    // 2. History of Present Illness / Positive Findings
    let hpi = "";
    if (positiveFindings && positiveFindings.length > 0) {
        hpi = "The current clinical presentation is characterized by several significant findings. ";
        const findings = positiveFindings.map(f => f.finding).join(". ");
        hpi += findings + ". ";
    }

    // 3. Past Medical & Personal History
    let history = "";
    const personal = personalHistory?.map(p => `${p.category}: ${p.value}`).join(", ");
    if (personal) history += `Relevant personal history includes ${personal}. `;

    const fam = familyHistory?.map(f => `${f.condition} in ${f.relation}`).join(", ");
    if (fam) history += `Family history is notable for ${fam}. `;

    if (medications && medications.length > 0) {
        const meds = medications.map(m => m.drugName).join(", ");
        history += `Current pharmacotherapy includes ${meds}. `;
    }

    if (allergies && allergies.length > 0) {
        const alg = allergies.map(a => a.allergen).join(", ");
        history += `Known allergies include ${alg}. `;
    }

    // 4. Clinical Examination
    let examination = "On physical examination, ";
    if (vitals) {
        examination += `the patient was found to have a blood pressure of ${vitals.bpSystolic || '---'}/${vitals.bpDiastolic || '---'} mmHg, pulse rate of ${vitals.pulse || '---'} bpm, and a temperature of ${vitals.temp || '---'}°${vitals.tempUnit || 'F'}. `;
    }

    if (physicalExamination?.systemicExam?.length > 0) {
        const systems = physicalExamination.systemicExam.map(s => `${s.system}: ${s.findings}`).join(". ");
        examination += `Systemic examination revealed: ${systems}. `;
    }

    // 5. Investigations & Workup
    let workup = "";
    if (investigations && investigations.length > 0) {
        const inv = investigations.map(i => `${i.parameter} was ${i.value}`).join("; ");
        workup += `Laboratory investigations showed: ${inv}. `;
    }

    if (imaging && imaging.length > 0) {
        const img = imaging.map(i => `${i.title || 'Imaging study'} showed ${i.findings || 'clinical findings'}`).join(". ");
        workup += `Radiographic assessments included: ${img}. `;
    }

    // 6. Assessment & Plan
    let assessment = "";
    if (diagnosis) {
        assessment = `Differential considerations included ${diagnosis.differentials?.join(", ") || "various clinical possibilities"}. `;
        if (diagnosis.provisionalDiagnosis) {
            assessment += `A provisional diagnosis of ${diagnosis.provisionalDiagnosis} was established. `;
        }
        if (diagnosis.finalDiagnosis) {
            assessment += `Ultimately, a final diagnosis of ${diagnosis.finalDiagnosis} was confirmed. `;
        }
    }

    let plan = "";
    if (management) {
        if (management.strategy) plan += `The management strategy focused on ${management.strategy}. `;
        if (management.followUp) plan += `Scheduled follow-up includes ${management.followUp}. `;
    }

    return {
        intro,
        hpi,
        history,
        examination,
        workup,
        assessment,
        plan
    };
}
