export interface AdminMetricOverview {
  totalParents: number;
  totalChildren: number;
  totalChapters: number;
  totalLessons: number;
  totalQuestions: number;
  totalBadges: number;
  activeToday: number;
  completedLessonsTotal: number;
}

export interface AdminPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminUserAccount {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  status: 'active' | 'suspended';
  hasPin: boolean;
  profiles: AdminChildProfile[];
}

export interface AdminChildProfile {
  id: string;
  displayName: string;
  avatarIcon: string;
  grade: number;
  birthDate?: string;
  totalStars: number;
  completedLessons: number;
  learningDays: number;
  badgeCount: number;
  lastActiveAt?: string;
}

export interface AdminQuestion {
  id: string;
  lessonId: string;
  orderNumber: number;
  questionText: string;
  questionType: 'multiple_choice' | 'fill_in_the_blank' | 'image_choice' | 'matching';
  options: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
}

export interface AdminLesson {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  orderNumber: number;
  grade: number;
  icon: string;
  rewardStars: number;
  status: 'published' | 'draft';
  questionCount: number;
  questions?: AdminQuestion[];
}

export interface AdminChapter {
  id: string;
  title: string;
  description: string;
  grade: number;
  orderNumber: number;
  rewardBadgeId?: string | null;
  status: 'published' | 'draft';
  lessons: AdminLesson[];
}

export interface AdminBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'chapter' | 'special' | 'streak' | 'lesson';
  conditionType?: 'chapter_completed' | 'first_lesson' | 'streak' | 'lessons_completed';
  chapterId?: string | null;
  chapterTitle?: string | null;
  requiredCount: number;
  requiredMetric?: 'completed_lessons' | 'learning_days' | 'total_stars' | 'perfect_score' | 'chapter';
  rewardPoints: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedCount: number;
}

export type AdminTab = 'overview' | 'accounts' | 'curriculum' | 'settings';
