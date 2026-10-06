import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Award,
  BookOpen,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react-native';
import { AdminMetricOverview, AdminTab } from '../../types/admin';

interface AdminOverviewTabProps {
  metrics: AdminMetricOverview;
  onNavigateTab: (tab: AdminTab) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  metrics,
  onNavigateTab,
}) => {
  const statCards = [
    {
      title: 'Tài khoản phụ huynh',
      value: (metrics.totalParents || 0).toLocaleString('vi-VN'),
      caption: `${(metrics.totalParents || 0).toLocaleString('vi-VN')} tài khoản đã đăng ký`,
      icon: <Users size={22} color="#2563EB" />,
      bgColor: '#EFF6FF',
      borderColor: '#DBEAFE',
      onPress: () => onNavigateTab('accounts'),
    },
    {
      title: 'Hồ sơ học sinh (Bé)',
      value: (metrics.totalChildren || 0).toLocaleString('vi-VN'),
      caption: `${(metrics.activeToday || 0).toLocaleString('vi-VN')} bé học hôm nay`,
      icon: <UserCheck size={22} color="#16A34A" />,
      bgColor: '#F0FDF4',
      borderColor: '#DCFCE7',
      onPress: () => onNavigateTab('accounts'),
    },
    {
      title: 'Bài học đã xuất bản',
      value: `${(metrics.totalLessons || 0).toLocaleString('vi-VN')} bài / ${(metrics.totalChapters || 0).toLocaleString('vi-VN')} chương`,
      caption: `${(metrics.totalQuestions || 0).toLocaleString('vi-VN')} câu hỏi tương tác`,
      icon: <BookOpen size={22} color="#D97706" />,
      bgColor: '#FFFBEB',
      borderColor: '#FEF3C7',
      onPress: () => onNavigateTab('curriculum'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Stat Cards Grid */}
      <View style={styles.statsGrid}>
        {statCards.map((card, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.statCard,
              { backgroundColor: card.bgColor, borderColor: card.borderColor },
            ]}
            onPress={card.onPress}
            activeOpacity={0.8}
          >
            <View style={styles.statCardTop}>
              <Text style={styles.statCardTitle}>{card.title}</Text>
              <View style={styles.iconBox}>{card.icon}</View>
            </View>
            <Text style={styles.statCardValue}>{card.value}</Text>
            <View style={styles.captionRow}>
              <TrendingUp size={13} color="#16A34A" />
              <Text style={styles.statCardCaption}>{card.caption}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Management Section */}
      <View style={styles.mainSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lối tắt quản trị nhanh</Text>
        </View>

        <View style={styles.quickActionGrid}>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => onNavigateTab('curriculum')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <BookOpen size={20} color="#2563EB" />
            </View>
            <Text style={styles.quickBtnTitle}>Quản lý nội dung học</Text>
            <Text style={styles.quickBtnSub}>Soạn chương, bài học & câu hỏi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => onNavigateTab('accounts')}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <Users size={20} color="#16A34A" />
            </View>
            <Text style={styles.quickBtnTitle}>Quản lý tài khoản</Text>
            <Text style={styles.quickBtnSub}>Phụ huynh, mã PIN & hồ sơ bé</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 28,
    gap: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 230,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  iconBox: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 8,
  },
  captionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statCardCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16A34A',
  },
  mainSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    gap: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  quickBtn: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    alignItems: 'flex-start',
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  quickBtnSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
});
