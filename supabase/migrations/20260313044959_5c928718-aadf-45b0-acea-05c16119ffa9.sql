
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members are viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Team members can be inserted by anyone" ON public.team_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Team members can be deleted by anyone" ON public.team_members FOR DELETE USING (true);

CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  team_member TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  transcription TEXT,
  score INTEGER,
  feedback TEXT,
  suggestions TEXT,
  status TEXT DEFAULT 'processing',
  duration TEXT,
  input_type TEXT DEFAULT 'audio'
);

ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Calls are viewable by everyone" ON public.calls FOR SELECT USING (true);
CREATE POLICY "Calls can be inserted by anyone" ON public.calls FOR INSERT WITH CHECK (true);
CREATE POLICY "Calls can be updated by anyone" ON public.calls FOR UPDATE USING (true);
CREATE POLICY "Calls can be deleted by anyone" ON public.calls FOR DELETE USING (true);
