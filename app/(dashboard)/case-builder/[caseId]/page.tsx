"use client";

import React, { use } from 'react';
import { ChevronLeft, Loader2, Save, GripVertical, User, ClipboardList, Activity, Microscope, BookOpen } from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { generateClinicalTitle } from "../utils/titleGenerator";
import { usePatientCase } from '../hooks/usePatientCase';
import { useAutosave } from '../hooks/useAutosave';
import { usePatientCaseStore } from '../store/patientCase.store';

// Import all clinical cards
import { PatientInfoCard } from "../components/patient-info-card";
import { ChiefComplaintsCard } from "../components/chief-complaints-card";
import { PositiveFindingsCard } from "../components/PositiveFindingsCard";
import { PersonalHistoryCard } from "../components/PersonalHistoryCard";
import { MedicationsCard } from "../components/MedicationsCard";
import { AllergiesCard } from "../components/AllergiesCard";
import { InvestigationsCard } from "../components/InvestigationsCard";
import { ImagingCard } from "../components/ImagingCard";
import { DiagnosisCard } from "../components/DiagnosisCard";
import { ManagementCard } from "../components/ManagementCard";
import { FamilyHistoryCard } from "../components/FamilyHistoryCard";
import { PhysicalExaminationCard } from "../components/PhysicalExaminationCard";
import { VitalsCard } from "../components/VitalsCard";
import { CaseBuilderSidebar } from "../components/CaseBuilderSidebar";
import UserHeader from '@/components/user-header';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DEPARTMENTS } from "../utils/constants";

interface PageProps {
    params: Promise<{
        caseId: string;
    }>;
}

export default function CaseBuilderPage({ params }: PageProps) {
    const { caseId } = use(params);

    // Hooks
    const { isLoading, isError } = usePatientCase(caseId);
    useAutosave(caseId);

    const { isSaving, data, updateTitle, updatePatientInfo } = usePatientCaseStore();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <LoadingSpinner text='Loading Case...' />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <h2 className="text-destructive font-bold text-lg mb-2">Error Loading Case</h2>
                    <Link href="/case-builder" className="text-blue-500 hover:underline">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <UserHeader text="Case Builder" />
            <div className="flex-1 max-w-[1400px] mx-auto w-full p-6 md:p-6 space-y-8">
                <div className="flex items-center gap-2">
                    <Link
                        href="/case-builder"
                        className="p-2 hover:bg-muted rounded-lg transition-colors group flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        Back to cases
                    </Link>
                </div>
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 z-[40] pb-6 border-b border-border transition-all duration-300">

                    <div className="flex items-center gap-4 flex-1">
                        <div className="flex-1 max-w-2xl group/title relative">
                            <div className="flex items-center gap-2">
                                <input
                                    value={data.title || ""}
                                    onChange={(e) => updateTitle(e.target.value)}
                                    className="bg-transparent border-none text-2xl md:text-3xl font-semibold text-foreground leading-tight focus:ring-0 w-full py-5 h-auto outline-none hover:bg-muted/50 rounded px-1 transition-colors pr-10"
                                    placeholder="Enter Case Title..."
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/10 transition-all ml-[-32px] z-10"
                                    onClick={() => {
                                        const newTitle = generateClinicalTitle(data);
                                        updateTitle(newTitle);
                                    }}
                                    title="Auto-generate clinical title"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-muted-foreground/50 text-[10px] font-mono bg-muted px-2 py-0.5 rounded border border-border/50">
                                    ID: {caseId.slice(0, 8)}
                                </span>
                                <span className="text-muted-foreground/30 text-xs">•</span>
                                <Select
                                    value={data.patientInfo.department || ""}
                                    onValueChange={(val) => updatePatientInfo({ department: val })}
                                >
                                    <SelectTrigger className="h-6 w-auto min-w-[120px] bg-muted/50 border-border/50 text-[10px] font-bold uppercase tracking-wider text-primary py-0 px-2 rounded">
                                        <SelectValue placeholder="SET DEPARTMENT" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEPARTMENTS.map(dept => (
                                            <SelectItem key={dept} value={dept} className="text-xs">
                                                {dept}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <span className="text-muted-foreground/30 text-xs">•</span>
                                <span className="text-primary text-[10px] uppercase tracking-wider font-bold">
                                    {data.status || 'Draft'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href={`/case-builder/${caseId}/summary`}>
                            <Button variant="outline" size="sm" className="gap-2 rounded-xl h-9 border-primary/20 hover:border-primary/50 text-primary hover:bg-primary/5">
                                <BookOpen className="w-4 h-4" />
                                <span className="hidden sm:inline">View Summary</span>
                            </Button>
                        </Link>
                        <div className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-500",
                            isSaving
                                ? "bg-primary/5 border-primary/20 text-primary shadow-sm shadow-primary/5"
                                : "bg-card border-border text-muted-foreground"
                        )}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                                    <span className="text-xs font-semibold animate-pulse tracking-wide">Autosaving...</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-xs font-semibold tracking-wide">Sync Complete</span>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* Sticky Adaptive Sidebar */}
                    <CaseBuilderSidebar />

                    {/* Main Content Stream */}
                    <div className="flex-1 w-full max-w-4xl mx-auto space-y-12">

                        {/* Chapter 1: Presentation */}
                        <section id="presentation" className="space-y-6 scroll-mt-32">
                            <div className="flex items-center gap-3 mb-2 px-1">
                                {/* <User className="w-3.5 h-3.5 text-muted-foreground/60" /> */}
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Initial Presentation
                                </h2>
                                <div className="h-px bg-border/60 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <PatientInfoCard />
                                <ChiefComplaintsCard />
                            </div>
                        </section>

                        {/* Chapter 2: History */}
                        <section id="history" className="space-y-6 scroll-mt-32">
                            <div className="flex items-center gap-3 mb-2 px-1">
                                {/* <ClipboardList className="w-3.5 h-3.5 text-muted-foreground/60" /> */}
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    History & Background
                                </h2>
                                <div className="h-px bg-border/60 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <PositiveFindingsCard />
                                <PersonalHistoryCard />
                                <MedicationsCard />
                                <AllergiesCard />
                                <FamilyHistoryCard />
                            </div>
                        </section>

                        {/* Chapter 3: Examination */}
                        <section id="examination" className="space-y-6 scroll-mt-32">
                            <div className="flex items-center gap-3 mb-2 px-1">
                                {/* <Activity className="w-3.5 h-3.5 text-muted-foreground/60" /> */}
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Clinical Examination
                                </h2>
                                <div className="h-px bg-border/60 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <VitalsCard />
                                <PhysicalExaminationCard />
                            </div>
                        </section>

                        {/* Chapter 4: Workup */}
                        <section id="workup" className="space-y-6 scroll-mt-32">
                            <div className="flex items-center gap-3 mb-2 px-1">
                                {/* <Microscope className="w-3.5 h-3.5 text-muted-foreground/60" /> */}
                                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Workup & Plan
                                </h2>
                                <div className="h-px bg-border/60 flex-1" />
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                <InvestigationsCard />
                                <ImagingCard />
                                <DiagnosisCard />
                                <ManagementCard />
                            </div>
                        </section>

                        <div className="pb-12 text-center">
                            <div className="h-px bg-border/40 mb-8" />
                            <p className="text-muted-foreground/20 text-[9px] font-bold tracking-[0.4em] uppercase">
                                Clinical Formulation Complete
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
