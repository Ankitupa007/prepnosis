"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AllergiesCard() {
    const { data, addAllergy, updateAllergy, removeAllergy } = usePatientCaseStore();
    const allergies = data.allergies;

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Allergies
                    </CardTitle>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={addAllergy}
                    className="h-7 px-2 text-primary hover:bg-primary/5 font-bold uppercase tracking-tighter text-[10px]"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {allergies.length === 0 && (
                    <div className="text-sm text-muted-foreground/40 italic p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                        No known allergies.
                    </div>
                )}

                {allergies.map((allergy) => (
                    <div key={allergy.id} className="bg-card p-3 rounded-lg border border-border/50 shadow-sm space-y-2">
                        <div className="grid grid-cols-12 gap-2 items-center">
                            {/* Allergen - Col 7 */}
                            <div className="col-span-12 md:col-span-7">
                                <Input
                                    placeholder="Allergen (e.g. Penicillin)"
                                    value={allergy.allergen}
                                    onChange={(e) => updateAllergy(allergy.id, { allergen: e.target.value })}
                                    className="h-8 text-sm font-medium border-border bg-background focus-visible:ring-red-400"
                                />
                            </div>

                            {/* Severity - Col 4 */}
                            <div className="col-span-10 md:col-span-4">
                                <Select value={allergy.severity || "mild"} onValueChange={(val: any) => updateAllergy(allergy.id, { severity: val })}>
                                    <SelectTrigger className={cn("h-8 text-xs border-border bg-background",
                                        allergy.severity === 'severe' && "text-red-600 font-bold",
                                        allergy.severity === 'moderate' && "text-orange-600"
                                    )}>
                                        <SelectValue placeholder="Severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mild">Mild</SelectItem>
                                        <SelectItem value="moderate">Moderate</SelectItem>
                                        <SelectItem value="severe">Severe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Delete - Col 1 */}
                            <div className="col-span-2 md:col-span-1 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeAllergy(allergy.id)}
                                    className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Reaction & Notes Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1 border-l-2 border-red-500/20 ml-1">
                            <Input
                                placeholder="Reaction (e.g. Rash, Anaphylaxis)"
                                value={allergy.reaction || ""}
                                onChange={(e) => updateAllergy(allergy.id, { reaction: e.target.value })}
                                className="h-7 text-[11px] border-none bg-muted/30 placeholder:text-muted-foreground/30 focus-visible:ring-0 shadow-none text-foreground"
                            />
                            <Input
                                placeholder="Clinical context / Notes..."
                                value={allergy.notes || ""}
                                onChange={(e) => updateAllergy(allergy.id, { notes: e.target.value })}
                                className="h-7 text-[11px] border-none bg-muted/30 placeholder:text-muted-foreground/30 focus-visible:ring-0 shadow-none text-foreground"
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
