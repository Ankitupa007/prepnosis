"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import UserHeader from "@/components/user-header";
import { toast } from "sonner";

interface Ranking {
  rank: number;
  user_id: string;
  score: number;
  percentile: number;
  user_profiles: { full_name: string };
}

export default function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(`/api/grand-tests/${id}/rankings`);
        if (!response.ok) throw new Error("Failed to fetch rankings");
        const data = await response.json();
        setRankings(data.rankings);
      } catch (error) {
        console.error("Error fetching rankings:", error);
        toast.error("Failed to load leaderboard");
        router.push("/grand-tests");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user) fetchRankings();
  }, [id, user, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <UserHeader text="Leaderboard" />
        <div className="min-h-[70vh] flex items-center justify-center">
          <LoadingSpinner text="Loading leaderboard" />
        </div>
      </div>
    );
  }

  const userRank = rankings.find((r) => r.user_id === user?.id);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400 fill-gray-400" />;
      case 3:
        return <Trophy className="h-5 w-5 text-amber-700 fill-amber-700" />;
      default:
        return <span className="font-bold text-foreground/70">#{rank}</span>;
    }
  };

  return (
    <div className="container mx-auto pb-8">
      <UserHeader text="Leaderboard" />

      <div className="max-w-4xl mx-auto space-y-6 px-4">
        {/* User Summary Card */}
        {userRank && (
          <Card className="bg-gradient-to-r from-[#6FCCCA]/20 to-transparent border-[#6FCCCA]/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-[#6FCCCA]/20 flex items-center justify-center border-2 border-[#6FCCCA]">
                    <span className="text-2xl font-bold text-[#6FCCCA]">
                      #{userRank.rank}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Your Performance</h3>
                    <p className="text-sm text-foreground/60">
                      You scored better than {userRank.percentile.toFixed(1)}% of
                      participants
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#6FCCCA]">
                    {userRank.score}
                  </p>
                  <p className="text-sm text-foreground/60">Total Score</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => router.push(`/grand-tests/${id}/analysis`)}
                  className="w-full bg-[#6FCCCA] hover:bg-[#6FCCCA]/80"
                >
                  View Detailed Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead className="text-right">Percentile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings.map((ranking) => {
                  const isCurrentUser = ranking.user_id === user?.id;
                  return (
                    <TableRow
                      key={ranking.user_id}
                      className={
                        isCurrentUser
                          ? "bg-[#6FCCCA]/10 hover:bg-[#6FCCCA]/20 border-l-4 border-l-[#6FCCCA]"
                          : ""
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(ranking.rank)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {ranking.user_profiles?.full_name?.charAt(0) || "A"}
                          </div>
                          <span className={isCurrentUser ? "font-bold" : ""}>
                            {ranking.user_profiles?.full_name || "Anonymous"}
                            {isCurrentUser && " (You)"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {ranking.score}
                      </TableCell>
                      <TableCell className="text-right text-foreground/70">
                        {ranking.percentile.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
