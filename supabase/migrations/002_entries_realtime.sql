-- Enable Realtime for entries table (was missing from initial migration)
alter publication supabase_realtime add table entries;
