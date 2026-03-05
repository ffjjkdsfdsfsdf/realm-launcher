
-- Create access_keys table to store generated keys
CREATE TABLE public.access_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_value TEXT NOT NULL UNIQUE,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  used_by TEXT,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

-- Anyone can validate keys (SELECT)
CREATE POLICY "Anyone can validate keys"
  ON public.access_keys
  FOR SELECT
  USING (true);

-- No direct insert/update/delete for anonymous users - managed via edge functions or admin
CREATE POLICY "Service role can manage keys"
  ON public.access_keys
  FOR ALL
  USING (true)
  WITH CHECK (true);
