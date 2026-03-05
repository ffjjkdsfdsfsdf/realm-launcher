
-- Drop all restrictive policies
DROP POLICY IF EXISTS "Anyone can delete keys" ON public.access_keys;
DROP POLICY IF EXISTS "Anyone can insert keys" ON public.access_keys;
DROP POLICY IF EXISTS "Anyone can update keys" ON public.access_keys;
DROP POLICY IF EXISTS "Anyone can validate keys" ON public.access_keys;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Allow all select" ON public.access_keys FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow all insert" ON public.access_keys FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow all update" ON public.access_keys FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all delete" ON public.access_keys FOR DELETE TO anon, authenticated USING (true);
