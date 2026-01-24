CREATE TABLE IF NOT EXISTS public.budget_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    department TEXT NOT NULL,
    program TEXT NOT NULL,
    dotation NUMERIC NOT NULL DEFAULT 0,
    committed NUMERIC NOT NULL DEFAULT 0,
    liquidated NUMERIC NOT NULL DEFAULT 0,
    paid NUMERIC NOT NULL DEFAULT 0,
    reserved NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own entries" ON public.budget_entries
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" ON public.budget_entries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" ON public.budget_entries
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" ON public.budget_entries
    FOR DELETE
    USING (auth.uid() = user_id);
