import { apiClient } from "./axios";

export interface JourneyLevel {
  id: string;
  chapterId: string;
  chapterTitle: string;
  chapterDesc: string;
  title: string;
  desc: string;
  orderIndex: number;
  status: "completed" | "active" | "locked";
  stars: number;
  score: string;
  xp: number;
  type: "lesson" | "chest" | "trophy" | "fast_quiz";
  rewardStickerId?: string;
}

export interface JourneyChapter {
  id: string;
  title: string;
  desc: string;
  orderIndex: number;
  coverUrl?: string;
  levels: JourneyLevel[];
}

export interface QuestionData {
  id: string;
  type: "count" | "equation" | "compare";
  questionText: string;
  visualItems?: string[];
  visualFormula?: {
    leftItems: string[];
    operator: string;
    rightItems: string[];
  };
  compareLeft?: { count: number; icon: string; label: string };
  compareRight?: { count: number; icon: string; label: string };
  options: {
    id: string;
    label: string;
    subLabel?: string;
    icon?: string;
  }[];
  correctAnswerId: string;
  explanation: string;
  skillTag?: string;
}

export interface LessonDetailData {
  id: string;
  title: string;
  description?: string;
  rewardSticker?: any;
  questions: QuestionData[];
}

export interface SubmitLessonResult {
  score: number;
  starsEarned: number;
  totalStars: number;
  correctCount: number;
  totalQuestions: number;
}

export interface KidCornerBadge {
  id: string;
  code: string;
  title: string;
  desc: string;
  imageUrl?: string;
  conditionType: string;
  conditionValue?: number;
  status: "achieved" | "locked";
  tag: string;
}

export interface KidCornerSticker {
  id: string;
  code: string;
  name: string;
  desc: string;
  imageUrl?: string;
  soundUrl?: string;
  isUnlocked: boolean;
}

export interface KidCornerData {
  profile: {
    id: string;
    name: string;
    avatarUrl?: string;
    totalStars: number;
  };
  stats: {
    totalBadgesEarned: number;
    totalBadgesCount: number;
    totalStars: number;
    totalStickersCollected: number;
    totalStickersCount: number;
    completedLessons: number;
  };
  badges: KidCornerBadge[];
  stickers: KidCornerSticker[];
}

export const emathApi = {
  // Lấy bản đồ hành trình học tập từ DB
  getJourney: async (
    profileId?: string,
    token?: string,
  ): Promise<JourneyChapter[]> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ data: JourneyChapter[] }>(
      "/emath/journey",
      {
        params: { profile_id: profileId },
        headers,
      },
    );
    return response.data?.data || [];
  },

  // Lấy chi tiết bài học và danh sách câu hỏi từ DB
  getLessonQuestions: async (
    lessonId: string,
    token?: string,
  ): Promise<LessonDetailData> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ data: LessonDetailData }>(
      `/emath/lessons/${lessonId}/questions`,
      { headers },
    );
    return response.data?.data;
  },

  // Nộp kết quả bài làm vào DB
  submitLesson: async (
    lessonId: string,
    profileId: string,
    correctCount: number,
    totalQuestions: number,
    token?: string,
  ): Promise<SubmitLessonResult> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.post<{ data: SubmitLessonResult }>(
      `/emath/lessons/${lessonId}/submit`,
      {
        profile_id: profileId,
        correct_count: correctCount,
        total_questions: totalQuestions,
      },
      { headers },
    );
    return response.data?.data;
  },

  // Lấy dữ liệu Góc của bé từ DB
  getKidCorner: async (
    profileId: string,
    token?: string,
  ): Promise<KidCornerData> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const response = await apiClient.get<{ data: KidCornerData }>(
      "/emath/kid-corner",
      {
        params: { profile_id: profileId },
        headers,
      },
    );
    return response.data?.data;
  },
};
