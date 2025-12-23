"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Microscope } from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";

export function InvestigationsCard() {
    const { data, addInvestigation, updateInvestigation, removeInvestigation } = usePatientCaseStore();
    const investigations = data.investigations;

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Microscope className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Investigations
                    </CardTitle>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={addInvestigation}
                    className="h-7 px-2 text-primary hover:bg-primary/5 font-bold uppercase tracking-tighter text-[10px]"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {investigations.length === 0 && (
                    <div className="text-sm text-muted-foreground/40 italic p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                        No investigations added.
                    </div>
                )}

                {investigations.map((inv) => (
                    <div key={inv.id} className="bg-card p-3 rounded-lg border border-border/50 shadow-sm space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* Parameter - Col 5 */}
                            <div className="col-span-12 md:col-span-5">
                                <Input
                                    placeholder="Parameter (e.g. Hemoglobin)"
                                    value={inv.parameter}
                                    onChange={(e) => updateInvestigation(inv.id, { parameter: e.target.value })}
                                    className="h-8 text-sm font-medium border-border bg-background focus-visible:ring-cyan-400"
                                />
                            </div>

                            {/* Value - Col 3 */}
                            <div className="col-span-5 md:col-span-3">
                                <Input
                                    placeholder="Value (12.5)"
                                    value={inv.value || ""}
                                    onChange={(e) => updateInvestigation(inv.id, { value: e.target.value })}
                                    className="h-8 text-sm border-border bg-background"
                                />
                            </div>

                            {/* Unit - Col 3 */}
                            <div className="col-span-5 md:col-span-3">
                                <Input
                                    placeholder="Unit (g/dL)"
                                    value={inv.unit || ""}
                                    onChange={(e) => updateInvestigation(inv.id, { unit: e.target.value })}
                                    className="h-8 text-sm border-border bg-background"
                                />
                            </div>

                            {/* Delete - Col 1 */}
                            <div className="col-span-2 md:col-span-1 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeInvestigation(inv.id)}
                                    className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Notes Row */}
                        <div className="relative pl-3 border-l-2 border-border/50 ml-1">
                            <textarea
                                value={inv.notes || ""}
                                onChange={(e) => {
                                    updateInvestigation(inv.id, { notes: e.target.value });
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder="Lab findings/comments..."
                                className="w-full text-[11px] text-muted-foreground bg-transparent border-none p-1 focus:ring-0 outline-none resize-none min-h-[20px]"
                                rows={1}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
