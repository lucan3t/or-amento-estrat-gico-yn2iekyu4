-- Allow null user_id since we are removing authentication
ALTER TABLE public.budget_entries ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing restricted policies
DROP POLICY IF EXISTS "Users can view their own entries" ON public.budget_entries;
DROP POLICY IF EXISTS "Users can insert their own entries" ON public.budget_entries;
DROP POLICY IF EXISTS "Users can update their own entries" ON public.budget_entries;
DROP POLICY IF EXISTS "Users can delete their own entries" ON public.budget_entries;

-- Enable public access for all operations
CREATE POLICY "Public read access" ON public.budget_entries FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.budget_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.budget_entries FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.budget_entries FOR DELETE USING (true);
