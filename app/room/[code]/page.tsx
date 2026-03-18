"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient, updateRoomStatus, setCurrentEntry, submitVote } from "@/lib/supabase";
import { updateScoresAfterRound } from "@/lib/game";
import type { Room, Player, Entry, Vote } from "@/lib/types";
import RoomLobby from "@/components/RoomLobby";
import RouletteWheel, { type RouletteWheelHandle } from "@/components/RouletteWheel";
import RevealCard from "@/components/RevealCard";
import VotePanel from "@/components/VotePanel";
import MatchBars from "@/components/MatchBars";
import Leaderboard from "@/components/Leaderboard";

export default function RoomPage() {
  const params = useParams();
  const code = (params.code as string).toUpperCase();
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentEntry, setCurrentEntryState] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);

  const wheelRef = useRef<RouletteWheelHandle>(null);
  const supabase = createClient();

  // Derive identity from sessionStorage
  const myName =
    typeof window !== "undefined"
      ? sessionStorage.getItem("playerName") ?? ""
      : "";
  const myPlayer = players.find((p) => p.name === myName) ?? null;
  const isHost = room?.host_name === myName;

  // Initial load
  useEffect(() => {
    async function load() {
      const { data: roomData, error: roomErr } = await supabase
        .from("rooms")
        .select()
        .eq("code", code)
        .single();

      if (roomErr || !roomData) {
        setError("Room not found");
        setLoading(false);
        return;
      }

      const r = roomData as Room;
      setRoom(r);

      const [{ data: pData }, { data: eData }] = await Promise.all([
        supabase.from("players").select().eq("room_id", r.id).order("joined_at"),
        supabase.from("entries").select().eq("room_id", r.id).order("created_at"),
      ]);

      setPlayers((pData ?? []) as Player[]);
      setEntries((eData ?? []) as Entry[]);

      if (r.current_entry_id) {
        const entry = (eData ?? []).find(
          (e: Entry) => e.id === r.current_entry_id
        ) ?? null;
        setCurrentEntryState(entry);

        if (entry) {
          const { data: vData } = await supabase
            .from("votes")
            .select()
            .eq("entry_id", entry.id);
          setVotes((vData ?? []) as Vote[]);
        }
      }

      setLoading(false);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Realtime subscriptions
  useEffect(() => {
    if (!room) return;

    const roomSub = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        async (payload) => {
          const updated = payload.new as Room;
          setRoom(updated);

          if (updated.current_entry_id && updated.current_entry_id !== room.current_entry_id) {
            const { data } = await supabase
              .from("entries")
              .select()
              .eq("id", updated.current_entry_id)
              .single();
            if (data) setCurrentEntryState(data as Entry);
            setVotes([]);
          }

          if (updated.status === "done") {
            router.push(`/room/${code}/end`);
          }
        }
      )
      .subscribe();

    const playerSub = supabase
      .channel(`players-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${room.id}` },
        async () => {
          const { data } = await supabase
            .from("players")
            .select()
            .eq("room_id", room.id)
            .order("joined_at");
          setPlayers((data ?? []) as Player[]);
        }
      )
      .subscribe();

    const voteSub = supabase
      .channel(`votes-${room.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "votes", filter: `room_id=eq.${room.id}` },
        (payload) => {
          setVotes((prev) => [...prev, payload.new as Vote]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomSub);
      supabase.removeChannel(playerSub);
      supabase.removeChannel(voteSub);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.id]);

  const handleStartGame = useCallback(async () => {
    if (!room) return;
    setStarting(true);
    try {
      await updateRoomStatus(room.id, "spinning");
    } catch (e) {
      setError(String(e));
    } finally {
      setStarting(false);
    }
  }, [room]);

  const handleSpin = useCallback(() => {
    if (!wheelRef.current || spinning) return;
    setSpinning(true);
    wheelRef.current.spin();
  }, [spinning]);

  const handleLand = useCallback(
    async (entry: Entry) => {
      setSpinning(false);
      if (!room || !isHost) return;
      try {
        await setCurrentEntry(room.id, entry.id);
      } catch (e) {
        setError(String(e));
      }
    },
    [room, isHost]
  );

  const handleVote = useCallback(
    async (votedPlayerId: string) => {
      if (!myPlayer || !currentEntry || !room) return;
      try {
        await submitVote(currentEntry.id, votedPlayerId, room.id);
      } catch {
        // vote may already exist, ignore
      }
    },
    [myPlayer, currentEntry, room]
  );

  const handleSeeMatches = useCallback(async () => {
    if (!room || !currentEntry || !isHost) return;
    setScoringLoading(true);
    try {
      await updateScoresAfterRound(room.id, currentEntry.id);
      await updateRoomStatus(room.id, "scoring");
    } catch (e) {
      setError(String(e));
    } finally {
      setScoringLoading(false);
    }
  }, [room, currentEntry, isHost]);

  const handleNextRound = useCallback(async () => {
    if (!room || !isHost) return;
    const next = entries.find((e) => !e.spun && e.id !== currentEntry?.id);
    if (!next) {
      await updateRoomStatus(room.id, "done");
      return;
    }
    await updateRoomStatus(room.id, "spinning");
  }, [room, isHost, entries, currentEntry]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-zinc-500">Loading…</div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-400">{error ?? "Something went wrong"}</div>
      </div>
    );
  }

  // Lobby
  if (room.status === "lobby") {
    return (
      <RoomLobby
        room={room}
        players={players}
        myPlayerName={myName}
        isHost={isHost}
        onStartGame={handleStartGame}
        starting={starting}
      />
    );
  }

  const unspunEntries = entries.filter((e) => !e.spun);

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-8 gap-6">
      <div className="flex items-center justify-between w-full max-w-md">
        <h1 className="font-syne text-2xl font-bold text-white">
          Tune<span className="text-accent">Clash</span>
        </h1>
        <span className="font-syne font-bold tracking-widest text-zinc-400 border border-zinc-700 rounded-lg px-3 py-1 text-sm">
          {room.code}
        </span>
      </div>

      {/* Spinning */}
      {room.status === "spinning" && (
        <div className="flex flex-col items-center gap-6 w-full">
          <RouletteWheel
            ref={wheelRef}
            entries={unspunEntries}
            onLand={handleLand}
          />
          {isHost && (
            <button
              onClick={handleSpin}
              disabled={spinning || unspunEntries.length === 0}
              className="bg-accent hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-syne font-bold text-xl px-12 py-4 rounded-2xl transition-colors"
            >
              {spinning ? "Spinning…" : "SPIN"}
            </button>
          )}
          {!isHost && (
            <p className="text-zinc-500 text-sm">Waiting for {room.host_name} to spin…</p>
          )}
        </div>
      )}

      {/* Revealed */}
      {room.status === "revealed" && currentEntry && (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <RevealCard entry={currentEntry} />
          <VotePanel
            players={players}
            votes={votes}
            myPlayerId={myPlayer?.id ?? ""}
            onVote={handleVote}
          />
          {isHost && (
            <button
              onClick={handleSeeMatches}
              disabled={scoringLoading}
              className="w-full bg-accent-blue hover:bg-blue-500 disabled:opacity-50 text-white font-syne font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {scoringLoading ? <Spinner /> : "See matches →"}
            </button>
          )}
        </div>
      )}

      {/* Scoring */}
      {room.status === "scoring" && currentEntry && (
        <div className="flex flex-col items-center gap-6 w-full max-w-md">
          <RevealCard entry={currentEntry} />
          <MatchBars players={players} votes={votes} />
          <Leaderboard players={players} />
          {isHost && (
            <button
              onClick={handleNextRound}
              className="w-full bg-accent hover:bg-orange-500 text-white font-syne font-bold py-3 rounded-xl transition-colors"
            >
              {unspunEntries.length > 1 ? "Next round →" : "See final results →"}
            </button>
          )}
          {!isHost && (
            <p className="text-zinc-500 text-sm">Waiting for {room.host_name} to continue…</p>
          )}
        </div>
      )}
    </main>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
