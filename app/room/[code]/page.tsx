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
import BottomNav from "@/components/BottomNav";

export default function RoomPage() {
  const params = useParams();
  const code   = (params.code as string).toUpperCase();
  const router = useRouter();

  const [room, setRoom]                     = useState<Room | null>(null);
  const [players, setPlayers]               = useState<Player[]>([]);
  const [entries, setEntries]               = useState<Entry[]>([]);
  const [votes, setVotes]                   = useState<Vote[]>([]);
  const [currentEntry, setCurrentEntryState] = useState<Entry | null>(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [starting, setStarting]             = useState(false);
  const [spinning, setSpinning]             = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);

  const wheelRef = useRef<RouletteWheelHandle>(null);
  const supabase = createClient();

  const myName   = typeof window !== "undefined" ? sessionStorage.getItem("playerName") ?? "" : "";
  const myPlayer = players.find((p) => p.name === myName) ?? null;
  const isHost   = room?.host_name === myName;

  // Initial load
  useEffect(() => {
    async function load() {
      const { data: roomData, error: roomErr } = await supabase
        .from("rooms").select().eq("code", code).single();

      if (roomErr || !roomData) { setError("Room not found"); setLoading(false); return; }

      const r = roomData as Room;
      setRoom(r);

      const [{ data: pData }, { data: eData }] = await Promise.all([
        supabase.from("players").select().eq("room_id", r.id).order("joined_at"),
        supabase.from("entries").select().eq("room_id", r.id).order("created_at"),
      ]);
      setPlayers((pData ?? []) as Player[]);
      setEntries((eData ?? []) as Entry[]);

      if (r.current_entry_id) {
        const entry = (eData ?? []).find((e: Entry) => e.id === r.current_entry_id) ?? null;
        setCurrentEntryState(entry);
        if (entry) {
          const { data: vData } = await supabase.from("votes").select().eq("entry_id", entry.id);
          setVotes((vData ?? []) as Vote[]);
        }
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Realtime
  useEffect(() => {
    if (!room) return;

    const roomSub = supabase
      .channel(`room-${room.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        async (payload) => {
          const updated = payload.new as Room;
          setRoom(updated);
          if (updated.current_entry_id && updated.current_entry_id !== room.current_entry_id) {
            const { data } = await supabase.from("entries").select().eq("id", updated.current_entry_id).single();
            if (data) setCurrentEntryState(data as Entry);
            setVotes([]);
          }
          if (updated.status === "done") router.push(`/room/${code}/end`);
        })
      .subscribe();

    const playerSub = supabase
      .channel(`players-${room.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `room_id=eq.${room.id}` },
        async () => {
          const { data } = await supabase.from("players").select().eq("room_id", room.id).order("joined_at");
          setPlayers((data ?? []) as Player[]);
        })
      .subscribe();

    const voteSub = supabase
      .channel(`votes-${room.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "votes", filter: `room_id=eq.${room.id}` },
        (payload) => { setVotes((prev) => [...prev, payload.new as Vote]); })
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
    try { await updateRoomStatus(room.id, "spinning"); }
    catch (e) { setError(String(e)); }
    finally { setStarting(false); }
  }, [room]);

  const handleSpin = useCallback(() => {
    if (!wheelRef.current || spinning) return;
    setSpinning(true);
    wheelRef.current.spin();
  }, [spinning]);

  const handleLand = useCallback(async (entry: Entry) => {
    setSpinning(false);
    if (!room || !isHost) return;
    try { await setCurrentEntry(room.id, entry.id); }
    catch (e) { setError(String(e)); }
  }, [room, isHost]);

  const handleVote = useCallback(async (votedPlayerId: string) => {
    if (!myPlayer || !currentEntry || !room) return;
    try { await submitVote(currentEntry.id, votedPlayerId, room.id); }
    catch { /* duplicate vote — ignore */ }
  }, [myPlayer, currentEntry, room]);

  const handleSeeMatches = useCallback(async () => {
    if (!room || !currentEntry || !isHost) return;
    setScoringLoading(true);
    try {
      await updateScoresAfterRound(room.id, currentEntry.id);
      await updateRoomStatus(room.id, "scoring");
    }
    catch (e) { setError(String(e)); }
    finally { setScoringLoading(false); }
  }, [room, currentEntry, isHost]);

  const handleNextRound = useCallback(async () => {
    if (!room || !isHost) return;
    const next = entries.find((e) => !e.spun && e.id !== currentEntry?.id);
    if (!next) { await updateRoomStatus(room.id, "done"); return; }
    await updateRoomStatus(room.id, "spinning");
  }, [room, isHost, entries, currentEntry]);

  // ── Loading / error ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <span className="text-[#888888] text-sm">Loading…</span>
      </div>
    );
  }
  if (error || !room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <span className="text-red-400 text-sm">{error ?? "Something went wrong"}</span>
      </div>
    );
  }

  // ── Lobby ──
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

  // ── Shared shell for active game ──
  return (
    <div className="min-h-screen bg-[#111111] flex flex-col">

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-[#1C1B1B] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="text-[#888888] active:scale-95 transition-transform">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-syne font-bold tracking-tighter text-xl text-[#F0F0F0] uppercase">TuneClash</span>
        </div>
        <span className="font-mono font-bold tracking-[0.2em] text-[#888888] text-sm border border-[#464834]/20 rounded px-3 py-1">
          {room.code}
        </span>
      </header>

      {/* ── Spinning ── */}
      {room.status === "spinning" && (
        <main className="flex-1 pt-24 pb-32 px-6 flex flex-col items-center gap-8 max-w-[480px] mx-auto w-full">
          <div className="text-center space-y-1 mt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">Current Round</span>
            <h2 className="font-syne text-3xl font-bold tracking-tight text-[#F0F0F0]">The Wheel</h2>
          </div>
          <RouletteWheel ref={wheelRef} entries={unspunEntries} onLand={handleLand} />
          {isHost ? (
            <button
              onClick={handleSpin}
              disabled={spinning || unspunEntries.length === 0}
              className="w-full bg-[#E8FF47] text-[#2D3400] h-14 rounded-lg font-syne font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {spinning ? "Spinning…" : "SPIN"}
              {!spinning && <span className="material-symbols-outlined">arrow_forward</span>}
            </button>
          ) : (
            <p className="text-[#888888] text-sm text-center">Waiting for {room.host_name} to spin…</p>
          )}
        </main>
      )}

      {/* ── Revealed ── */}
      {room.status === "revealed" && currentEntry && (
        <main className="flex-1 pt-24 pb-32 px-6 flex flex-col gap-6 max-w-[480px] mx-auto w-full">
          <div className="text-center space-y-1 mt-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888]">Current Round</span>
            <h2 className="font-syne text-3xl font-bold tracking-tight text-[#F0F0F0]">The Reveal</h2>
          </div>

          <RevealCard entry={currentEntry} />

          <VotePanel
            players={players}
            votes={votes}
            myPlayerId={myPlayer?.id ?? ""}
            onVote={handleVote}
            entryTitle={currentEntry.title}
          />

          {isHost && (
            <div className="space-y-3 mt-2">
              <button
                onClick={handleSeeMatches}
                disabled={scoringLoading}
                className="w-full bg-[#E8FF47] text-[#2D3400] h-14 rounded-lg font-syne font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
              >
                {scoringLoading ? <Spinner /> : <>Next Submission <span className="material-symbols-outlined text-sm">arrow_forward</span></>}
              </button>
              <button
                onClick={handleSeeMatches}
                disabled={scoringLoading}
                className="w-full bg-[#1C1B1B] text-[#888888] h-12 rounded-lg font-medium text-sm hover:text-[#F0F0F0] transition-colors"
              >
                View Scoreboard
              </button>
            </div>
          )}

          {!isHost && (
            <p className="text-[#888888] text-sm text-center">Waiting for {room.host_name}…</p>
          )}
        </main>
      )}

      {/* ── Scoring ── */}
      {room.status === "scoring" && currentEntry && (
        <main className="flex-1 pt-24 pb-32 px-6 flex flex-col gap-8 max-w-[480px] mx-auto w-full">

          {/* Decorative background glow */}
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden opacity-20">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#E8FF47] blur-[150px] rounded-full" />
          </div>

          <RevealCard entry={currentEntry} />
          <MatchBars players={players} votes={votes} category={currentEntry.category} />
          <Leaderboard players={players} />

          {isHost && (
            <div className="fixed bottom-24 right-6 z-50">
              <button
                onClick={handleNextRound}
                className="bg-[#E8FF47] text-[#2D3400] px-8 py-4 rounded-lg font-syne font-bold text-sm tracking-widest flex items-center gap-2 active:scale-95 transition-transform"
              >
                {unspunEntries.length > 1 ? "NEXT ROUND" : "FINAL RESULTS"}
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          )}
          {!isHost && (
            <p className="text-[#888888] text-sm text-center pb-4">Waiting for {room.host_name} to continue…</p>
          )}
        </main>
      )}

      <BottomNav active="games" />
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
