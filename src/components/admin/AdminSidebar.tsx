import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Award,
  BookOpen,
  ChevronRight,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AdminTab } from '../../types/admin';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  metrics: {
    totalAccounts: number;
    totalLessons: number;
    totalBadges: number;
  };
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  metrics,
}) => {
  const router = useRouter();

  const menuItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: (
        <LayoutDashboard
          size={19}
          color={activeTab === 'overview' ? '#2563EB' : '#64748B'}
        />
      ),
    },
    {
      id: 'accounts',
      label: 'Tài khoản & Bé',
      icon: (
        <Users
          size={19}
          color={activeTab === 'accounts' ? '#2563EB' : '#64748B'}
        />
      ),
      badge: metrics.totalAccounts,
    },
    {
      id: 'curriculum',
      label: 'Nội dung học tập',
      icon: (
        <BookOpen
          size={19}
          color={activeTab === 'curriculum' ? '#2563EB' : '#64748B'}
        />
      ),
      badge: metrics.totalLessons,
    },
    {
      id: 'badges',
      label: 'Huy hiệu & Thưởng',
      icon: (
        <Award
          size={19}
          color={activeTab === 'badges' ? '#2563EB' : '#64748B'}
        />
      ),
      badge: metrics.totalBadges,
    },
  ];

  return (
    <View style={styles.sidebar}>
      {/* Brand Logo */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoEmoji}>📐</Text>
        </View>
        <View style={styles.brandTextGroup}>
          <Text style={styles.brandName}>E-MATH</Text>
          <Text style={styles.brandSubtitle}>Admin Portal</Text>
        </View>
      </View>

      {/* Nav Menu */}
      <View style={styles.navGroup}>
        <Text style={styles.navHeading}>QUẢN TRỊ VIÊN</Text>
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => onSelectTab(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text
                  style={[styles.menuItemText, isActive && styles.menuItemTextActive]}
                >
                  {item.label}
                </Text>
              </View>
              {item.badge !== undefined ? (
                <View
                  style={[
                    styles.countPill,
                    isActive && styles.countPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countPillText,
                      isActive && styles.countPillTextActive,
                    ]}
                  >
                    {(item.badge || 0).toLocaleString('vi-VN')}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backAppBtn}
          onPress={() => router.replace('/profiles')}
          activeOpacity={0.7}
        >
          <Home size={17} color="#475569" />
          <Text style={styles.backAppText}>Về trang học sinh</Text>
          <ChevronRight size={15} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.adminUserCard}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>🛡️</Text>
          </View>
          <View style={styles.adminUserInfo}>
            <Text style={styles.adminName}>Super Admin</Text>
            <Text style={styles.adminRole}>admin@emath.edu.vn</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingBottom: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 22,
  },
  brandTextGroup: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '700',
    marginTop: 1,
  },
  navGroup: {
    flex: 1,
    paddingTop: 20,
    gap: 6,
  },
  navHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#EFF6FF',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  menuItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  countPillActive: {
    backgroundColor: '#DBEAFE',
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  countPillTextActive: {
    color: '#1D4ED8',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  backAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backAppText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  adminUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  adminAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarText: {
    fontSize: 18,
  },
  adminUserInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  adminRole: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
});
