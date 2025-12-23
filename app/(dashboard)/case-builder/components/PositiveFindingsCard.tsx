"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Search, CheckCircle2 } from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function PositiveFindingsCard() {
    const { data, addPositiveFinding, updatePositiveFinding, removePositiveFinding } = usePatientCaseStore();
    const findings = data.positiveFindings;

    const [newFinding, setNewFinding] = useState("");
    const [category, setCategory] = useState("General");

    const handleAdd = () => {
        if (!newFinding.trim()) return;
        addPositiveFinding(newFinding.trim(), category);
        setNewFinding("");
    };

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Positive Findings
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Input Area */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Add clinical finding (e.g. Pallor, Clubbing)..."
                        value={newFinding}
                        onChange={(e) => setNewFinding(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        className="bg-background border-border focus-visible:ring-emerald-400"
                    />
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="w-[140px] bg-background border-border">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="General">General</SelectItem>
                            <SelectItem value="CVS">CVS</SelectItem>
                            <SelectItem value="RS">RS</SelectItem>
                            <SelectItem value="PA">Abdomen</SelectItem>
                            <SelectItem value="CNS">CNS</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={handleAdd}
                        size="icon"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* Findings List */}
                <div className="space-y-3">
                    {findings.length === 0 && (
                        <div className="text-sm text-muted-foreground/40 italic p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                            No findings recorded.
                        </div>
                    )}

                    {findings.map((finding) => (
                        <div key={finding.id} className="group bg-card border border-border/50 rounded-lg p-3 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none px-2 py-0 h-5 text-[10px] font-bold uppercase tracking-wider shadow-none">
                                            {finding.category || "General"}
                                        </Badge>
                                        <input
                                            value={finding.finding}
                                            onChange={(e) => updatePositiveFinding(finding.id, { finding: e.target.value })}
                                            className="font-medium text-foreground bg-transparent border-none p-0 focus:ring-0 outline-none flex-1"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePositiveFinding(finding.id)}
                                            className="h-7 w-7 text-emerald-500/30 hover:text-emerald-500 hover:bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                    <div className="relative pl-3 border-l-2 border-border/50">
                                        <textarea
                                            value={finding.notes || ""}
                                            onChange={(e) => {
                                                updatePositiveFinding(finding.id, { notes: e.target.value });
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            placeholder="Clinical details..."
                                            className="w-full text-xs text-muted-foreground bg-transparent border-none p-0 focus:ring-0 outline-none resize-none min-h-[20px]"
                                            rows={1}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
