// Knowledge Workspace Types
export type KnowledgeItemType = 'link' | 'video' | 'note' | 'pdf' | 'image' | 'reel';
export type KnowledgePriority = 'now' | 'later' | 'ignore';
export type KnowledgeDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface KnowledgeItem {
  id: string;
  user_id: string;
  type: KnowledgeItemType;
  title: string | null;
  content: string | null;
  url: string | null;
  thumbnail_url: string | null;
  extracted_insights: string[] | null;
  tagged_skills: string[] | null;
  difficulty: KnowledgeDifficulty | null;
  relevance_score: number | null;
  priority: KnowledgePriority;
  priority_reason: string | null;
  source_domain: string | null;
  estimated_read_time: string | null;
  is_processed: boolean;
  is_consumed: boolean;
  consumed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeItemInsert {
  type: KnowledgeItemType;
  title?: string;
  content?: string;
  url?: string;
  user_id: string;
}

// Helper to extract domain from URL
export function extractDomain(url: string): string | null {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return null;
  }
}

// Helper to determine content type from URL
export function inferTypeFromUrl(url: string): KnowledgeItemType {
  const domain = extractDomain(url);
  
  if (!domain) return 'link';
  
  // Video platforms
  if (['youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com'].some(d => domain.includes(d))) {
    return 'video';
  }
  
  // Instagram/TikTok reels
  if (['instagram.com', 'tiktok.com'].some(d => domain.includes(d))) {
    return 'reel';
  }
  
  // Check file extensions
  const path = url.toLowerCase();
  if (path.endsWith('.pdf')) return 'pdf';
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => path.endsWith(ext))) return 'image';
  
  return 'link';
}

// Priority labels
export const priorityLabels: Record<KnowledgePriority, string> = {
  now: 'Learn Now',
  later: 'Learn Later',
  ignore: 'Ignore',
};

// Difficulty labels
export const difficultyLabels: Record<KnowledgeDifficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

// Type icons (for reference)
export const typeLabels: Record<KnowledgeItemType, string> = {
  link: 'Link',
  video: 'Video',
  note: 'Note',
  pdf: 'PDF',
  image: 'Image',
  reel: 'Reel',
};
