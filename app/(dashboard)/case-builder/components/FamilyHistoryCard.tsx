"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePatientCaseStore } from '../store/patientCase.store';
import { Users2, Plus, Trash2, HeartPulse } from "lucide-react";

export function FamilyHistoryCard() {
    const { data, addFamilyHistory, updateFamilyHistory, removeFamilyHistory } = usePatientCaseStore();
    const familyHistory = data.familyHistory || [];

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <Users2 className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Family History
                    </CardTitle>
                </div>
                <Button
                    onClick={addFamilyHistory}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-primary hover:bg-primary/5 font-bold uppercase tracking-tighter text-[10px]"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {familyHistory.length === 0 ? (
                    <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
                        <Users2 className="w-6 h-6 text-muted-foreground/30 mb-2" />
                        <p className="text-[10px] text-muted-foreground/50 font-medium italic">No family history recorded</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {familyHistory.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 bg-muted/10 border border-border rounded-2xl shadow-sm hover:border-rose-400/30 transition-all group/item"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Condition</Label>
                                            <Input
                                                value={item.condition}
                                                onChange={(e) => updateFamilyHistory(item.id, { condition: e.target.value })}
                                                className="h-9 bg-muted/30 border-none focus:ring-2 focus:ring-rose-400/20 rounded-lg mt-1 text-foreground placeholder:text-muted-foreground/30"
                                                placeholder="e.g. Type 2 Diabetes"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Relation</Label>
                                            <Input
                                                value={item.relation}
                                                onChange={(e) => updateFamilyHistory(item.id, { relation: e.target.value })}
                                                className="h-9 bg-muted/30 border-none focus:ring-2 focus:ring-rose-400/20 rounded-lg mt-1 text-foreground placeholder:text-muted-foreground/30"
                                                placeholder="e.g. Father"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFamilyHistory(item.id)}
                                            className="h-8 w-8 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-5"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Notes</Label>
                                        <Input
                                            value={item.notes || ""}
                                            onChange={(e) => updateFamilyHistory(item.id, { notes: e.target.value })}
                                            className="h-8 bg-muted/30 border-none focus:ring-2 focus:ring-rose-400/20 rounded-lg mt-1 text-xs text-foreground placeholder:text-muted-foreground/30"
                                            placeholder="Further details..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
