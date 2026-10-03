export interface ParentProfileSummary {
  total_stars: number;
  completed_lessons: number;
  learning_days: number;
  total_seconds: number;
  badge_count: number;
  sticker_count: number;
  last_learning_at: string | null;
}

export interface ParentOverviewProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  birth_date: string | null;
  summary: ParentProfileSummary;
}

export interface ParentOverviewResponse {
  data: {
    profiles: ParentOverviewProfile[];
  };
}

export interface ChildReportProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  birth_date: string | null;
}

export interface ChildReportSummary extends ParentProfileSummary {}

export interface ChapterReport {
  chapter_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  order_index: number;
  completed_lessons: number;
  earned_stars: number;
  status: string;
  completed_at: string | null;
}

export interface LessonReport {
  lesson_id: string;
  chapter_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  order_index: number;
  status: string;
  stars: number;
  best_score: number;
  attempts_count: number;
  first_completed_at: string | null;
  last_played_at: string | null;
}

export interface RecentActivity {
  activity_date: string;
  lessons_done: number;
  stars_gained: number;
  total_seconds: number;
}

export interface BadgeReport {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  earned_at: string;
}

export interface StickerReport {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image_url: string | null;
  unlocked_at: string;
}

export interface ChildReport {
  profile: ChildReportProfile;
  summary: ChildReportSummary;
  chapters: ChapterReport[];
  lessons: LessonReport[];
  recent_activity: RecentActivity[];
  badges: BadgeReport[];
  stickers: StickerReport[];
}

export interface ChildReportResponse {
  data: ChildReport;
}
