import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { UserProfile } from '../types/auth';

interface ProfileSelectionScreenProps {
  userEmail: string;
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile) => void;
  onAddProfileRequest: () => void;
  onSignOut: () => void;
}

export const ProfileSelectionScreen: React.FC<ProfileSelectionScreenProps> = ({
  userEmail,
  profiles,
  onSelectProfile,
  onAddProfileRequest,
  onSignOut,
}) => {
  const [selectedParentProfile, setSelectedParentProfile] = useState<UserProfile | null>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  const handleProfileClick = (profile: UserProfile) => {
    if (isEditMode) {
      Alert.alert('Chỉnh sửa Hồ sơ', `Chỉnh sửa thông tin của: ${profile.name}`);
      return;
    }

    if (profile.role === 'parent') {
      // Open PIN verification modal for parent profile
      setSelectedParentProfile(profile);
      setPinInput('');
      setPinError('');
      setPinModalVisible(true);
    } else {
      // Directly select student profile
      onSelectProfile(profile);
    }
  };

  const handleVerifyPin = () => {
    if (!selectedParentProfile) return;
    const requiredPin = selectedParentProfile.pinCode || '1234';

    if (pinInput === requiredPin) {
      setPinModalVisible(false);
      onSelectProfile(selectedParentProfile);
    } else {
      setPinError('Mã PIN không đúng!Vui lòng thử lại (Gợi ý: 1234)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Navbar Header */}
      <View style={styles.navBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>NETFLIX</Text>
          <View style={styles.mathBadge}>
            <Text style={styles.mathBadgeText}>MATH KIDS</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditMode(!isEditMode)}
        >
          <Text style={styles.editBtnText}>
            {isEditMode ? 'Xong' : 'Quản lý hồ sơ'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Ai đang học?</Text>
        <Text style={styles.accountSubText}>Tài khoản: {userEmail}</Text>

        {/* Profiles Grid */}
        <View style={styles.gridContainer}>
          {profiles.map((profile) => (
            <TouchableOpacity
              key={profile.id}
              style={styles.profileCard}
              onPress={() => handleProfileClick(profile)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.avatarBox,
                  { backgroundColor: profile.avatarColor },
                ]}
              >
                <Text style={styles.avatarEmoji}>{profile.avatarIcon}</Text>

                {/* Parent Lock Badge */}
                {profile.role === 'parent' && (
                  <View style={styles.parentBadge}>
                    <Text style={styles.parentBadgeText}>🔒 PHỤ HUYNH</Text>
                  </View>
                )}

                {/* Grade Badge for kids */}
                {profile.role === 'child' && profile.grade && (
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeBadgeText}>{profile.grade}</Text>
                  </View>
                )}

                {/* Edit overlay icon */}
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
          ))}

          {/* Add Profile Card */}
          <TouchableOpacity
            style={styles.profileCard}
            onPress={onAddProfileRequest}
            activeOpacity={0.7}
          >
            <View style={[styles.avatarBox, styles.addAvatarBox]}>
              <Text style={styles.plusIcon}>+</Text>
            </View>
            <Text style={styles.profileName}>Thêm hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Sign Out Link */}
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
          <Text style={styles.signOutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Parent PIN Code Modal */}
      <Modal
        visible={pinModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalLockEmoji}>🛡️</Text>
            <Text style={styles.modalTitle}>Xác thực Phụ huynh</Text>
            <Text style={styles.modalSubtitle}>
              Nhập mã PIN 4 chữ số để vào khu vực quản lý dành cho cha mẹ.
            </Text>

            {pinError ? (
              <Text style={styles.pinErrorText}>{pinError}</Text>
            ) : null}

            <TextInput
              style={styles.pinInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry={true}
              value={pinInput}
              onChangeText={(text) => {
                setPinInput(text);
                setPinError('');
              }}
              placeholder="• • • •"
              placeholderTextColor="#666"
              autoFocus={true}
            />

            <Text style={styles.pinHint}>Mã PIN mặc định: 1234</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setPinModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmModalBtn}
                onPress={handleVerifyPin}
              >
                <Text style={styles.confirmModalText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    color: '#E50914',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  mathBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  mathBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  editBtn: {
    borderWidth: 1,
    borderColor: '#737373',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editBtnText: {
    color: '#E5E5E5',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  accountSubText: {
    color: '#8C8C8C',
    fontSize: 14,
    marginBottom: 36,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 500,
  },
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
  addAvatarBox: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#404040',
    borderStyle: 'dashed',
  },
  avatarEmoji: {
    fontSize: 48,
  },
  plusIcon: {
    color: '#737373',
    fontSize: 42,
    fontWeight: '300',
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
  signOutBtn: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: {
    color: '#737373',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalLockEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalSubtitle: {
    color: '#A0A0A0',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  pinErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  pinInput: {
    backgroundColor: '#141414',
    borderRadius: 8,
    width: 160,
    height: 50,
    color: '#FFFFFF',
    fontSize: 24,
    letterSpacing: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#404040',
    marginBottom: 10,
  },
  pinHint: {
    color: '#666666',
    fontSize: 11,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelModalText: {
    color: '#E5E5E5',
    fontWeight: 'bold',
  },
  confirmModalBtn: {
    flex: 1,
    backgroundColor: '#E50914',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 8,
  },
  confirmModalText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
