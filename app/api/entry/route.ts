import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { roomId, playerId, title, category, creator } = await req.json();

  if (!roomId || !playerId || !title || !category) {
    return NextResponse.json(
      { error: "roomId, playerId, title, and category are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("entries")
      .insert({
        room_id: roomId,
        player_id: playerId,
        title: title.trim(),
        category,
        creator: creator?.trim() || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
