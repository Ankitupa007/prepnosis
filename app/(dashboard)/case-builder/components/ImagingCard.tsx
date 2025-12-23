"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { usePatientCaseStore } from '../store/patientCase.store';
import { Image as ImageIcon, Plus, Trash2, Link as LinkIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImagingCard() {
    const { data, addImaging, updateImaging, removeImaging } = usePatientCaseStore();
    const imaging = data.imaging || [];

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <Camera className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">Imaging Studies</CardTitle>
                    </div>
                    <Button
                        onClick={addImaging}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-primary hover:bg-primary/5 font-bold uppercase tracking-tighter text-[10px]"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
                {imaging.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground/50 font-medium">No imaging records added</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {imaging.map((img) => (
                            <div
                                key={img.id}
                                className="p-4 bg-muted/10 border border-border rounded-2xl shadow-sm hover:border-cyan-400/30 transition-all group/item overflow-hidden"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Study Title</Label>
                                            <Input
                                                value={img.title || ""}
                                                onChange={(e) => updateImaging(img.id, { title: e.target.value })}
                                                className="h-9 bg-muted/30 border-none focus:ring-2 focus:ring-cyan-400/20 rounded-lg mt-1"
                                                placeholder="e.g. Chest X-Ray PA View"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeImaging(img.id)}
                                            className="h-8 w-8 p-0 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-5"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Modality</Label>
                                            <Input
                                                value={img.modality || ""}
                                                onChange={(e) => updateImaging(img.id, { modality: e.target.value })}
                                                className="h-9 bg-muted/30 border-none focus:ring-2 focus:ring-cyan-400/20 rounded-lg mt-1 placeholder:text-muted-foreground/30"
                                                placeholder="MRI, CT, etc."
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">View</Label>
                                            <Input
                                                value={img.view || ""}
                                                onChange={(e) => updateImaging(img.id, { view: e.target.value })}
                                                className="h-9 bg-muted/30 border-none focus:ring-2 focus:ring-cyan-400/20 rounded-lg mt-1 placeholder:text-muted-foreground/30"
                                                placeholder="PA, Lateral..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Findings / Report Summary</Label>
                                        <Textarea
                                            value={img.findings || ""}
                                            onChange={(e) => updateImaging(img.id, { findings: e.target.value })}
                                            className="min-h-[60px] bg-muted/30 border-none focus:ring-2 focus:ring-cyan-400/20 rounded-lg mt-1 text-sm resize-none placeholder:text-muted-foreground/30"
                                            placeholder="Key finding descriptors..."
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Image URL (Optional)</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="p-2 bg-muted/50 rounded-lg">
                                                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground/40" />
                                            </div>
                                            <Input
                                                value={img.url || ""}
                                                onChange={(e) => updateImaging(img.id, { url: e.target.value })}
                                                className="h-9 bg-muted/30 border-none focus:ring-2 focus:ring-cyan-400/20 rounded-lg flex-1 text-foreground placeholder:text-muted-foreground/30"
                                                placeholder="https://..."
                                            />
                                        </div>
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
