
"use client";
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Plus, FolderOpen, Calendar, Search, Filter, X, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCreateCase, useDeleteCase } from './hooks/usePatientCase';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import UserHeader from '@/components/user-header';
import { PatientInfo } from './types/patientCase';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { DEPARTMENTS } from './utils/constants';

export default function PatientHistoryDashboard() {
    const supabase = createClient();
    const router = useRouter();
    const { mutate: createCase, isPending: isCreating } = useCreateCase();
    const { mutate: deleteCase } = useDeleteCase();

    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [sexFilter, setSexFilter] = useState<string>("all");
    const [ageGroupFilter, setAgeGroupFilter] = useState<string>("all");
    const [departmentFilter, setDepartmentFilter] = useState<string>("all");

    const { data: cases, isLoading } = useQuery({
        queryKey: ['patient-cases-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('patient_cases')
                .select('id, title, updated_at, status, patient_info')
                .order('updated_at', { ascending: false });
            if (error) throw error;
            return data;
        }
    });

    const filteredCases = useMemo(() => {
        if (!cases) return [];
        return cases.filter(c => {
            const info = c.patient_info as unknown as PatientInfo;
            const matchesSearch = !searchQuery ||
                c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                info?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesSex = sexFilter === "all" || info?.sex === sexFilter;

            const matchesAgeGroup = ageGroupFilter === "all" || (() => {
                const age = info?.age || 0;
                const unit = info?.ageUnit || 'years';
                if (unit !== 'years') return ageGroupFilter === 'pediatric';
                if (age < 12) return ageGroupFilter === 'pediatric';
                if (age < 20) return ageGroupFilter === 'adolescent';
                if (age < 65) return ageGroupFilter === 'adult';
                return ageGroupFilter === 'geriatric';
            })();

            const matchesDepartment = departmentFilter === "all" || info?.department === departmentFilter;

            return matchesSearch && matchesSex && matchesAgeGroup && matchesDepartment;
        });
    }, [cases, searchQuery, sexFilter, ageGroupFilter, departmentFilter]);

    const handleCreate = () => {
        createCase("Untitled Case", {
            onSuccess: (data) => {
                router.push(`/case-builder/${data.id}`);
            }
        });
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSexFilter("all");
        setAgeGroupFilter("all");
        setDepartmentFilter("all");
    };

    const hasActiveFilters = searchQuery || sexFilter !== "all" || ageGroupFilter !== "all" || departmentFilter !== "all";

    return (
        <div className="flex flex-col min-h-screen">
            <UserHeader text="Case Builder Workspace" />

            <main className="flex-1 space-y-8 p-8 pt-6 container mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Clinical Case Builder</h1>
                        <p className="text-muted-foreground text-lg">Curate and manage your collection of patient cases.</p>
                    </div>
                    <Button onClick={handleCreate} disabled={isCreating} className="bg-primary hover:bg-primary/80 h-12 px-6 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 text-primary-foreground">
                        {isCreating ? "Initializing..." : <><Plus className="w-5 h-5 mr-2" /> Design New Case</>}
                    </Button>
                </div>

                {/* Filter Bar */}
                <div className="bg-card p-5 rounded-2xl shadow-sm border border-border mb-8 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by case title or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-11 bg-muted/50 border-border focus:bg-background transition-all text-base rounded-xl"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-muted-foreground hidden sm:inline">Filters:</span>
                                <Select value={sexFilter} onValueChange={setSexFilter}>
                                    <SelectTrigger className="w-[130px] h-11 rounded-xl bg-muted/50 border-border">
                                        <SelectValue placeholder="All Sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Sex</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                                    <SelectTrigger className="w-[150px] h-11 rounded-xl bg-muted/50 border-border">
                                        <SelectValue placeholder="All Ages" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ages</SelectItem>
                                        <SelectItem value="pediatric">Pediatric (&lt;12y)</SelectItem>
                                        <SelectItem value="adolescent">Adolescent (12-19y)</SelectItem>
                                        <SelectItem value="adult">Adult (20-64y)</SelectItem>
                                        <SelectItem value="geriatric">Geriatric (65y+)</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                    <SelectTrigger className="w-[180px] h-11 rounded-xl bg-muted/50 border-border">
                                        <SelectValue placeholder="All Departments" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {DEPARTMENTS.map(dept => (
                                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-slate-500 hover:text-red-500 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4 mr-1.5" /> Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {
                    isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
                            {
                                [1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-48 bg-card border border-border rounded-2xl animate-pulse shadow-sm" />
                                ))
                            }
                        </div>
                    ) : filteredCases.length === 0 ? (
                        <div className="text-center py-24 bg-card rounded-3xl border border-dashed border-border shadow-sm max-w-2xl mx-auto">
                            <div className="bg-muted/50 p-6 rounded-3xl inline-block mb-6">
                                <Filter className="w-10 h-10 text-muted-foreground/30" />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">No cases match your search</h3>
                            <p className="text-muted-foreground mt-2 mb-8 max-w-sm mx-auto">
                                Try adjusting your filters or search query to find what you're looking for.
                            </p>
                            <Button onClick={clearFilters} variant="outline" className="rounded-xl px-8 border-border h-12">
                                Reset Search
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredCases.map(c => {
                                const info = c.patient_info as unknown as PatientInfo;
                                return (
                                    <div key={c.id} className="group relative">
                                        <Link href={`/case-builder/${c.id}`} className="block h-full">
                                            <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <CardHeader className="pb-3 flex-1">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-[10px] uppercase tracking-wider font-bold">
                                                            {c.status || 'Draft'}
                                                        </Badge>
                                                        <span className="text-[10px] font-mono text-muted-foreground/60">#{c.id.slice(0, 6)}</span>
                                                    </div>
                                                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                        {c.title || "Untitled Simulation"}
                                                    </CardTitle>
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {info?.age !== undefined && (
                                                            <Badge variant="outline" className="text-xs font-medium border-border bg-muted/30">
                                                                {info.age}{info.ageUnit === 'years' ? 'y' : info.ageUnit?.charAt(0)}
                                                            </Badge>
                                                        )}
                                                        {info?.sex && (
                                                            <Badge variant="outline" className="text-xs font-medium border-border bg-muted/30 capitalize">
                                                                {info.sex}
                                                            </Badge>
                                                        )}
                                                        {info?.department && (
                                                            <Badge variant="secondary" className="text-[10px] font-bold border-none bg-primary/10 text-primary uppercase">
                                                                {info.department}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="px-6 py-0 pb-4">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {info?.tags?.slice(0, 3).map(tag => (
                                                            <span key={tag} className="text-[10px] px-3 py-1 bg-primary text-primary-foreground rounded-full border-none">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {(info?.tags?.length || 0) > 3 && (
                                                            <span className="text-[10px] text-muted-foreground/60 pl-1">
                                                                +{(info?.tags?.length || 0) - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardContent>

                                                <CardFooter className="pt-4 border-t border-border mt-auto text-[11px] text-muted-foreground flex items-center justify-between pb-4">
                                                    <div className="flex items-center gap-1.5 font-medium">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {c.updated_at ? formatDistanceToNow(new Date(c.updated_at), { addSuffix: true }) : 'just now'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                            <Plus className="w-3.5 h-3.5 transform group-hover:rotate-90 transition-transform" />
                                                        </div>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (confirm("Are you sure you want to delete this case?")) {
                                                    deleteCase(c.id);
                                                }
                                            }}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg z-10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )
                }
            </main >
        </div >
    );
}
