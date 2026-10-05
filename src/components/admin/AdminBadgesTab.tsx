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
  Award,
  Check,
  Edit3,
  Flame,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
  Zap,
} from 'lucide-react-native';
import { AdminBadge } from '../../types/admin';
import { AdminTooltipButton } from './AdminTooltipButton';

interface AdminBadgesTabProps {
  badges: AdminBadge[];
  onSaveBadge: (badge: Partial<AdminBadge>) => Promise<void>;
  onDeleteBadge: (badgeId: string) => Promise<void>;
}

const BADGE_ICON_MAP: Record<string, string> = {
  '/badges/first-lesson.png': '🚀',
  '/badges/color.png': '🎨',
  '/badges/shape.png': '🔷',
  '/badges/number.png': '🔢',
  '/badges/compare.png': '⚖️',
  '/badges/time.png': '⏰',
  '/badges/streak-7.png': '🔥',
  '/badges/streak-30.png': '⚡',
  '/badges/ten-lessons.png': '🏅',
  '/badges/hundred-stars.png': '⭐',
};

const resolveBadgeIcon = (icon: string | null | undefined) => {
  if (!icon) return { isImage: false, value: '🏆' };
  if (BADGE_ICON_MAP[icon]) {
    return { isImage: false, value: BADGE_ICON_MAP[icon] };
  }
  if (
    icon.startsWith('http://') ||
    icon.startsWith('https://') ||
    icon.startsWith('data:')
  ) {
    return { isImage: true, value: icon };
  }
  if (icon.startsWith('/badges/') || icon.startsWith('/')) {
    if (icon.includes('lesson')) return { isImage: false, value: '📚' };
    if (icon.includes('streak') || icon.includes('fire')) return { isImage: false, value: '🔥' };
    if (icon.includes('star')) return { isImage: false, value: '⭐' };
    if (icon.includes('color')) return { isImage: false, value: '🎨' };
    if (icon.includes('shape')) return { isImage: false, value: '🔷' };
    if (icon.includes('number')) return { isImage: false, value: '🔢' };
    if (icon.includes('time')) return { isImage: false, value: '⏰' };
    if (icon.includes('compare')) return { isImage: false, value: '⚖️' };
    return { isImage: false, value: '🏆' };
  }
  return { isImage: false, value: icon };
};

const RARITY_COLORS: Record<AdminBadge['rarity'], { bg: string; text: string; label: string }> = {
  common: { bg: '#F1F5F9', text: '#475569', label: 'Phổ biến' },
  rare: { bg: '#EFF6FF', text: '#2563EB', label: 'Hiếm' },
  epic: { bg: '#FAF5FF', text: '#9333EA', label: 'Sử thi' },
  legendary: { bg: '#FFFBEB', text: '#D97706', label: 'Huyền thoại' },
};

const CATEGORY_NAMES: Record<AdminBadge['category'], string> = {
  lesson: 'Bài học',
  streak: 'Chuỗi ngày',
  stars: 'Thu thập sao',
  special: 'Đặc biệt',
};

export const AdminBadgesTab: React.FC<AdminBadgesTabProps> = ({
  badges,
  onSaveBadge,
  onDeleteBadge,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBadge, setEditingBadge] = useState<AdminBadge | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '🏆',
    category: 'lesson' as AdminBadge['category'],
    requiredCount: '1',
    rewardPoints: '20',
    rarity: 'common' as AdminBadge['rarity'],
  });

  const categories = [
    { id: 'all', label: 'Tất cả' },
    { id: 'lesson', label: 'Bài học' },
    { id: 'streak', label: 'Chuỗi ngày' },
    { id: 'stars', label: 'Thu thập sao' },
    { id: 'special', label: 'Đặc biệt' },
  ];

  const filteredBadges =
    selectedCategory === 'all'
      ? badges
      : badges.filter((b) => b.category === selectedCategory);

  const openAddModal = () => {
    setEditingBadge(null);
    setForm({
      name: '',
      description: '',
      icon: '🏆',
      category: 'lesson',
      requiredCount: '5',
      rewardPoints: '30',
      rarity: 'common',
    });
    setModalVisible(true);
  };

  const openEditModal = (badge: AdminBadge) => {
    const iconData = resolveBadgeIcon(badge.icon);
    setEditingBadge(badge);
    setForm({
      name: badge.name,
      description: badge.description,
      icon: iconData.value,
      category: badge.category,
      requiredCount: String(badge.requiredCount),
      rewardPoints: String(badge.rewardPoints),
      rarity: badge.rarity,
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên huy hiệu');
      return;
    }
    await onSaveBadge({
      ...(editingBadge ? { id: editingBadge.id } : {}),
      name: form.name,
      description: form.description,
      icon: form.icon,
      category: form.category,
      requiredCount: Number(form.requiredCount) || 1,
      rewardPoints: Number(form.rewardPoints) || 10,
      rarity: form.rarity,
    });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Top Filter Bar */}
      <View style={styles.topRow}>
        <View style={styles.categoryPills}>
          {categories.map((c) => {
            const isActive = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.catPill, isActive && styles.catPillActive]}
                onPress={() => setSelectedCategory(c.id)}
              >
                <Text
                  style={[
                    styles.catPillText,
                    isActive && styles.catPillTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.addBtnText}>Thêm huy hiệu</Text>
        </TouchableOpacity>
      </View>

      {/* Badges Grid */}
      <ScrollView style={styles.gridScrollView}>
        <View style={styles.badgesGrid}>
          {filteredBadges.map((badge) => {
            const rarity = RARITY_COLORS[badge.rarity];
            const iconData = resolveBadgeIcon(badge.icon);
            return (
              <View key={badge.id} style={styles.badgeCard}>
                <View style={styles.cardTop}>
                  <View style={styles.badgeIconCircle}>
                    {iconData.isImage ? (
                      <Image
                        source={{ uri: iconData.value }}
                        style={styles.badgeImg}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.badgeEmoji}>{iconData.value}</Text>
                    )}
                  </View>
                  <View
                    style={[styles.rarityPill, { backgroundColor: rarity.bg }]}
                  >
                    <Text
                      style={[styles.rarityPillText, { color: rarity.text }]}
                    >
                      {rarity.label}
                    </Text>
                  </View>
                </View>

                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeDesc} numberOfLines={2}>
                  {badge.description}
                </Text>

                <View style={styles.criteriaBox}>
                  <Text style={styles.criteriaLabel}>Điều kiện:</Text>
                  <Text style={styles.criteriaVal}>
                    {CATEGORY_NAMES[badge.category]}: Đạt {(badge.requiredCount || 0).toLocaleString('vi-VN')}
                  </Text>
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.rewardBox}>
                    <Text style={styles.rewardText}>
                      🎁 +{(badge.rewardPoints || 0).toLocaleString('vi-VN')} điểm
                    </Text>
                    <Text style={styles.unlockedCountText}>
                      🔓 {(badge.unlockedCount || 0).toLocaleString('vi-VN')} bé đã đạt
                    </Text>
                  </View>

                  <View style={styles.cardActions}>
                    <AdminTooltipButton
                      tooltip="Sửa huy hiệu"
                      style={styles.actionBtn}
                      onPress={() => openEditModal(badge)}
                    >
                      <Edit3 size={14} color="#2563EB" />
                    </AdminTooltipButton>
                    <AdminTooltipButton
                      tooltip="Xóa huy hiệu"
                      style={[styles.actionBtn, styles.actionDelete]}
                      onPress={() => onDeleteBadge(badge.id)}
                    >
                      <Trash2 size={14} color="#DC2626" />
                    </AdminTooltipButton>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Badge Form Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBadge ? 'Sửa huy hiệu' : 'Tạo huy hiệu mới'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalVisible(false)}
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.formLabel}>Tên huy hiệu</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Ví dụ: Thần đồng tính nhẩm"
                value={form.name}
                onChangeText={(t) => setForm((prev) => ({ ...prev, name: t }))}
              />

              <Text style={styles.formLabel}>Mô tả ý nghĩa</Text>
              <TextInput
                style={[styles.formInput, styles.formTextarea]}
                placeholder="Ví dụ: Hoàn thành xuất sắc 10 bài học liên tiếp..."
                multiline
                numberOfLines={2}
                value={form.description}
                onChangeText={(t) =>
                  setForm((prev) => ({ ...prev, description: t }))
                }
              />

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Icon / Emoji</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="🏆"
                    value={form.icon}
                    onChangeText={(t) =>
                      setForm((prev) => ({ ...prev, icon: t }))
                    }
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Số lượng yêu cầu</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="number-pad"
                    placeholder="10"
                    value={form.requiredCount}
                    onChangeText={(t) =>
                      setForm((prev) => ({ ...prev, requiredCount: t }))
                    }
                  />
                </View>

                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Điểm thưởng</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="number-pad"
                    placeholder="50"
                    value={form.rewardPoints}
                    onChangeText={(t) =>
                      setForm((prev) => ({ ...prev, rewardPoints: t }))
                    }
                  />
                </View>
              </View>

              {/* Rarity selector */}
              <Text style={styles.formLabel}>Độ hiếm</Text>
              <View style={styles.rarityOptionsRow}>
                {(['common', 'rare', 'epic', 'legendary'] as const).map((r) => {
                  const isSelected = form.rarity === r;
                  const item = RARITY_COLORS[r];
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.rarityOption,
                        isSelected && styles.rarityOptionActive,
                      ]}
                      onPress={() => setForm((prev) => ({ ...prev, rarity: r }))}
                    >
                      <Text
                        style={[
                          styles.rarityOptionText,
                          isSelected && { color: item.text, fontWeight: '800' },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={[styles.formSubmitBtn, { marginTop: 20 }]}
                onPress={handleSave}
              >
                <Text style={styles.formSubmitText}>Lưu huy hiệu</Text>
              </TouchableOpacity>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryPills: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 4,
    gap: 4,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  catPillActive: {
    backgroundColor: '#EFF6FF',
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  catPillTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridScrollView: {
    maxHeight: 650,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  badgeCard: {
    flexBasis: 280,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  rarityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgeDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  criteriaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  criteriaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  criteriaVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginTop: 4,
  },
  rewardBox: {
    gap: 2,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  unlockedCountText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionDelete: {
    backgroundColor: '#FEE2E2',
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
    maxWidth: 520,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  formTextarea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 6,
  },
  rarityOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rarityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  rarityOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  rarityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  formSubmitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSubmitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
