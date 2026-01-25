CREATE TABLE public.budget_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID NOT NULL REFERENCES public.budget_entries(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by TEXT
);

-- Enable RLS
ALTER TABLE public.budget_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching the current application state)
CREATE POLICY "Public read access history" ON public.budget_history FOR SELECT USING (true);
CREATE POLICY "Public insert access history" ON public.budget_history FOR INSERT WITH CHECK (true);
