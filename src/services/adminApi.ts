import { apiClient } from './axios';
import {
  AdminChapter,
  AdminLesson,
  AdminMetricOverview,
  AdminPagination,
  AdminUserAccount,
} from '../types/admin';

export const adminApi = {
  // 1. Dashboard Metrics
  getMetrics: async (): Promise<AdminMetricOverview> => {
    try {
      const response = await apiClient.get<{ data: AdminMetricOverview }>('/admin/metrics');
      return response.data.data;
    } catch (error) {
      console.warn('Fallback metrics due to API error:', error);
      return {
        totalParents: 0,
        totalChildren: 0,
        totalChapters: 0,
        totalLessons: 0,
        totalQuestions: 0,
        totalBadges: 0,
        activeToday: 0,
        completedLessonsTotal: 0,
      };
    }
  },

  // 2. User Accounts with Pagination & Filters
  getAccounts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'all' | 'active' | 'suspended';
  }): Promise<{ data: AdminUserAccount[]; pagination?: AdminPagination }> => {
    const response = await apiClient.get<{
      data: AdminUserAccount[];
      pagination?: AdminPagination;
    }>('/admin/accounts', { params });
    return response.data;
  },

  toggleAccountStatus: async (userId: string): Promise<AdminUserAccount> => {
    const response = await apiClient.patch<{ data: AdminUserAccount }>(
      `/admin/accounts/${encodeURIComponent(userId)}/status`
    );
    return response.data.data;
  },

  resetUserPin: async (userId: string): Promise<void> => {
    await apiClient.post(`/admin/accounts/${encodeURIComponent(userId)}/reset-pin`);
  },

  deleteAccount: async (userId: string): Promise<void> => {
    await apiClient.delete(`/admin/accounts/${encodeURIComponent(userId)}`);
  },

  // 3. Curriculum & Lessons
  getChapters: async (): Promise<AdminChapter[]> => {
    const response = await apiClient.get<{ data: AdminChapter[] }>('/admin/chapters');
    return response.data.data;
  },

  saveChapter: async (chapter: Partial<AdminChapter>): Promise<AdminChapter> => {
    if (chapter.id) {
      const response = await apiClient.put<{ data: AdminChapter }>(
        `/admin/chapters/${encodeURIComponent(chapter.id)}`,
        chapter
      );
      return response.data.data;
    } else {
      const response = await apiClient.post<{ data: AdminChapter }>(
        '/admin/chapters',
        chapter
      );
      return response.data.data;
    }
  },

  deleteChapter: async (chapterId: string): Promise<void> => {
    await apiClient.delete(`/admin/chapters/${encodeURIComponent(chapterId)}`);
  },

  saveLesson: async (chapterId: string, lesson: Partial<AdminLesson>): Promise<AdminLesson> => {
    if (lesson.id) {
      const response = await apiClient.put<{ data: AdminLesson }>(
        `/admin/chapters/${encodeURIComponent(chapterId)}/lessons/${encodeURIComponent(lesson.id)}`,
        lesson
      );
      return response.data.data;
    } else {
      const response = await apiClient.post<{ data: AdminLesson }>(
        `/admin/chapters/${encodeURIComponent(chapterId)}/lessons`,
        lesson
      );
      return response.data.data;
    }
  },

  deleteLesson: async (chapterId: string, lessonId: string): Promise<void> => {
    await apiClient.delete(
      `/admin/chapters/${encodeURIComponent(chapterId)}/lessons/${encodeURIComponent(lessonId)}`
    );
  },

  // 4. Questions
  saveQuestion: async (lessonId: string, question: any): Promise<any> => {
    if (question.id) {
      const response = await apiClient.put<{ data: any }>(
        `/admin/lessons/${encodeURIComponent(lessonId)}/questions/${encodeURIComponent(question.id)}`,
        question
      );
      return response.data.data;
    } else {
      const response = await apiClient.post<{ data: any }>(
        `/admin/lessons/${encodeURIComponent(lessonId)}/questions`,
        question
      );
      return response.data.data;
    }
  },

  deleteQuestion: async (lessonId: string, questionId: string): Promise<void> => {
    await apiClient.delete(
      `/admin/lessons/${encodeURIComponent(lessonId)}/questions/${encodeURIComponent(questionId)}`
    );
  },
};
