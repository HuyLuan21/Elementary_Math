import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, Pencil, Star } from 'lucide-react-native';
import { UserProfile } from '../types/auth';

interface ProfileCardProps {
  profile: UserProfile;
  isEditMode?: boolean;
  isSelected?: boolean;
  onPress: (profile: UserProfile) => void;
  onEdit?: (profile: UserProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isEditMode = false,
  isSelected = false,
  onPress,
  onEdit,
}) => {
  const age = getAge(profile.birthDate);

  return (
    <View
      style={[
        styles.profileCard,
        isSelected && styles.profileCardSelected,
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.cardBody,
          pressed && styles.profileCardPressed,
        ]}
        onPress={() => onPress(profile)}
        accessibilityRole="button"
        accessibilityLabel={`Chọn hồ sơ ${profile.name}`}
      >
        <View style={styles.cardTopRow}>
          <View style={[styles.avatarBox, { backgroundColor: profile.avatarColor }]}>
            <Text style={styles.avatarEmoji}>{profile.avatarIcon}</Text>
            {isSelected && (
              <View style={styles.selectedMark}>
                <Check size={13} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName} numberOfLines={1}>
            {profile.name}
          </Text>
          <Text style={styles.profileMeta} numberOfLines={1}>
            {profile.role === 'parent'
              ? 'Phụ huynh'
              : age !== null
                ? `${age} tuổi`
                : 'Hồ sơ học tập'}
          </Text>
          {profile.role === 'child' && profile.totalStars != null && profile.totalStars > 0 ? (
            <View style={styles.starsRow}>
              <Star size={14} color="#E3A900" fill="#FFC928" />
              <Text style={styles.starsText}>{profile.totalStars} ngôi sao</Text>
            </View>
          ) : null}
        </View>

        {isSelected ? <Text style={styles.selectedLabel}>Đang học</Text> : null}
      </Pressable>

      {(onEdit && profile.role === 'child') || isEditMode ? (
        <Pressable
          style={styles.editButton}
          onPress={() => onEdit?.(profile)}
          accessibilityRole="button"
          accessibilityLabel={`Sửa hồ sơ ${profile.name}`}
          hitSlop={8}
        >
          <Pencil size={16} color="#6B7280" />
        </Pressable>
      ) : null}
    </View>
  );
};

const getAge = (birthDate?: string | null): number | null => {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const birthdayHasPassed =
    now.getMonth() > date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() >= date.getDate());
  if (!birthdayHasPassed) age -= 1;
  return age >= 0 ? age : null;
};

const styles = StyleSheet.create({
  profileCard: {
    minHeight: 148,
    flexBasis: 260,
    flexGrow: 1,
    margin: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE5EC',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  profileCardSelected: {
    borderColor: '#35A9E0',
    borderWidth: 2,
    backgroundColor: '#F3FAFE',
  },
  profileCardPressed: {
    opacity: 0.85,
  },
  cardBody: {
    flex: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardTopRow: {
    position: 'relative',
  },
  avatarBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 40,
  },
  selectedMark: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#35A9E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F4F7FB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
  },
  profileMeta: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 4,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  starsText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  selectedLabel: {
    color: '#1682B5',
    fontSize: 11,
    fontWeight: '700',
    alignSelf: 'flex-start',
    backgroundColor: '#DFF3FC',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
});
