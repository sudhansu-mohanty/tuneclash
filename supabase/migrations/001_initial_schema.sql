-- Enable UUID extension
create extension if not exists "pgcrypto";

-- rooms table
create table rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  host_name text not null,
  status text not null default 'lobby',
  current_entry_id uuid,
  category text not null default 'music',
  created_at timestamptz not null default now()
);

create unique index rooms_code_idx on rooms (code);

-- players table
create table players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  name text not null,
  score int not null default 0,
  joined_at timestamptz not null default now()
);

create index players_room_id_idx on players (room_id);

-- entries table
create table entries (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  title text not null,
  creator text,
  category text not null,
  spun bool not null default false,
  created_at timestamptz not null default now()
);

create index entries_room_id_idx on entries (room_id);
create index entries_player_id_idx on entries (player_id);

-- votes table
create table votes (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references entries (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  room_id uuid not null references rooms (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index votes_entry_id_idx on votes (entry_id);
create index votes_room_id_idx on votes (room_id);

-- Add FK from rooms to entries (after entries is created)
alter table rooms add constraint rooms_current_entry_id_fkey
  foreign key (current_entry_id) references entries (id) on delete set null;

-- Row Level Security
alter table rooms enable row level security;
alter table players enable row level security;
alter table entries enable row level security;
alter table votes enable row level security;

-- Permissive policies (allow all for now)
create policy "allow all rooms" on rooms for all using (true) with check (true);
create policy "allow all players" on players for all using (true) with check (true);
create policy "allow all entries" on entries for all using (true) with check (true);
create policy "allow all votes" on votes for all using (true) with check (true);

-- Enable Realtime
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table votes;
