-- =====================================================
-- SKRYPT SQL DLA SUPABASE - SKAUTOWA GRA
-- =====================================================
-- Uruchom ten skrypt w Supabase Dashboard:
-- 1. Wejdź na https://supabase.com/dashboard
-- 2. Wybierz swój projekt
-- 3. Idź do: SQL Editor
-- 4. Wklej cały ten skrypt i kliknij "Run"
-- =====================================================

-- 1. TABELA: patrols (zastępy)
CREATE TABLE IF NOT EXISTS public.patrols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8b4513',
  current_level INTEGER NOT NULL DEFAULT 0,
  leader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA: members (członkowie zastępu)
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patrol_id UUID NOT NULL REFERENCES public.patrols(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA: tasks (postępy zadań)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patrol_id UUID NOT NULL REFERENCES public.patrols(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL, -- np. "l1-t1", "l2-t3"
  current INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patrol_id, task_key)
);

-- 4. INDEKSY dla szybkiego wyszukiwania
CREATE INDEX IF NOT EXISTS idx_members_patrol_id ON public.members(patrol_id);
CREATE INDEX IF NOT EXISTS idx_tasks_patrol_id ON public.tasks(patrol_id);
CREATE INDEX IF NOT EXISTS idx_patrols_leader_id ON public.patrols(leader_id);

-- 5. FUNKCJA do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. TRIGGERY dla updated_at
DROP TRIGGER IF EXISTS update_patrols_updated_at ON public.patrols;
CREATE TRIGGER update_patrols_updated_at
  BEFORE UPDATE ON public.patrols
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_members_updated_at ON public.members;
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. ROW LEVEL SECURITY (RLS)
-- Włącz RLS na wszystkich tabelach
ALTER TABLE public.patrols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Polityki dla patrols
-- Każdy może CZYTAĆ wszystkie zastępy
CREATE POLICY "Każdy może czytać zastępy" ON public.patrols
  FOR SELECT USING (true);

-- Tylko zastępowy może EDYTOWAĆ swój zastęp
CREATE POLICY "Zastępowy może edytować swój zastęp" ON public.patrols
  FOR UPDATE USING (auth.uid() = leader_id);

-- Polityki dla members
-- Każdy może CZYTAĆ wszystkich członków
CREATE POLICY "Każdy może czytać członków" ON public.members
  FOR SELECT USING (true);

-- Tylko zastępowy może DODAWAĆ członków do swojego zastępu
CREATE POLICY "Zastępowy może dodawać członków" ON public.members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patrols 
      WHERE id = patrol_id AND leader_id = auth.uid()
    )
  );

-- Tylko zastępowy może EDYTOWAĆ członków swojego zastępu
CREATE POLICY "Zastępowy może edytować członków" ON public.members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patrols 
      WHERE id = patrol_id AND leader_id = auth.uid()
    )
  );

-- Tylko zastępowy może USUWAĆ członków swojego zastępu
CREATE POLICY "Zastępowy może usuwać członków" ON public.members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.patrols 
      WHERE id = patrol_id AND leader_id = auth.uid()
    )
  );

-- Polityki dla tasks
-- Każdy może CZYTAĆ wszystkie taski
CREATE POLICY "Każdy może czytać taski" ON public.tasks
  FOR SELECT USING (true);

-- Tylko zastępowy może DODAWAĆ taski do swojego zastępu
CREATE POLICY "Zastępowy może dodawać taski" ON public.tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.patrols 
      WHERE id = patrol_id AND leader_id = auth.uid()
    )
  );

-- Tylko zastępowy może EDYTOWAĆ taski swojego zastępu
CREATE POLICY "Zastępowy może edytować taski" ON public.tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.patrols 
      WHERE id = patrol_id AND leader_id = auth.uid()
    )
  );

-- =====================================================
-- 8. DANE POCZĄTKOWE - DWA ZASTĘPY
-- =====================================================
-- UWAGA: Na razie bez leader_id - dodasz je po utworzeniu kont userów!

INSERT INTO public.patrols (id, name, color, current_level) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Zastęp Wilków', '#8b4513', 0),
  ('22222222-2222-2222-2222-222222222222', 'Zastęp Żurawi', '#4a90e2', 0)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 9. WŁĄCZ REALTIME DLA TABEL
-- =====================================================
-- To pozwoli na automatyczną synchronizację danych między urządzeniami

ALTER PUBLICATION supabase_realtime ADD TABLE public.patrols;
ALTER PUBLICATION supabase_realtime ADD TABLE public.members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- =====================================================
-- GOTOWE! 🎉
-- =====================================================
-- Następne kroki:
-- 1. W Supabase Dashboard → Authentication → Users → Add user
--    - Utwórz konto dla zastępowego Wilków (np. wilki@druzyna.pl)
--    - Utwórz konto dla zastępowego Żurawi (np. zurawie@druzyna.pl)
--
-- 2. Skopiuj ID tych userów i uruchom:
--    UPDATE public.patrols SET leader_id = 'UUID-USERA-WILKÓW' 
--    WHERE id = '11111111-1111-1111-1111-111111111111';
--    
--    UPDATE public.patrols SET leader_id = 'UUID-USERA-ŻURAWI' 
--    WHERE id = '22222222-2222-2222-2222-222222222222';
-- =====================================================
