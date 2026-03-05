
-- Drop the overly permissive policy
DROP POLICY "Service role can manage keys" ON public.access_keys;
