import dynamic from 'next/dynamic'
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import {
  Hand,          // Anatomy
  Activity,      // Physiology
  FlaskConical,  // Biochemistry
  Microscope,    // Pathology
  Pill,          // Pharmacology
  Bug,           // Microbiology
  Users,         // Community Medicine (PSM)
  Slice,       // Surgery
  Baby,          // Pediatrics
  BrainCog,      // Psychiatry
  Eye,           // Ophthalmology
  Ear,           // ENT
  Syringe,         // Anesthesia
  ScanLine,      // Radiology,
  Bone,          // Orthopedics
  Fingerprint,
  Sparkles,
  HeartHandshake,  // Obstetrics & Gynaecology
  Stethoscope, //Medicine
  FileQuestion,
  Smile,       // Dental
} from "lucide-react";
export const subjectIconMap: Record<string, React.FC<any>> = {
  Anatomy: Hand,
  Physiology: Activity,
  Biochemistry: FlaskConical,
  Pathology: Microscope,
  Pharmacology: Pill,
  Microbiology: Bug,
  Dental: Smile,
  "Forensic Medicine": Fingerprint,
  "Community Medicine": Users,
  Medicine: Stethoscope,
  Surgery: Slice,
  Pediatrics: Baby,
  "Obstetrics Gynaecology": HeartHandshake,
  Psychiatry: BrainCog,
  Ophthalmology: Eye,
  ENT: Ear,
  Anaesthesia: Syringe,
  Radiology: ScanLine,
  Orthopaedics: Bone,
  Unknown: FileQuestion,
  Dermatology: Sparkles, // or Sparkles for cosmetic derm
};


interface SubjectIconsProps {
  subjectName: string;
  props?: LucideProps;
  styles: string
}

const SubjectIcons: React.FC<SubjectIconsProps> = ({ subjectName, styles, props }) => {
  const Icon = subjectIconMap[subjectName];
  return <Icon {...props} className={styles} />;
}

export default SubjectIcons