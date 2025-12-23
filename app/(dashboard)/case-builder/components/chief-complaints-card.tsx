"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Plus, ClipboardList } from "lucide-react";
import { usePatientCaseStore } from "../store/patientCase.store";
import { cn } from "@/lib/utils";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChiefComplaint } from "../types/patientCase";

interface SortableItemProps {
    complaint: ChiefComplaint;
    updateChiefComplaint: (id: string, updates: Partial<ChiefComplaint>) => void;
    removeChiefComplaint: (id: string) => void;
}

function SortableComplaintItem({ complaint, updateChiefComplaint, removeChiefComplaint }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: complaint.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative bg-card border border-purple-500/10 rounded-lg p-3 shadow-sm transition-all hover:shadow-md",
                isDragging && "opacity-50 border-purple-400 shadow-lg"
            )}
        >
            <div className="flex items-start gap-2">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-2 text-purple-500/30 cursor-grab active:cursor-grabbing hover:text-purple-500 transition-colors"
                >
                    <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                        {/* Symptom Name */}

                        <div className="col-span-1 md:col-span-4">
                            <div className="">
                                <Input
                                    placeholder="Symptom (e.g. Fever)"
                                    value={complaint.symptom}
                                    onChange={(e) => updateChiefComplaint(complaint.id, { symptom: e.target.value })}
                                    className="border-border bg-background focus-visible:ring-purple-400 font-medium h-9"
                                />
                            </div>
                        </div>

                        {/* Duration Section */}
                        <div className="col-span-1 md:col-span-4 flex items-center gap-2">
                            <div className="h-px bg-border flex-1 hidden md:block"></div>
                            <Input
                                type="number"
                                className="w-16 text-center border-border bg-background h-9"
                                placeholder="00"
                                value={complaint.duration || ""}
                                onChange={(e) => updateChiefComplaint(complaint.id, { duration: Number(e.target.value) })}
                            />
                            <Select
                                value={complaint.durationUnit}
                                onValueChange={(val: any) => updateChiefComplaint(complaint.id, { durationUnit: val })}
                            >
                                <SelectTrigger className="w-24 border-border bg-background h-9">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hours">Hours</SelectItem>
                                    <SelectItem value="days">Days</SelectItem>
                                    <SelectItem value="weeks">Weeks</SelectItem>
                                    <SelectItem value="months">Months</SelectItem>
                                    <SelectItem value="years">Years</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Actions */}
                        <div className="col-span-4 flex justify-end gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeChiefComplaint(complaint.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>


                    </div>
                    {/* Notes / Descriptors Line */}
                    <div className="mt-1 px-1 w-full relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-purple-500/30 rounded-full" />
                        <textarea
                            className="text-xs w-full min-h-[40px] border-none bg-transparent placeholder:text-muted-foreground/30 text-foreground p-2 pl-3 shadow-none focus-visible:ring-0 focus:outline-none resize-none overflow-hidden transition-all hover:bg-muted/30 rounded"
                            placeholder="Add clinical descriptors (character, radiation, severity)..."
                            value={complaint.notes || ""}
                            onChange={(e) => {
                                updateChiefComplaint(complaint.id, { notes: e.target.value });
                                e.target.style.height = 'auto';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            rows={1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChiefComplaintsCard() {
    const {
        data,
        addChiefComplaint,
        updateChiefComplaint,
        removeChiefComplaint,
        reorderChiefComplaints
    } = usePatientCaseStore();

    const complaints = data.chiefComplaints;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = complaints.findIndex((c) => c.id === active.id);
            const newIndex = complaints.findIndex((c) => c.id === over.id);

            const newOrder = arrayMove(complaints, oldIndex, newIndex);
            reorderChiefComplaints(newOrder);
        }
    }

    return (
        <Card className="overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-muted/30 border-b border-border py-3 px-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <ClipboardList className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                        Chief Complaints
                    </CardTitle>
                </div>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={addChiefComplaint}
                    className="h-7 px-2 text-primary hover:bg-primary/5 font-bold uppercase tracking-tighter text-[10px]"
                >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
                {complaints.length === 0 && (
                    <div className="text-sm text-muted-foreground/40 italic p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
                        No complaints added yet.
                    </div>
                )}

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={complaints.map(c => c.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {complaints.map((complaint) => (
                                <SortableComplaintItem
                                    key={complaint.id}
                                    complaint={complaint}
                                    updateChiefComplaint={updateChiefComplaint}
                                    removeChiefComplaint={removeChiefComplaint}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Quick Add Placeholder at bottom */}
                <Button
                    variant="ghost"
                    onClick={addChiefComplaint}
                    className="w-full h-11 border-2 border-dashed border-purple-500/20 text-purple-500/40 hover:text-purple-500 hover:border-purple-500/40 hover:bg-purple-500/5 rounded-lg flex items-center justify-center gap-2 transition-all mt-2 shadow-none"
                >
                    <Plus className="w-4 h-4" /> Add Another Complaint
                </Button>
            </CardContent>
        </Card>
    );
}
