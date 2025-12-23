"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
    User,
    ClipboardList,
    Activity,
    Microscope,
    ChevronRight,
    CheckCircle2,
    Sparkles
} from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";

interface Chapter {
    id: string;
    title: string;
    icon: any;
    color: string;
}

const chapters: Chapter[] = [
    { id: "presentation", title: "Presentation", icon: User, color: "text-pink-500" },
    { id: "history", title: "History", icon: ClipboardList, color: "text-purple-500" },
    { id: "examination", title: "Examination", icon: Activity, color: "text-rose-500" },
    { id: "workup", title: "Workup", icon: Microscope, color: "text-cyan-500" },
];

export function CaseBuilderSidebar() {
    const { data } = usePatientCaseStore();
    const [activeChapter, setActiveChapter] = React.useState("presentation");

    // 1. Scroll Sync Logic
    React.useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the upper middle
            threshold: 0
        };

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveChapter(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, observerOptions);

        // Observe all sections
        chapters.forEach((chapter) => {
            const el = document.getElementById(chapter.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    // 2. Progress Calculation Logic
    const progress = React.useMemo(() => {
        let completedFields = 0;
        let totalWeight = 13; // 13 clinical categories

        if (data.patientInfo.age) completedFields++;
        if (data.chiefComplaints.length > 0) completedFields++;
        if (data.vitals.pulse || data.vitals.bpSystolic) completedFields++;
        if (data.positiveFindings.length > 0) completedFields++;
        if (data.personalHistory.length > 0) completedFields++;
        if (data.investigations.length > 0) completedFields++;
        if (data.medications.length > 0) completedFields++;
        if (data.allergies.length > 0) completedFields++;
        if (data.familyHistory.length > 0) completedFields++;
        if (data.physicalExamination.systemicExam.length > 0) completedFields++;
        if (data.imaging.length > 0) completedFields++;
        if (data.diagnosis.provisionalDiagnosis || data.diagnosis.finalDiagnosis) completedFields++;
        if (data.management.strategy) completedFields++;

        return Math.round((completedFields / totalWeight) * 100);
    }, [data]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
            setActiveChapter(id);
        }
    };

    return (
        <>
            {/* Desktop Side Navigation */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
                <nav className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 px-3">
                        Case Chapters
                    </p>
                    {chapters.map((chapter) => {
                        const Icon = chapter.icon;
                        const isActive = activeChapter === chapter.id;

                        return (
                            <button
                                key={chapter.id}
                                onClick={() => scrollToSection(chapter.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                )}
                            >
                                <div className={cn(
                                    "p-1.5 rounded-lg transition-colors",
                                    isActive ? "bg-primary/10" : "bg-transparent group-hover:bg-muted"
                                )}>
                                    <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground/60")} />
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold flex-1 text-left",
                                    isActive ? "text-primary text-[11px]" : "text-muted-foreground"
                                )}>{chapter.title}</span>
                                {isActive && (
                                    <div className="absolute left-0 w-0.5 h-4 bg-primary rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Progress Card */}
                <div className="mt-8 p-4 bg-muted/20 rounded-2xl border border-border flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">Case Completion</span>
                        <span className="text-[11px] font-bold text-primary">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-700 ease-in-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </aside>

            {/* Mobile Horizontal Navigation */}
            <div className="lg:hidden sticky top-0 z-[45] w-full bg-background/95 backdrop-blur-md border-b border-border/50  py-2 mb-4 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 snap-x snap-mandatory touch-pan-x scroll-smooth">
                    {chapters.map((chapter) => {
                        const Icon = chapter.icon;
                        const isActive = activeChapter === chapter.id;

                        return (
                            <button
                                key={chapter.id}
                                onClick={() => scrollToSection(chapter.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full whitespace-nowrap transition-all border snap-center outline-none",
                                    isActive
                                        ? "bg-primary/10 border-primary/20 text-primary"
                                        : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-primary" : "text-muted-foreground/60")} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{chapter.title}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
