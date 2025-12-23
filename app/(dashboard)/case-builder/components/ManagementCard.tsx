"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePatientCaseStore } from '../store/patientCase.store';
import { ClipboardList, Footprints, MessageSquareText, ShieldPlus } from "lucide-react";

export function ManagementCard() {
    const { data, updateManagement } = usePatientCaseStore();
    const management = data.management || {};

    const handleChange = (field: string, value: string) => {
        updateManagement({ [field]: value });
    };

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">Management Plan</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6 text-foreground">
                <div className="space-y-4">
                    {/* Strategy */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 pl-1">
                            <ShieldPlus className="w-3.5 h-3.5 text-emerald-500" />
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Clinical Strategy</Label>
                        </div>
                        <Textarea
                            value={management.strategy || ""}
                            onChange={(e) => handleChange("strategy", e.target.value)}
                            className="min-h-[100px] bg-background border-border focus:border-emerald-400 focus:ring-emerald-400/10 rounded-xl transition-all resize-none"
                            placeholder="Overall clinical approach and goals..."
                        />
                    </div>

                    {/* Nursing Care */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 pl-1">
                            <MessageSquareText className="w-3.5 h-3.5 text-blue-500" />
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nursing Care & Instructions</Label>
                        </div>
                        <Textarea
                            value={management.nursingCare || ""}
                            onChange={(e) => handleChange("nursingCare", e.target.value)}
                            className="min-h-[80px] bg-background border-border focus:border-blue-400 focus:ring-blue-400/10 rounded-xl transition-all resize-none text-sm"
                            placeholder="Specific nursing interventions..."
                        />
                    </div>

                    {/* Follow-up */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 pl-1">
                            <Footprints className="w-3.5 h-3.5 text-indigo-500" />
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Follow-up Plan</Label>
                        </div>
                        <Input
                            value={management.followUp || ""}
                            onChange={(e) => handleChange("followUp", e.target.value)}
                            className="h-10 bg-background border-border focus:border-indigo-400 focus:ring-indigo-400/10 rounded-xl transition-all"
                            placeholder="Monitoring and review schedule..."
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

import { Input } from '@/components/ui/input';
