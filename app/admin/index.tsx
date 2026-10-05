import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  AdminBadge,
  AdminChapter,
  AdminLesson,
  AdminMetricOverview,
  AdminTab,
  AdminUserAccount,
} from '../../src/types/admin';
import { adminApi } from '../../src/services/adminApi';
import { AdminSidebar } from '../../src/components/admin/AdminSidebar';
import { AdminHeader } from '../../src/components/admin/AdminHeader';
import { AdminOverviewTab } from '../../src/components/admin/AdminOverviewTab';
import { AdminAccountsTab } from '../../src/components/admin/AdminAccountsTab';
import { AdminCurriculumTab } from '../../src/components/admin/AdminCurriculumTab';
import { AdminBadgesTab } from '../../src/components/admin/AdminBadgesTab';

export default function AdminDashboardRoute() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [metrics, setMetrics] = useState<AdminMetricOverview>({
    totalParents: 0,
    totalChildren: 0,
    totalChapters: 0,
    totalLessons: 0,
    totalQuestions: 0,
    totalBadges: 0,
    activeToday: 0,
    completedLessonsTotal: 0,
  });

  const [accounts, setAccounts] = useState<AdminUserAccount[]>([]);
  const [chapters, setChapters] = useState<AdminChapter[]>([]);
  const [badges, setBadges] = useState<AdminBadge[]>([]);

  const loadAllData = async () => {
    try {
      const [m, a, c, b] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getAccounts(),
        adminApi.getChapters(),
        adminApi.getBadges(),
      ]);
      setMetrics(m);
      setAccounts(a);
      setChapters(c);
      setBadges(b);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu quản trị.';
      Alert.alert('Lỗi', msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
  };

  // Account Handlers
  const handleToggleStatus = async (userId: string) => {
    const updated = await adminApi.toggleAccountStatus(userId);
    setAccounts((prev) => prev.map((u) => (u.id === userId ? updated : u)));
  };

  const handleResetPin = async (userId: string) => {
    await adminApi.resetUserPin(userId);
    setAccounts((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, hasPin: false } : u))
    );
  };

  const handleDeleteAccount = async (userId: string) => {
    await adminApi.deleteAccount(userId);
    setAccounts((prev) => prev.filter((u) => u.id !== userId));
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  // Curriculum Handlers
  const handleSaveChapter = async (chapterData: Partial<AdminChapter>) => {
    const saved = await adminApi.saveChapter(chapterData);
    setChapters((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists
        ? prev.map((c) => (c.id === saved.id ? saved : c))
        : [...prev, saved];
    });
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  const handleDeleteChapter = async (chapterId: string) => {
    await adminApi.deleteChapter(chapterId);
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  const handleSaveLesson = async (
    chapterId: string,
    lessonData: Partial<AdminLesson>
  ) => {
    const saved = await adminApi.saveLesson(chapterId, lessonData);
    setChapters((prev) =>
      prev.map((c) => {
        if (c.id !== chapterId) return c;
        const exists = c.lessons.some((l) => l.id === saved.id);
        const nextLessons = exists
          ? c.lessons.map((l) => (l.id === saved.id ? saved : l))
          : [...c.lessons, saved];
        return { ...c, lessons: nextLessons };
      })
    );
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  const handleDeleteLesson = async (chapterId: string, lessonId: string) => {
    await adminApi.deleteLesson(chapterId, lessonId);
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? { ...c, lessons: c.lessons.filter((l) => l.id !== lessonId) }
          : c
      )
    );
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  const handleSaveQuestion = async (lessonId: string, questionData: any) => {
    await adminApi.saveQuestion(lessonId, questionData);
    const updatedChapters = await adminApi.getChapters();
    setChapters(updatedChapters);
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  const handleDeleteQuestion = async (lessonId: string, questionId: string) => {
    await adminApi.deleteQuestion(lessonId, questionId);
    const updatedChapters = await adminApi.getChapters();
    setChapters(updatedChapters);
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  // Badge Handlers
  const handleSaveBadge = async (badgeData: Partial<AdminBadge>) => {
    const saved = await adminApi.saveBadge(badgeData);
    setBadges((prev) => {
      const exists = prev.some((b) => b.id === saved.id);
      return exists
        ? prev.map((b) => (b.id === saved.id ? saved : b))
        : [...prev, saved];
    });
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  const handleDeleteBadge = async (badgeId: string) => {
    await adminApi.deleteBadge(badgeId);
    setBadges((prev) => prev.filter((b) => b.id !== badgeId));
    const m = await adminApi.getMetrics();
    setMetrics(m);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.layoutContainer}>
        {/* Left Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          metrics={{
            totalAccounts: accounts.length,
            totalLessons: metrics.totalLessons,
            totalBadges: badges.length,
          }}
        />

        {/* Right Main Content */}
        <View style={styles.mainContent}>
          <AdminHeader
            activeTab={activeTab}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
          />

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>
                  Đang tải bảng điều khiển quản trị...
                </Text>
              </View>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <AdminOverviewTab
                    metrics={metrics}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {activeTab === 'accounts' && (
                  <AdminAccountsTab
                    accounts={accounts}
                    onToggleStatus={handleToggleStatus}
                    onResetPin={handleResetPin}
                    onDeleteAccount={handleDeleteAccount}
                  />
                )}
                {activeTab === 'curriculum' && (
                  <AdminCurriculumTab
                    chapters={chapters}
                    onSaveChapter={handleSaveChapter}
                    onDeleteChapter={handleDeleteChapter}
                    onSaveLesson={handleSaveLesson}
                    onDeleteLesson={handleDeleteLesson}
                    onSaveQuestion={handleSaveQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                  />
                )}
                {activeTab === 'badges' && (
                  <AdminBadgesTab
                    badges={badges}
                    onSaveBadge={handleSaveBadge}
                    onDeleteBadge={handleDeleteBadge}
                  />
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingBox: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
