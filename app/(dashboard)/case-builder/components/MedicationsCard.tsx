"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pill } from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function MedicationsCard() {
    const { data, addMedication, updateMedication, removeMedication } = usePatientCaseStore();
    const meds = data.medications;

    // New Drug State (only name needed to add, but we can allow full details)
    // For simplicity, we add empty rows or have a small form. Let's do a simple Add button that adds an empty row to be filled? 
    // Rationale: Faster to just click "Add" then type.
    // Actually, the store `addMedication` adds an empty ID/Name. Let's stick to that pattern or enhance it.
    // Store `addMedication` takes void and adds `{ id: uuid(), drugName: "" }`.
    // So we render the list and allow editing inline.

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Pill className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Medications
                    </CardTitle>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={addMedication}
                    className="h-7 px-2 text-primary hover:bg-primary/5 font-bold uppercase tracking-tighter text-[10px]"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {meds.length === 0 && (
                    <div className="text-sm text-muted-foreground/40 italic p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                        No medications recorded.
                    </div>
                )}

                {meds.map((med, index) => (
                    <div key={med.id} className="bg-card p-3 rounded-lg border border-border/50 shadow-sm space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* Drug Name - Col 5 */}
                            <div className="col-span-12 md:col-span-5">
                                <Input
                                    placeholder="Drug Name (e.g. Paracetamol)"
                                    value={med.drugName}
                                    onChange={(e) => updateMedication(med.id, { drugName: e.target.value })}
                                    className="h-8 text-sm font-medium border-border bg-background focus-visible:ring-blue-400"
                                />
                            </div>

                            {/* Dose/Unit/Freq - Col 6 */}
                            <div className="col-span-10 md:col-span-6 flex gap-1">
                                <Input
                                    placeholder="Dose"
                                    value={med.dose || ""}
                                    onChange={(e) => updateMedication(med.id, { dose: e.target.value })}
                                    className="h-8 w-16 text-xs border-border bg-background"
                                />
                                <Select value={med.unit || "mg"} onValueChange={(val) => updateMedication(med.id, { unit: val })}>
                                    <SelectTrigger className="h-8 w-16 text-[10px] border-border bg-background px-1">
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mg">mg</SelectItem>
                                        <SelectItem value="g">g</SelectItem>
                                        <SelectItem value="ml">ml</SelectItem>
                                        <SelectItem value="mcg">mcg</SelectItem>
                                        <SelectItem value="IU">IU</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={med.frequency || "BD"} onValueChange={(val) => updateMedication(med.id, { frequency: val })}>
                                    <SelectTrigger className="h-8 w-20 text-[10px] border-border bg-background px-1">
                                        <SelectValue placeholder="Freq" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OD">OD</SelectItem>
                                        <SelectItem value="BD">BD</SelectItem>
                                        <SelectItem value="TDS">TDS</SelectItem>
                                        <SelectItem value="QID">QID</SelectItem>
                                        <SelectItem value="SOS">SOS</SelectItem>
                                        <SelectItem value="HS">HS</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Dur"
                                    value={med.duration || ""}
                                    onChange={(e) => updateMedication(med.id, { duration: e.target.value })}
                                    className="h-8 w-14 text-xs border-border bg-background"
                                />
                            </div>

                            {/* Delete - Col 1 */}
                            <div className="col-span-2 md:col-span-1 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMedication(med.id)}
                                    className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Notes Row */}
                        <div className="relative pl-3 border-l-2 border-blue-500/20 ml-1">
                            <textarea
                                value={med.notes || ""}
                                onChange={(e) => {
                                    updateMedication(med.id, { notes: e.target.value });
                                    e.target.style.height = 'auto';
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                placeholder="Additional instructions (e.g. before food, side effects)..."
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
