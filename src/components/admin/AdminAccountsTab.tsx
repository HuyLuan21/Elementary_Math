import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react-native';
import { AdminChildProfile, AdminUserAccount } from '../../types/admin';

import { adminApi } from '../../services/adminApi';

interface AdminAccountsTabProps {
  accounts?: AdminUserAccount[];
  onToggleStatus: (userId: string) => Promise<void>;
  onResetPin: (userId: string) => Promise<void>;
  onDeleteAccount: (userId: string) => Promise<void>;
}

const AVATAR_ICONS = ['🦁', '🦄', '🐼', '🐶', '🐱', '🦊', '🐯', '🐰'];
const AVATAR_MAP: Record<string, string> = {
  '/avatars/bunny.png': '🐰',
  '/avatars/cat.png': '🐱',
  '/avatars/lion.png': '🦁',
  '/avatars/unicorn.png': '🦄',
  '/avatars/panda.png': '🐼',
  '/avatars/dog.png': '🐶',
  '/avatars/fox.png': '🦊',
  '/avatars/tiger.png': '🐯',
};

const resolveChildAvatar = (avatarIcon: string | null | undefined, index: number) => {
  if (!avatarIcon) {
    return { isImage: false, value: AVATAR_ICONS[index % AVATAR_ICONS.length] };
  }
  if (AVATAR_ICONS.includes(avatarIcon)) {
    return { isImage: false, value: avatarIcon };
  }
  if (AVATAR_MAP[avatarIcon]) {
    return { isImage: false, value: AVATAR_MAP[avatarIcon] };
  }
  if (
    avatarIcon.startsWith('http://') ||
    avatarIcon.startsWith('https://') ||
    avatarIcon.startsWith('data:')
  ) {
    return { isImage: true, value: avatarIcon };
  }
  if (avatarIcon === '/avatars/kid.png' || avatarIcon.startsWith('/avatars/')) {
    return { isImage: false, value: AVATAR_ICONS[index % AVATAR_ICONS.length] };
  }
  return {
    isImage: false,
    value: avatarIcon.length <= 4 ? avatarIcon : AVATAR_ICONS[index % AVATAR_ICONS.length],
  };
};

export const AdminAccountsTab: React.FC<AdminAccountsTabProps> = ({
  accounts: initialAccounts = [],
  onToggleStatus,
  onResetPin,
  onDeleteAccount,
}) => {
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [accountsList, setAccountsList] = useState<AdminUserAccount[]>(initialAccounts);
  const [totalAccounts, setTotalAccounts] = useState<number>(initialAccounts.length);
  const [totalPages, setTotalPages] = useState<number>(Math.max(1, Math.ceil(initialAccounts.length / 10)));
  const [isFetching, setIsFetching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserAccount | null>(null);
  const [viewProfilesModal, setViewProfilesModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchAccountsFromServer = async (
    page: number,
    status: 'all' | 'active' | 'suspended',
    search: string
  ) => {
    try {
      setIsFetching(true);
      const res = await adminApi.getAccounts({
        page,
        limit: pageSize,
        status,
        search: search.trim() || undefined,
      });

      if (res && res.data) {
        setAccountsList(res.data);
        if (res.pagination) {
          setTotalAccounts(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        } else {
          setTotalAccounts(res.data.length);
          setTotalPages(1);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch accounts:', err);
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch when page, status, or search query changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchAccountsFromServer(currentPage, statusFilter, filterText);
    }, 250);
    return () => clearTimeout(timer);
  }, [currentPage, statusFilter, filterText, pageSize]);

  const handleToggle = async (user: AdminUserAccount) => {
    try {
      setActionLoading(user.id);
      await onToggleStatus(user.id);
      await fetchAccountsFromServer(currentPage, statusFilter, filterText);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetPin = async (user: AdminUserAccount) => {
    try {
      setActionLoading(user.id);
      await onResetPin(user.id);
      Alert.alert('Thành công', `Đã đặt lại mã PIN cho tài khoản ${user.email}`);
      await fetchAccountsFromServer(currentPage, statusFilter, filterText);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (user: AdminUserAccount) => {
    try {
      setActionLoading(user.id);
      await onDeleteAccount(user.id);
      await fetchAccountsFromServer(currentPage, statusFilter, filterText);
    } finally {
      setActionLoading(null);
    }
  };

  const openProfilesDetail = (user: AdminUserAccount) => {
    setSelectedUser(user);
    setViewProfilesModal(true);
  };

  const startIndex = (currentPage - 1) * pageSize;

  return (
    <View style={styles.container}>
      {/* Header filter bar */}
      <View style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Search size={16} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo email, tên phụ huynh hoặc tên bé..."
            placeholderTextColor="#94A3B8"
            value={filterText}
            onChangeText={(t) => {
              setFilterText(t);
              setCurrentPage(1);
            }}
          />
          {filterText ? (
            <TouchableOpacity onPress={() => { setFilterText(''); setCurrentPage(1); }}>
              <X size={15} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.statusTabsGroup}>
          <TouchableOpacity
            style={[
              styles.statusTabBtn,
              statusFilter === 'all' && styles.statusTabBtnActive,
            ]}
            onPress={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.statusTabText,
                statusFilter === 'all' && styles.statusTabTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusTabBtn,
              statusFilter === 'active' && styles.statusTabBtnActive,
            ]}
            onPress={() => {
              setStatusFilter('active');
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.statusTabText,
                statusFilter === 'active' && styles.statusTabTextActive,
              ]}
            >
              Hoạt động
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.statusTabBtn,
              statusFilter === 'suspended' && styles.statusTabBtnActive,
            ]}
            onPress={() => {
              setStatusFilter('suspended');
              setCurrentPage(1);
            }}
          >
            <Text
              style={[
                styles.statusTabText,
                statusFilter === 'suspended' && styles.statusTabTextActive,
              ]}
            >
              Tạm khóa
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statCounterBadge}>
          <Text style={styles.statCounterText}>
            Tổng: <Text style={styles.statCounterBold}>{(totalAccounts || 0).toLocaleString('vi-VN')}</Text> tài khoản
          </Text>
        </View>
      </View>

      {/* Accounts Table */}
      <View style={styles.tableCard}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          <View style={styles.tableInner}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.thCol, styles.colStt, styles.alignLeft]}>
                <Text style={[styles.th, styles.textLeft]}>STT</Text>
              </View>
              <View style={[styles.thCol, styles.colUser, styles.alignLeft]}>
                <Text style={[styles.th, styles.textLeft]}>PHỤ HUYNH</Text>
              </View>
              <View style={[styles.thCol, styles.colStatus, styles.alignLeft]}>
                <Text style={[styles.th, styles.textLeft]}>TRẠNG THÁI</Text>
              </View>
              <View style={[styles.thCol, styles.colPin, styles.alignLeft]}>
                <Text style={[styles.th, styles.textLeft]}>MÃ PIN</Text>
              </View>
              <View style={[styles.thCol, styles.colChildren, styles.alignLeft]}>
                <Text style={[styles.th, styles.textLeft]}>HỒ SƠ BÉ</Text>
              </View>
              <View style={[styles.thCol, styles.colDate, styles.alignLeft]}>
                <Text style={[styles.th, styles.textLeft]}>NGÀY TẠO</Text>
              </View>
              <View style={[styles.thCol, styles.colActions, styles.alignRight]}>
                <Text style={[styles.th, styles.textRight]}>THAO TÁC</Text>
              </View>
            </View>

            {/* Table Rows */}
            <ScrollView style={styles.tableBody}>
              {accountsList.length === 0 ? (
                <View style={styles.emptyRow}>
                  <Text style={styles.emptyRowText}>
                    {isFetching ? 'Đang tải dữ liệu...' : 'Không tìm thấy tài khoản nào phù hợp với từ khóa.'}
                  </Text>
                </View>
              ) : (
                accountsList.map((user, index) => {
                  const isActive = user.status === 'active';
                  const rowStt = startIndex + index + 1;
                  return (
                    <View key={user.id} style={styles.tableRow}>
                      {/* STT */}
                      <View style={[styles.td, styles.colStt, styles.alignLeft]}>
                        <Text style={styles.sttText}>{rowStt.toLocaleString('vi-VN')}</Text>
                      </View>

                      {/* User info (Text Left) */}
                      <View style={[styles.td, styles.colUser, styles.alignLeft]}>
                        <View style={styles.userInfoRow}>
                          <View style={styles.userAvatarBox}>
                            <Text style={styles.userAvatarEmoji}>👤</Text>
                          </View>
                          <View style={styles.userTextGroup}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Status (Text Left) */}
                      <View style={[styles.td, styles.colStatus, styles.alignLeft]}>
                        <View
                          style={[
                            styles.statusPill,
                            isActive ? styles.statusActive : styles.statusSuspended,
                          ]}
                        >
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: isActive ? '#16A34A' : '#DC2626' },
                            ]}
                          />
                          <Text
                            style={[
                              styles.statusText,
                              { color: isActive ? '#16A34A' : '#DC2626' },
                            ]}
                          >
                            {isActive ? 'Hoạt động' : 'Tạm khóa'}
                          </Text>
                        </View>
                      </View>

                      {/* PIN (Text Left) */}
                      <View style={[styles.td, styles.colPin, styles.alignLeft]}>
                        <View
                          style={[
                            styles.pinPill,
                            user.hasPin ? styles.pinSet : styles.pinUnset,
                          ]}
                        >
                          <Lock size={12} color={user.hasPin ? '#2563EB' : '#94A3B8'} />
                          <Text
                            style={[
                              styles.pinText,
                              { color: user.hasPin ? '#2563EB' : '#94A3B8' },
                            ]}
                          >
                            {user.hasPin ? 'Đã cài' : 'Chưa có'}
                          </Text>
                        </View>
                      </View>

                      {/* Children profiles (Left) */}
                      <View style={[styles.td, styles.colChildren, styles.alignLeft]}>
                        <TouchableOpacity
                          style={styles.profileBadgeBtn}
                          onPress={() => openProfilesDetail(user)}
                        >
                          <Text style={styles.profileBadgeBtnText}>
                            👶 {user.profiles.length.toLocaleString('vi-VN')} bé
                          </Text>
                          <Eye size={13} color="#2563EB" />
                        </TouchableOpacity>
                      </View>

                      {/* Date (Left) */}
                      <View style={[styles.td, styles.colDate, styles.alignLeft]}>
                        <Text style={styles.dateText}>
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>

                      {/* Actions */}
                      <View style={[styles.td, styles.colActions, styles.alignRight]}>
                        <View style={styles.actionButtonsRow}>
                          {user.hasPin ? (
                            <TouchableOpacity
                              style={styles.actionIconBtn}
                              onPress={() => handleResetPin(user)}
                              accessibilityLabel="Đặt lại mã PIN"
                              activeOpacity={0.7}
                            >
                              <RotateCcw size={15} color="#D97706" />
                            </TouchableOpacity>
                          ) : null}

                          <TouchableOpacity
                            style={[
                              styles.actionIconBtn,
                              isActive ? styles.btnLock : styles.btnUnlock,
                            ]}
                            onPress={() => handleToggle(user)}
                            accessibilityLabel={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            activeOpacity={0.7}
                          >
                            {isActive ? (
                              <Ban size={15} color="#DC2626" />
                            ) : (
                              <Check size={15} color="#16A34A" />
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.actionIconBtn, styles.btnDelete]}
                            onPress={() => handleDelete(user)}
                            accessibilityLabel="Xóa tài khoản"
                            activeOpacity={0.7}
                          >
                            <Trash2 size={15} color="#DC2626" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Pagination Bar */}
        {totalAccounts > 0 && (
          <View style={styles.paginationBar}>
            <View style={styles.paginationInfoContainer}>
              <Text style={styles.paginationInfo}>
                Hiển thị{' '}
                <Text style={styles.paginationInfoBold}>
                  {startIndex + 1} - {Math.min(startIndex + pageSize, totalAccounts)}
                </Text>{' '}
                / tổng{' '}
                <Text style={styles.paginationInfoBold}>
                  {totalAccounts.toLocaleString('vi-VN')}
                </Text>{' '}
                tài khoản
              </Text>
            </View>

            <View style={styles.paginationControls}>
              <TouchableOpacity
                style={[
                  styles.pageNavBtn,
                  currentPage <= 1 && styles.pageNavBtnDisabled,
                ]}
                disabled={currentPage <= 1}
                onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                activeOpacity={0.7}
              >
                <ChevronLeft
                  size={16}
                  color={currentPage <= 1 ? '#94A3B8' : '#334155'}
                />
                <Text
                  style={[
                    styles.pageNavBtnText,
                    currentPage <= 1 && styles.pageNavBtnTextDisabled,
                  ]}
                >
                  Trước
                </Text>
              </TouchableOpacity>

              <View style={styles.pagePillsGroup}>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - currentPage) <= 2;
                  })
                  .map((p, idx, arr) => {
                    const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
                    const isActive = currentPage === p;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsisBefore && (
                          <Text style={styles.pageEllipsis}>•••</Text>
                        )}
                        <TouchableOpacity
                          style={[
                            styles.pageNumberBtn,
                            isActive && styles.pageNumberBtnActive,
                          ]}
                          onPress={() => setCurrentPage(p)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.pageNumberText,
                              isActive && styles.pageNumberTextActive,
                            ]}
                          >
                            {p}
                          </Text>
                        </TouchableOpacity>
                      </React.Fragment>
                    );
                  })}
              </View>

              <TouchableOpacity
                style={[
                  styles.pageNavBtn,
                  currentPage >= totalPages && styles.pageNavBtnDisabled,
                ]}
                disabled={currentPage >= totalPages}
                onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pageNavBtnText,
                    currentPage >= totalPages && styles.pageNavBtnTextDisabled,
                  ]}
                >
                  Sau
                </Text>
                <ChevronRight
                  size={16}
                  color={currentPage >= totalPages ? '#94A3B8' : '#334155'}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Child Profiles Detail Modal */}
      <Modal
        visible={viewProfilesModal}
        transparent
        animationType="fade"
        onRequestClose={() => setViewProfilesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Hồ sơ bé của {selectedUser?.name}
                </Text>
                <Text style={styles.modalSubtitle}>{selectedUser?.email}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setViewProfilesModal(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {selectedUser?.profiles.length === 0 ? (
                <View style={styles.emptyProfiles}>
                  <Text style={styles.emptyProfilesText}>
                    Phụ huynh này chưa tạo hồ sơ bé nào.
                  </Text>
                </View>
              ) : (
                <View style={styles.profilesGrid}>
                  {selectedUser?.profiles.map((child, index) => {
                    const avatar = resolveChildAvatar(child.avatarIcon, index);

                    return (
                      <View key={child.id} style={styles.childCard}>
                        <View style={styles.childHeader}>
                          <View style={styles.childAvatar}>
                            {avatar.isImage ? (
                              <Image
                                source={{ uri: avatar.value }}
                                style={styles.childAvatarImg}
                                resizeMode="cover"
                              />
                            ) : (
                              <Text style={styles.childAvatarEmoji}>
                                {avatar.value}
                              </Text>
                            )}
                          </View>
                          <View style={styles.childMeta}>
                            <Text style={styles.childName}>{child.displayName}</Text>
                          </View>
                        </View>

                        <View style={styles.childStatsRow}>
                          <View style={styles.childStatItem}>
                            <Text style={styles.childStatVal}>
                              ⭐ {Number(child.totalStars || 0).toLocaleString('vi-VN')}
                            </Text>
                            <Text style={styles.childStatLbl}>Sao</Text>
                          </View>
                          <View style={styles.childStatItem}>
                            <Text style={styles.childStatVal}>
                              📚 {Number(child.completedLessons || 0).toLocaleString('vi-VN')}
                            </Text>
                            <Text style={styles.childStatLbl}>Bài học</Text>
                          </View>
                          <View style={styles.childStatItem}>
                            <Text style={styles.childStatVal}>
                              📅 {Number(child.learningDays || 0).toLocaleString('vi-VN')}
                            </Text>
                            <Text style={styles.childStatLbl}>Ngày học</Text>
                          </View>
                          <View style={styles.childStatItem}>
                            <Text style={styles.childStatVal}>
                              🎖️ {Number(child.badgeCount || 0).toLocaleString('vi-VN')}
                            </Text>
                            <Text style={styles.childStatLbl}>Huy hiệu</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 28,
    gap: 20,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    height: 42,
    width: 360,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  statusTabsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  statusTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  statusTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  statCounterBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statCounterText: {
    fontSize: 13,
    color: '#1E40AF',
  },
  statCounterBold: {
    fontWeight: '800',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  horizontalScrollContent: {
    minWidth: '100%',
  },
  tableInner: {
    minWidth: 880,
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  th: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableBody: {
    maxHeight: 520,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 14,
    paddingHorizontal: 18,
    position: 'relative',
    overflow: 'visible',
  },
  thCol: {
    justifyContent: 'center',
  },
  td: {
    justifyContent: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textLeft: { textAlign: 'left' },
  textRight: { textAlign: 'right' },
  alignLeft: { alignItems: 'flex-start' },
  alignRight: { alignItems: 'flex-end' },
  colStt: { width: 56, minWidth: 56, paddingRight: 16 },
  sttText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'left',
  },
  colUser: { flex: 2.2, minWidth: 200, paddingRight: 16 },
  colChildren: { flex: 1.2, minWidth: 110, paddingRight: 16 },
  colStatus: { flex: 1.1, minWidth: 100, paddingRight: 16 },
  colPin: { flex: 0.9, minWidth: 90, paddingRight: 16 },
  colDate: { flex: 1.1, minWidth: 100, paddingRight: 16 },
  colActions: { flex: 1.3, minWidth: 120, alignItems: 'flex-end', overflow: 'visible' },

  userAvatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarEmoji: {
    fontSize: 18,
  },
  userTextGroup: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  profileBadgeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusActive: {
    backgroundColor: '#DCFCE7',
  },
  statusSuspended: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  pinSet: {
    backgroundColor: '#EFF6FF',
  },
  pinUnset: {
    backgroundColor: '#F1F5F9',
  },
  pinText: {
    fontSize: 11,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: '#64748B',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnLock: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  btnUnlock: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  btnDelete: {
    borderColor: '#E2E8F0',
  },
  emptyRow: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRowText: {
    fontSize: 14,
    color: '#64748B',
  },

  // Pagination Styles
  paginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 12,
  },
  paginationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paginationInfo: {
    fontSize: 13,
    color: '#64748B',
  },
  paginationInfoBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageNavBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
    opacity: 0.5,
  },
  pageNavBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  pageNavBtnTextDisabled: {
    color: '#94A3B8',
  },
  pagePillsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageNumberBtn: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pageNumberBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  pageNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  pageEllipsis: {
    fontSize: 11,
    color: '#94A3B8',
    paddingHorizontal: 4,
    letterSpacing: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalContent: {
    padding: 20,
  },
  emptyProfiles: {
    padding: 24,
    alignItems: 'center',
  },
  emptyProfilesText: {
    color: '#64748B',
    fontSize: 13,
  },
  profilesGrid: {
    gap: 12,
  },
  childCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  childAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  childAvatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  childAvatarEmoji: {
    fontSize: 22,
  },
  childMeta: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  childStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  childStatItem: {
    alignItems: 'center',
  },
  childStatVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  childStatLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
