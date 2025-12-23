
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Plus, User } from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";
import { DEPARTMENTS } from "../utils/constants";

export function PatientInfoCard() {
    const { data, updatePatientInfo } = usePatientCaseStore();
    const info = data.patientInfo;

    const [newTag, setNewTag] = React.useState("");

    const handleAddTag = () => {
        if (!newTag.trim()) return;
        updatePatientInfo({ tags: [...info.tags, newTag.trim()] });
        setNewTag("");
    };

    const removeTag = (tagToRemove: string) => {
        updatePatientInfo({ tags: info.tags.filter(t => t !== tagToRemove) });
    };

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Patient Information
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Demographics Row */}
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-1 w-32">
                        <Label className="text-xs text-muted-foreground">Age</Label>
                        <div className="flex gap-1">
                            <input
                                type="number"
                                value={info.age || ""}
                                onChange={(e) => updatePatientInfo({ age: Number(e.target.value) })}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="48"
                            />
                        </div>
                    </div>

                    <div className="space-y-1 w-32">
                        <Label className="text-xs text-muted-foreground"></Label> {/* Spacer or Unit */}
                        <Select
                            value={info.ageUnit}
                            onValueChange={(val: any) => updatePatientInfo({ ageUnit: val })}
                        >
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="years">Years</SelectItem>
                                <SelectItem value="months">Months</SelectItem>
                                <SelectItem value="days">Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 w-40">
                        <Label className="text-xs text-muted-foreground">Sex</Label>
                        <Select
                            value={info.sex}
                            onValueChange={(val: any) => updatePatientInfo({ sex: val })}
                        >
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 w-48">
                        <Label className="text-xs text-muted-foreground">Department</Label>
                        <Select
                            value={info.department}
                            onValueChange={(val: any) => updatePatientInfo({ department: val })}
                        >
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEPARTMENTS.map(dept => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {!info.age && !info.sex && (
                        <div className="text-4xl font-bold text-primary select-none ml-auto">
                            48/F
                        </div>
                    )}
                    {(info.age || info.sex) && (
                        <div className="text-4xl font-bold text-primary ml-auto transition-all">
                            {info.age || "?"}/{info.sex ? info.sex[0].toUpperCase() : "?"}
                        </div>
                    )}
                </div>

                {/* Tags / Demographics */}
                <div className="pt-2">
                    <Label className="text-xs text-muted-foreground mb-4 block">Demographics & Tags</Label>
                    <div className="flex flex-wrap gap-2 py-2 items-center">

                        {/* Example Quick Toggles or from Data? For now just Tags */}
                        {info.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-pink-500/10 py-1 px-4 hover:bg-pink-500/20 text-pink-500 border-none pr-1 flex items-center gap-1 rounded-full shadow-none">
                                {tag}
                                <button onClick={() => removeTag(tag)} className="rounded-full block hover:bg-pink-500/20 p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </Badge>
                        ))}

                        <div className="flex items-center gap-1">
                            <Input
                                placeholder="Add tag (e.g. Low SES)"
                                className="w-48 h-8 rounded-full text-sm bg-background border-border"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                            />
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleAddTag}>
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
