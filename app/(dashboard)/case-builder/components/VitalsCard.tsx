"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientCaseStore } from '../store/patientCase.store';
import { Activity, Thermometer, Droplets, Wind, Scale, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

export function VitalsCard() {
    const { data, updateVitals } = usePatientCaseStore();
    const vitals = data.vitals || {};

    const handleChange = (field: string, value: string | number) => {
        updateVitals({ [field]: value });
    };

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Vitals & Anthropometry
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    {/* BP */}
                    <div className="col-span-2 space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Blood Pressure (mmHg)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Sys"
                                value={vitals.bpSystolic || ""}
                                onChange={(e) => handleChange("bpSystolic", e.target.value)}
                                className="h-10 bg-background border-border focus:border-rose-400 focus:ring-rose-400/10 rounded-xl transition-all"
                            />
                            <span className="text-muted-foreground/30 font-bold">/</span>
                            <Input
                                type="number"
                                placeholder="Dia"
                                value={vitals.bpDiastolic || ""}
                                onChange={(e) => handleChange("bpDiastolic", e.target.value)}
                                className="h-10 bg-background border-border focus:border-rose-400 focus:ring-rose-400/10 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Pulse & RR */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Pulse (bpm)</Label>
                        <div className="relative">
                            <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />
                            <Input
                                type="number"
                                value={vitals.pulse || ""}
                                onChange={(e) => handleChange("pulse", e.target.value)}
                                className="h-10 pl-9 bg-background border-border focus:border-rose-400 focus:ring-rose-400/10 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Resp rate</Label>
                        <div className="relative">
                            <Wind className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-400" />
                            <Input
                                type="number"
                                value={vitals.rr || ""}
                                onChange={(e) => handleChange("rr", e.target.value)}
                                className="h-10 pl-9 bg-background border-border focus:border-blue-400 focus:ring-blue-400/10 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Temp & SpO2 */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Temp</Label>
                        <div className="flex gap-1">
                            <div className="relative flex-1">
                                <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400" />
                                <Input
                                    type="number"
                                    value={vitals.temp || ""}
                                    onChange={(e) => handleChange("temp", e.target.value)}
                                    className="h-10 pl-9 bg-background border-border focus:border-orange-400 focus:ring-orange-400/10 rounded-xl transition-all"
                                />
                            </div>
                            <Select
                                value={vitals.tempUnit}
                                onValueChange={(v) => handleChange("tempUnit", v)}
                            >
                                <SelectTrigger className="w-[60px] h-10 rounded-xl border-border bg-background">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="F">°F</SelectItem>
                                    <SelectItem value="C">°C</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">SpO2 (%)</Label>
                        <div className="relative">
                            <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-400" />
                            <Input
                                type="number"
                                value={vitals.spo2 || ""}
                                onChange={(e) => handleChange("spo2", e.target.value)}
                                className="h-10 pl-9 bg-background border-border focus:border-cyan-400 focus:ring-cyan-400/10 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Height & Weight */}
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Weight (kg)</Label>
                        <div className="relative">
                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400" />
                            <Input
                                type="number"
                                value={vitals.weight || ""}
                                onChange={(e) => handleChange("weight", e.target.value)}
                                className="h-10 pl-9 bg-background border-border focus:border-emerald-400 focus:ring-emerald-400/10 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Height (cm)</Label>
                        <div className="relative">
                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-indigo-400" />
                            <Input
                                type="number"
                                value={vitals.height || ""}
                                onChange={(e) => handleChange("height", e.target.value)}
                                className="h-10 pl-9 bg-background border-border focus:border-indigo-400 focus:ring-indigo-400/10 rounded-xl transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Optional BMI auto-calc or just a field */}
                {vitals.weight && vitals.height && (
                    <div className="pt-2">
                        <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex justify-between items-center text-card-foreground">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Calculated BMI</span>
                            <span className="text-lg font-black text-primary">
                                {(vitals.weight / (Math.pow(vitals.height / 100, 2))).toFixed(1)}
                            </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
