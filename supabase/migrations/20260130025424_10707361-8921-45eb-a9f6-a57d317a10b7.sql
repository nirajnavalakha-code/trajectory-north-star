-- Skills table: tracks user's skills and mastery levels
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
  target_mastery INTEGER NOT NULL DEFAULT 80,
  total_learning_time_minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Learning paths: structured paths to learn a skill
CREATE TABLE public.learning_paths (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  estimated_hours NUMERIC(5,1),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Learning path items: individual steps in a learning path
CREATE TABLE public.learning_path_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID NOT NULL REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  knowledge_item_id UUID REFERENCES public.knowledge_items(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  item_type TEXT NOT NULL DEFAULT 'learn' CHECK (item_type IN ('learn', 'practice', 'apply', 'review')),
  order_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'active', 'completed', 'skipped')),
  mastery_contribution INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Skill practice log: tracks applied learning (learning without application is incomplete)
CREATE TABLE public.skill_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  path_item_id UUID REFERENCES public.learning_path_items(id) ON DELETE SET NULL,
  mission_id TEXT, -- Links to mission system
  description TEXT NOT NULL,
  outcome TEXT,
  mastery_gained INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_path_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_applications ENABLE ROW LEVEL SECURITY;

-- Skills policies
CREATE POLICY "Users can view their own skills" ON public.skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON public.skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skills" ON public.skills FOR DELETE USING (auth.uid() = user_id);

-- Learning paths policies (check via skill ownership)
CREATE POLICY "Users can view their own learning paths" ON public.learning_paths FOR SELECT 
USING (user_id = auth.uid());
CREATE POLICY "Users can create their own learning paths" ON public.learning_paths FOR INSERT 
WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own learning paths" ON public.learning_paths FOR UPDATE 
USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own learning paths" ON public.learning_paths FOR DELETE 
USING (user_id = auth.uid());

-- Learning path items policies (check via path → user ownership)
CREATE POLICY "Users can view their own path items" ON public.learning_path_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.learning_paths lp WHERE lp.id = path_id AND lp.user_id = auth.uid()));
CREATE POLICY "Users can create their own path items" ON public.learning_path_items FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.learning_paths lp WHERE lp.id = path_id AND lp.user_id = auth.uid()));
CREATE POLICY "Users can update their own path items" ON public.learning_path_items FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.learning_paths lp WHERE lp.id = path_id AND lp.user_id = auth.uid()));
CREATE POLICY "Users can delete their own path items" ON public.learning_path_items FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.learning_paths lp WHERE lp.id = path_id AND lp.user_id = auth.uid()));

-- Skill applications policies
CREATE POLICY "Users can view their own skill applications" ON public.skill_applications FOR SELECT 
USING (user_id = auth.uid());
CREATE POLICY "Users can create their own skill applications" ON public.skill_applications FOR INSERT 
WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own skill applications" ON public.skill_applications FOR UPDATE 
USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own skill applications" ON public.skill_applications FOR DELETE 
USING (user_id = auth.uid());

-- Triggers for updated_at
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON public.skills 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON public.learning_paths 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_learning_path_items_updated_at BEFORE UPDATE ON public.learning_path_items 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_skills_user_id ON public.skills(user_id);
CREATE INDEX idx_learning_paths_user_skill ON public.learning_paths(user_id, skill_id);
CREATE INDEX idx_learning_path_items_path_order ON public.learning_path_items(path_id, order_index);
CREATE INDEX idx_skill_applications_user_skill ON public.skill_applications(user_id, skill_id);