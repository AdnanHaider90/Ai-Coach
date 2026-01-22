-- Supabase tables for AI Coach MVP
create table if not exists "Session" (
  id uuid primary key,
  userId uuid not null,
  coachType text not null,
  createdAt timestamptz default now()
);

create table if not exists "Message" (
  id uuid primary key,
  sessionId uuid references "Session"(id),
  role text not null,
  content text not null,
  createdAt timestamptz default now()
);

create table if not exists "Goal" (
  id uuid primary key,
  userId uuid not null,
  title text not null,
  description text,
  dueDate date,
  progress int default 0
);
