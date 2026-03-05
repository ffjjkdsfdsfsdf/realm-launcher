-- Add a 'type' column to access_keys for user vs admin keys
ALTER TABLE public.access_keys ADD COLUMN IF NOT EXISTS key_type text NOT NULL DEFAULT 'user';

-- Allow anonymous users to insert, update, delete access_keys (since admin auth is client-side via hardcoded key)
CREATE POLICY "Anyone can insert keys"
ON public.access_keys
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Anyone can update keys"
ON public.access_keys
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can delete keys"
ON public.access_keys
FOR DELETE
TO anon
USING (true);