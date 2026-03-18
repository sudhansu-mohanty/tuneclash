import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { hostName, category } = await req.json();

  if (!hostName || typeof hostName !== "string") {
    return NextResponse.json({ error: "hostName is required" }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const code = Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code,
        host_name: hostName.trim(),
        category: category ?? "music",
        status: "lobby",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
