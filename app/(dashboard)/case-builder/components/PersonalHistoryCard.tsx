"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, History } from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function PersonalHistoryCard() {
    const { data, addPersonalHistory, removePersonalHistory } = usePatientCaseStore();
    const history = data.personalHistory;

    const [category, setCategory] = useState("Habits");
    const [value, setValue] = useState("");
    const [duration, setDuration] = useState("");

    const handleAdd = () => {
        if (!value.trim()) return;
        addPersonalHistory({ category, value, duration });
        setValue("");
        setDuration("");
    };

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4">
                <div className="flex items-center gap-2.5">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Personal History
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Input Row */}
                <div className="flex flex-col md:flex-row gap-2 items-start md:items-end bg-card p-3 rounded-lg border border-border/50 shadow-sm">
                    <div className="w-full md:w-1/3 space-y-1">
                        <label className="text-xs text-orange-500 font-medium">Category</label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Habits">Habits</SelectItem>
                                <SelectItem value="Diet">Diet</SelectItem>
                                <SelectItem value="Sleep">Sleep</SelectItem>
                                <SelectItem value="Appetite">Appetite</SelectItem>
                                <SelectItem value="Bowel/Bladder">Bowel/Bladder</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="w-full md:w-1/3 space-y-1">
                        <label className="text-xs text-orange-500 font-medium">Value/Description</label>
                        <Input
                            placeholder="e.g. Smoker, Vegetarian"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="bg-background border-border"
                        />
                    </div>

                    <div className="w-full md:w-1/3 space-y-1">
                        <label className="text-xs text-orange-500 font-medium">Duration/Notes</label>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g. 10 years"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                className="bg-background border-border"
                            />
                            <Button onClick={handleAdd} size="icon" className="bg-orange-500 hover:bg-orange-600 shrink-0">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3">
                    {history.length === 0 && (
                        <div className="text-sm text-muted-foreground/40 italic p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                            No personal history recorded.
                        </div>
                    )}

                    {history.map((item) => (
                        <div key={item.id} className="group bg-card border border-border/50 rounded-lg p-3 shadow-sm transition-all hover:shadow-md space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-none px-1.5 py-0.5 rounded capitalize text-[10px] font-bold shadow-none">
                                        {item.category}
                                    </Badge>
                                    <span className="font-medium text-foreground">{item.value}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePersonalHistory(item.id)}
                                    className="text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                            {(item.duration || item.notes) && (
                                <div className="relative pl-3 border-l-2 border-border/50 ml-1">
                                    <p className="text-xs text-muted-foreground">
                                        {item.duration} {item.notes && <span className="text-muted-foreground/30 mx-1">•</span>} {item.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
