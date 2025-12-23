"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePatientCaseStore } from '../store/patientCase.store';
import { Stethoscope, Plus, X, ListChecks, CheckCircle2 } from "lucide-react";

export function DiagnosisCard() {
    const { data, updateDiagnosis } = usePatientCaseStore();
    const diagnosis = data.diagnosis || { differentials: [] };
    const [newDiff, setNewDiff] = useState("");

    const addDifferential = () => {
        if (!newDiff.trim()) return;
        updateDiagnosis({
            differentials: [...(diagnosis.differentials || []), newDiff.trim()]
        });
        setNewDiff("");
    };

    const removeDifferential = (index: number) => {
        const next = [...(diagnosis.differentials || [])];
        next.splice(index, 1);
        updateDiagnosis({ differentials: next });
    };

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <Stethoscope className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">Diagnosis & Differentials</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6 text-foreground">
                {/* Differential Diagnosis */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Differential Diagnoses</Label>
                        <ListChecks className="w-3.5 h-3.5 text-muted-foreground/30" />
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-2">
                        {diagnosis.differentials?.map((diff, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-indigo-500/10 text-indigo-500 border-indigo-500/20 pr-1 hover:bg-indigo-500/20 transition-colors py-1 group/badge"
                            >
                                {diff}
                                <button
                                    onClick={() => removeDifferential(idx)}
                                    className="ml-1 p-0.5 hover:bg-indigo-500/20 rounded-full transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                        {(!diagnosis.differentials || diagnosis.differentials.length === 0) && (
                            <p className="text-[10px] text-muted-foreground/40 italic pl-1">No differentials added yet</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Add differential..."
                            value={newDiff}
                            onChange={(e) => setNewDiff(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addDifferential()}
                            className="h-10 bg-background border-border focus:border-indigo-400 focus:ring-indigo-400/10 rounded-xl transition-all"
                        />
                        <Button
                            onClick={addDifferential}
                            variant="secondary"
                            className="w-10 h-10 p-0 rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 shadow-none border-none"
                        >
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Provisional Diagnosis */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 pl-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Provisional Diagnosis</Label>
                        </div>
                        <Input
                            value={diagnosis.provisionalDiagnosis || ""}
                            onChange={(e) => updateDiagnosis({ provisionalDiagnosis: e.target.value })}
                            className="h-10 bg-background border-border focus:border-amber-400 focus:ring-amber-400/10 rounded-xl transition-all"
                            placeholder="Primary clinical impression..."
                        />
                    </div>

                    {/* Final Diagnosis */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 pl-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Final Diagnosis</Label>
                        </div>
                        <Input
                            value={diagnosis.finalDiagnosis || ""}
                            onChange={(e) => updateDiagnosis({ finalDiagnosis: e.target.value })}
                            className="h-10 bg-background border-border focus:border-emerald-400 focus:ring-emerald-400/10 rounded-xl transition-all"
                            placeholder="Confirmed diagnosis..."
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
