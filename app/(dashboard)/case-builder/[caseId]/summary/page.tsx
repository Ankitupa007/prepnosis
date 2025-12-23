
"use client";

import React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ChevronLeft, Printer, FileText, Share2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePatientCase } from "../../hooks/usePatientCase";
import { usePatientCaseStore } from "../../store/patientCase.store";
import { generateMedicalNarrative } from "../../utils/medicalNarrative";
import UserHeader from '@/components/user-header';
import { cn } from '@/lib/utils';

export default function CaseSummaryPage({ params }: { params: Promise<{ caseId: string }> }) {
    const { caseId } = use(params);
    const { isError, isLoading } = usePatientCase(caseId);
    const { data } = usePatientCaseStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-muted-foreground">Failed to load case data.</p>
                <Link href="/case-builder">
                    <Button variant="outline">Back to Gallery</Button>
                </Link>
            </div>
        );
    }

    const narrative = generateMedicalNarrative(data);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100 selection:bg-primary/20">
            <UserHeader text="Clinical Summary" />

            <div className="max-w-3xl mx-auto px-6 py-12 pb-32">
                {/* Actions Header */}
                <div className="flex items-center justify-between mb-16 no-print">
                    <Link href={`/case-builder/${caseId}`}>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <ChevronLeft className="w-4 h-4" />
                            Back to Builder
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 rounded-xl">
                            <Printer className="w-4 h-4" />
                            Print Article
                        </Button>
                        <Button size="sm" className="gap-2 rounded-xl">
                            <Share2 className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Article Header */}
                <header className="mb-20 text-center space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10">
                            <BookOpen className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.4em]">Clinical Case Report</p>
                        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-balance">
                            {data.title || "Untitled Patient Case"}
                        </h1>
                    </div>
                    <div className="h-px w-24 bg-primary/20 mx-auto mt-8" />
                    <div className="pt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                        <span>Status: {data.status}</span>
                        <span>Formatted: {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                    </div>
                </header>

                {/* Article Content */}
                <article className="space-y-16 font-serif leading-relaxed">

                    {/* Clinical Introduction */}
                    <section className="space-y-6">
                        <h2 className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-primary/80 border-l-2 border-primary pl-4">
                            Introduction & Presentation
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-800 dark:text-zinc-200">
                            {narrative.intro}
                        </p>
                    </section>

                    {/* History of Present Illness */}
                    {narrative.hpi && (
                        <section className="space-y-4">
                            <h2 className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-muted-foreground pl-4 border-l-2 border-muted">
                                History of Presenting Illness
                            </h2>
                            <p className="text-base text-zinc-700 dark:text-zinc-300">
                                {narrative.hpi}
                            </p>
                        </section>
                    )}

                    {/* Clinical History */}
                    {narrative.history && (
                        <section className="space-y-4 bg-muted/20 p-8 rounded-3xl border border-border/50 font-sans">
                            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                                Past Medical & Social History
                            </h2>
                            <p className="text-sm italic text-muted-foreground leading-loose">
                                {narrative.history}
                            </p>
                        </section>
                    )}

                    {/* Physical Examination */}
                    <section className="space-y-4">
                        <h2 className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-muted-foreground pl-4 border-l-2 border-muted">
                            Clinical Examination & Vitals
                        </h2>
                        <p className="text-base text-zinc-700 dark:text-zinc-300">
                            {narrative.examination}
                        </p>
                    </section>

                    {/* Diagnostic Workup */}
                    {narrative.workup && (
                        <section className="space-y-4">
                            <h2 className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-muted-foreground pl-4 border-l-2 border-muted">
                                Laboratory & Imaging Analysis
                            </h2>
                            <p className="text-base text-zinc-700 dark:text-zinc-300">
                                {narrative.workup}
                            </p>
                        </section>
                    )}

                    {/* Assessment */}
                    <section className="space-y-8 pt-8 border-t border-border/50">
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-primary pl-4 border-l-2 border-primary">
                                Clinical Assessment
                            </h2>
                            <p className="text-base text-zinc-700 dark:text-zinc-300">
                                {narrative.assessment}
                            </p>
                        </div>

                        {/* Plan */}
                        <div className="space-y-4">
                            <h2 className="text-xs font-bold font-sans uppercase tracking-[0.2em] text-primary pl-4 border-l-2 border-primary">
                                Management & Therapeutic Strategy
                            </h2>
                            <p className="text-base text-zinc-700 dark:text-zinc-300">
                                {narrative.plan}
                            </p>
                        </div>
                    </section>

                </article>

                {/* Footer */}
                <footer className="mt-32 pt-16 border-t border-border/30 text-center space-y-6">
                    <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.5em]">
                        Formal Medical Record — Reference Only
                    </p>
                    <div className="flex justify-center gap-4 no-print">
                        <div className="w-2 h-2 rounded-full bg-primary/20" />
                        <div className="w-2 h-2 rounded-full bg-primary/20" />
                        <div className="w-2 h-2 rounded-full bg-primary/20" />
                    </div>
                </footer>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    body {
                        background-color: white !important;
                        color: black !important;
                    }
                    .bg-muted\\/20 {
                        background-color: #f4f4f5 !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}

