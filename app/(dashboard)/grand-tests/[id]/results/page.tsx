"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="container mx-auto">
      <UserHeader text="Leaderboard" />
      <Card className="max-w-4xl mx-auto my-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Test Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((ranking) => (
                <TableRow
                  key={ranking.user_id}
                  className={
                    ranking.user_id === user?.id ? "bg-[#6FCCCA]/10" : ""
                  }
                >
                  <TableCell>{ranking.rank}</TableCell>
                  <TableCell>
                    {ranking.user_profiles?.full_name || "Anonymous"}
                  </TableCell>
                  <TableCell>{ranking.score}</TableCell>
                  <TableCell>{ranking.percentile.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
