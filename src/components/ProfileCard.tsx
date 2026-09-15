import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { UserProfile } from '../types/auth';

interface ProfileCardProps {
  profile: UserProfile;
  isEditMode?: boolean;
  onPress: (profile: UserProfile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  isEditMode = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => onPress(profile)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarBox, { backgroundColor: profile.avatarColor }]}>
        <Text style={styles.avatarEmoji}>{profile.avatarIcon}</Text>

        {profile.role === 'parent' && (
          <View style={styles.parentBadge}>
            <Text style={styles.parentBadgeText}>🔒 PHỤ HUYNH</Text>
          </View>
        )}

        {profile.role === 'child' && profile.grade && (
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeBadgeText}>{profile.grade}</Text>
          </View>
        )}

        {isEditMode && (
          <View style={styles.editOverlay}>
            <Text style={styles.editOverlayText}>✏️</Text>
          </View>
        )}
      </View>

      <Text style={styles.profileName} numberOfLines={1}>
        {profile.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    alignItems: 'center',
    marginHorizontal: 14,
    marginBottom: 28,
    width: 110,
  },
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  parentBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#312E81',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  parentBadgeText: {
    color: '#EEF2FF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  gradeBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#065F46',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  gradeBadgeText: {
    color: '#ECFDF5',
    fontSize: 9,
    fontWeight: 'bold',
  },
  editOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editOverlayText: {
    fontSize: 28,
  },
  profileName: {
    color: '#8C8C8C',
    fontSize: 14,
    marginTop: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
