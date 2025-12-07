"use client";

import { useState } from "react";
import { Heart, Upload, Info, ExternalLink, Eye, EyeOff, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Mock Data
const FEATURED_ART = {
    id: "art-001",
    imageUrl: "https://images.unsplash.com/photo-1763668193311-0ba17bdea952?q=80&w=750&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Anatomy of a Dream",
    artistName: "Dr. Sarah Jenkins",
    artistCollege: "AIIMS, New Delhi",
    artistNote: "I sketched this during my first year anatomy dissecting hall sessions. It represents the complexity and beauty of the human heart, not just as an organ, but as the center of our emotions and life.",
    likes: 124,
};

export default function AuthArtShowcase() {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(FEATURED_ART.likes);
    const [isUIVisible, setIsUIVisible] = useState(true);

    const handleLike = () => {
        if (isLiked) {
            setLikes(prev => prev - 1);
        } else {
            setLikes(prev => prev + 1);
        }
        setIsLiked(!isLiked);
    };

    return (
        <div className="relative h-screen w-full overflow-hidden bg-zinc-950 group">
            {/* Artwork */}
            <div className="absolute inset-0">
                <img
                    src={FEATURED_ART.imageUrl}
                    alt={FEATURED_ART.title}
                    className="h-full w-full object-cover transition-transform duration-[300ms] hover:scale-105"
                />
            </div>

            {/* Visibility Toggle - Always accessible */}
            <div className="absolute top-6 right-6 z-50">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm rounded-full transition-all"
                                onClick={() => setIsUIVisible(!isUIVisible)}
                            >
                                {isUIVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>{isUIVisible ? "Hide details" : "Show details"}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <AnimatePresence>
                {isUIVisible && (
                    <>
                        {/* Gradient Overlay - Only visible when UI is visible */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"
                        />

                        {/* Top Badge */}
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="absolute top-6 left-6 z-10"
                        >
                            <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md px-3 py-1 shadow-lg">
                                Featured Art
                            </Badge>
                        </motion.div>

                        {/* Bottom Content */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute bottom-0 left-0 right-0 p-8 z-10"
                        >
                            <div className="flex items-end justify-between gap-6">
                                {/* Artist Info */}
                                <div className="flex-1 space-y-2">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">
                                            {FEATURED_ART.title}
                                        </h2>
                                        <div className="flex items-center gap-2 text-white/90 mt-1">
                                            <span className="font-semibold text-lg">{FEATURED_ART.artistName}</span>
                                            <span className="text-white/50">•</span>
                                            <span className="text-white/70">{FEATURED_ART.artistCollege}</span>
                                        </div>
                                    </div>

                                    {/* Note - Minimal & Expandable */}
                                    <div className="max-w-xl">
                                        <p className="text-white/80 text-sm leading-relaxed line-clamp-2 hover:line-clamp-none transition-all duration-300 cursor-help border-l-2 border-white/20 pl-3">
                                            "{FEATURED_ART.artistNote}"
                                        </p>
                                    </div>
                                </div>

                                {/* Actions - Vertical Stack for minimalism */}
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                                            onClick={handleLike}
                                        >
                                            <Heart className={`h-6 w-6 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
                                        </Button>
                                        <span className="text-xs font-medium text-white/80">{likes}</span>
                                    </div>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all hover:scale-110"
                                            >
                                                <Upload className="h-5 w-5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Submit Your Artwork</DialogTitle>
                                                <DialogDescription>
                                                    Share your medical art with the community! Selected artworks are featured on the login page for a week.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="bg-secondary/50 p-4 rounded-lg text-sm text-muted-foreground">
                                                    <p className="font-semibold mb-2 flex items-center gap-2">
                                                        <Info className="h-4 w-4" />
                                                        Submission Guidelines:
                                                    </p>
                                                    <ul className="list-disc list-inside space-y-1 ml-1">
                                                        <li>Must be original artwork created by you.</li>
                                                        <li>Theme: Medical, Anatomical, or Student Life.</li>
                                                        <li>High-quality image (JPG/PNG).</li>
                                                        <li>Include a short note about the piece.</li>
                                                    </ul>
                                                </div>
                                                <Button className="w-full bg-[#66CCCF] hover:bg-[#66CCCF]/90 text-white" onClick={() => window.open('mailto:submissions@prepnosis.com?subject=Art Submission', '_blank')}>
                                                    <ExternalLink className="h-4 w-4 mr-2" />
                                                    Email Submission
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
