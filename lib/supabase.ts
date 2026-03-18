"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Room, Player, Entry, Vote } from "./types";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Generate a random 4-letter uppercase room code
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function createRoom(
  hostName: string,
  category: string = "music"
): Promise<Room> {
  const supabase = createClient();
  const code = generateCode();

  const { data, error } = await supabase
    .from("rooms")
    .insert({ code, host_name: hostName, category, status: "lobby" })
    .select()
    .single();

  if (error) throw error;
  return data as Room;
}

export async function joinRoom(
  code: string,
  playerName: string
): Promise<{ room: Room; player: Player }> {
  const supabase = createClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select()
    .eq("code", code.toUpperCase())
    .single();

  if (roomError) throw new Error("Room not found");

  const { data: player, error: playerError } = await supabase
    .from("players")
    .insert({ room_id: room.id, name: playerName })
    .select()
    .single();

  if (playerError) throw playerError;

  return { room: room as Room, player: player as Player };
}

export async function addEntry(
  roomId: string,
  playerId: string,
  title: string,
  category: string,
  creator?: string
): Promise<Entry> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("entries")
    .insert({ room_id: roomId, player_id: playerId, title, category, creator: creator || null })
    .select()
    .single();

  if (error) throw error;
  return data as Entry;
}

export async function submitVote(
  entryId: string,
  playerId: string,
  roomId: string
): Promise<Vote> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("votes")
    .insert({ entry_id: entryId, player_id: playerId, room_id: roomId })
    .select()
    .single();

  if (error) throw error;
  return data as Vote;
}

export async function updateRoomStatus(
  roomId: string,
  status: Room["status"]
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("rooms")
    .update({ status })
    .eq("id", roomId);

  if (error) throw error;
}

export async function setCurrentEntry(
  roomId: string,
  entryId: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("rooms")
    .update({ current_entry_id: entryId, status: "revealed" })
    .eq("id", roomId);

  if (error) throw error;
}

export async function updatePlayerScore(
  playerId: string,
  newScore: number
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("players")
    .update({ score: newScore })
    .eq("id", playerId);

  if (error) throw error;
}
