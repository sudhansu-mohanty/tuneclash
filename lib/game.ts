import { createClient } from "./supabase";
import type { Vote } from "./types";

export function calculateMatchPercent(
  votes: Vote[],
  totalPlayers: number
): number {
  if (totalPlayers === 0) return 0;
  return Math.round((votes.length / totalPlayers) * 100);
}

export async function updateScoresAfterRound(
  roomId: string,
  entryId: string
): Promise<void> {
  const supabase = createClient();

  // Fetch all votes for this entry
  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("player_id")
    .eq("entry_id", entryId);

  if (votesError) throw votesError;

  // Fetch current player scores
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, score")
    .eq("room_id", roomId);

  if (playersError) throw playersError;

  // Increment score by 1 for each player who voted
  const voterIds = new Set((votes ?? []).map((v) => v.player_id));
  const updates = (players ?? [])
    .filter((p) => voterIds.has(p.id))
    .map((p) =>
      supabase.from("players").update({ score: p.score + 1 }).eq("id", p.id)
    );

  await Promise.all(updates);

  // Mark entry as spun
  const { error: entryError } = await supabase
    .from("entries")
    .update({ spun: true })
    .eq("id", entryId);

  if (entryError) throw entryError;
}
