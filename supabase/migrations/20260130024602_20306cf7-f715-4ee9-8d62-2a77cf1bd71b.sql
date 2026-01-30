-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Knowledge items table for the Personal Knowledge Workspace
-- Users can dump links, videos, notes, etc. with zero friction
CREATE TABLE public.knowledge_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Content type and source
  type TEXT NOT NULL CHECK (type IN ('link', 'video', 'note', 'pdf', 'image', 'reel')),
  title TEXT,
  content TEXT,
  url TEXT,
  thumbnail_url TEXT,
  
  -- AI-extracted metadata
  extracted_insights TEXT[],
  tagged_skills TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  
  -- Priority engine
  priority TEXT NOT NULL DEFAULT 'later' CHECK (priority IN ('now', 'later', 'ignore')),
  priority_reason TEXT,
  
  -- Metadata
  source_domain TEXT,
  estimated_read_time TEXT,
  
  -- Status
  is_processed BOOLEAN NOT NULL DEFAULT false,
  is_consumed BOOLEAN NOT NULL DEFAULT false,
  consumed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own knowledge items"
  ON public.knowledge_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own knowledge items"
  ON public.knowledge_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own knowledge items"
  ON public.knowledge_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own knowledge items"
  ON public.knowledge_items FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_knowledge_items_updated_at
  BEFORE UPDATE ON public.knowledge_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_knowledge_items_user_priority ON public.knowledge_items(user_id, priority);
CREATE INDEX idx_knowledge_items_user_type ON public.knowledge_items(user_id, type);