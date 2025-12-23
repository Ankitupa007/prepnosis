"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePatientCaseStore } from '../store/patientCase.store';
import { Search, Eye, User, Waves, Activity, Brain, Bone, ArrowRight } from "lucide-react";

export function PhysicalExaminationCard() {
    const { data, updatePhysicalExamination } = usePatientCaseStore();
    const exam = data.physicalExamination || { systemicExam: [] };

    const updateSystem = (system: string, findings: string) => {
        const current = [...(exam.systemicExam || [])];
        const idx = current.findIndex(s => s.system === system);
        if (idx >= 0) {
            current[idx] = { ...current[idx], findings };
        } else {
            current.push({ system, findings });
        }
        updatePhysicalExamination({ systemicExam: current });
    };

    const getFindings = (system: string) => {
        return exam.systemicExam?.find(s => s.system === system)?.findings || "";
    };

    const systems = [
        { name: "CVS", icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10" },
        { name: "RS", icon: Waves, color: "text-blue-500", bg: "bg-blue-500/10" },
        { name: "GIT", icon: Search, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { name: "CNS", icon: Brain, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Physical Examination
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6 text-foreground">
                {/* General Appearance */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 pl-1">
                        <User className="w-3.5 h-3.5 text-muted-foreground/40" />
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">General Appearance</Label>
                    </div>
                    <Textarea
                        value={exam.generalAppearance || ""}
                        onChange={(e) => updatePhysicalExamination({ generalAppearance: e.target.value })}
                        className="min-h-[80px] bg-background border-border focus:border-blue-400 focus:ring-blue-400/10 rounded-xl transition-all resize-none text-sm"
                        placeholder="Conscious, oriented, pallor, icterus, edema..."
                    />
                </div>

                {/* Systemic Exam Grid */}
                <div className="space-y-3">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Systemic Examination</Label>
                    <div className="grid grid-cols-1 gap-3">
                        {systems.map((s) => (
                            <div key={s.name} className="flex gap-3 group/sys">
                                <div className={cn(
                                    "flex flex-col items-center justify-center w-12 rounded-xl border border-border shadow-sm shrink-0 group-hover/sys:border-blue-200 transition-colors",
                                    s.bg
                                )}>
                                    <s.icon className={cn("w-5 h-5", s.color)} />
                                    <span className="text-[9px] font-black mt-1 text-muted-foreground/60">{s.name}</span>
                                </div>
                                <Textarea
                                    value={getFindings(s.name)}
                                    onChange={(e) => updateSystem(s.name, e.target.value)}
                                    className="min-h-[60px] flex-1 bg-background border-border focus:border-blue-400 focus:ring-blue-400/10 rounded-xl transition-all resize-none text-xs py-2"
                                    placeholder={`Exam findings for ${s.name}...`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other/Notes */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Other Examination Notes</Label>
                    <Input
                        value={exam.notes || ""}
                        onChange={(e) => updatePhysicalExamination({ notes: e.target.value })}
                        className="h-9 bg-background border-border focus:border-blue-400 focus:ring-blue-400/10 rounded-xl transition-all text-xs"
                        placeholder="Local exam, MSK, skin, etc..."
                    />
                </div>
            </CardContent>
        </Card>
    );
}

import { cn } from '@/lib/utils'; import { Input } from '@/components/ui/input';

