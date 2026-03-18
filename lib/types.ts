export interface Room {
  id: string;
  code: string;
  host_name: string;
  status: "lobby" | "spinning" | "revealed" | "scoring" | "done";
  current_entry_id: string | null;
  category: string;
  created_at: string;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  score: number;
  joined_at: string;
}

export interface Entry {
  id: string;
  room_id: string;
  player_id: string;
  title: string;
  creator: string | null;
  category: string;
  spun: boolean;
  created_at: string;
}

export interface Vote {
  id: string;
  entry_id: string;
  player_id: string;
  room_id: string;
  created_at: string;
}
