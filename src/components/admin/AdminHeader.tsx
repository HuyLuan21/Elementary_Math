import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Bell, RefreshCw, Search, Shield } from 'lucide-react-native';
import { AdminTab } from '../../types/admin';

interface AdminHeaderProps {
  activeTab: AdminTab;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

const TAB_TITLES: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Tổng quan hệ thống',
    subtitle: 'Theo dõi toàn bộ các chỉ số vận hành và tương tác học tập',
  },
  accounts: {
    title: 'Quản lý Tài khoản & Hồ sơ bé',
    subtitle: 'Danh sách tài khoản phụ huynh, bảo mật mã PIN và hồ sơ học sinh',
  },
  curriculum: {
    title: 'Quản lý Nội dung học tập',
    subtitle: 'Soạn thảo Chương, Bài học, Câu hỏi và Bài tập tương tác',
  },
  settings: {
    title: 'Cài đặt hệ thống',
    subtitle: 'Cấu hình chung và quyền hạn quản trị',
  },
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  searchQuery,
  onSearchChange,
  onRefresh,
  isRefreshing,
}) => {
  const current = TAB_TITLES[activeTab];

  return (
    <View style={styles.header}>
      <View style={styles.titleArea}>
        <View style={styles.breadcrumbRow}>
          <Shield size={13} color="#3B82F6" />
          <Text style={styles.breadcrumb}>Bảng điều khiển / </Text>
          <Text style={styles.breadcrumbActive}>{current.title}</Text>
        </View>
        <Text style={styles.mainTitle}>{current.title}</Text>
        <Text style={styles.mainSubtitle}>{current.subtitle}</Text>
      </View>

      <View style={styles.actionsArea}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm nhanh..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={[styles.actionBtn, isRefreshing && styles.actionBtnActive]}
          onPress={onRefresh}
          disabled={isRefreshing}
          accessibilityLabel="Làm mới dữ liệu"
        >
          <RefreshCw
            size={16}
            color={isRefreshing ? '#3B82F6' : '#64748B'}
          />
        </TouchableOpacity>

        {/* Notification indicator */}
        <View style={styles.actionBtn}>
          <Bell size={16} color="#64748B" />
          <View style={styles.notifDot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    flexWrap: 'wrap',
  },
  titleArea: {
    flex: 1,
    minWidth: 280,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  breadcrumb: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  breadcrumbActive: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '700',
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  actionsArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 40,
    width: 240,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
});
