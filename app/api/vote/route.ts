import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { entryId, playerId, roomId } = await req.json();

  if (!entryId || !playerId || !roomId) {
    return NextResponse.json(
      { error: "entryId, playerId, and roomId are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("votes")
      .insert({ entry_id: entryId, player_id: playerId, room_id: roomId })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
