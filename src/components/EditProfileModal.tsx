import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ProfileInput, UserProfile } from '../types/auth';
import { Check } from 'lucide-react-native';

interface EditProfileModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (profileId: string | null, profile: ProfileInput) => Promise<void>;
  onDelete: (profileId: string) => Promise<void>;
}

const EMOJI_OPTIONS = ['🦁', '🦄', '🐼', '🐶', '🐱', '🦊', '🐯', '🐰'];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🦁');
  const [birthDate, setBirthDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(profile?.name || '');
    setSelectedEmoji(profile?.avatarIcon || '🦁');
    setBirthDate(profile?.birthDate?.slice(0, 10) || '');
    setFormError('');
  }, [profile, visible]);

  if (!visible) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên bé.');
      return;
    }
    const birthDateError = getBirthDateError(birthDate);
    if (birthDateError) {
      setFormError(birthDateError);
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      await onSave(profile?.id ?? null, {
        display_name: name.trim(),
        avatar_url: selectedEmoji,
        birth_date: birthDate || null,
      });
      onClose();
    } catch (error: unknown) {
      setFormError(error instanceof Error ? error.message : 'Không thể lưu hồ sơ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!profile) return;
    Alert.alert(
      'Xóa hồ sơ',
      `Bạn có chắc muốn xóa hồ sơ của bé ${profile.name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await onDelete(profile.id);
              onClose();
            } catch (error: unknown) {
              setFormError(error instanceof Error ? error.message : 'Không thể xóa hồ sơ.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <ScrollView
          contentContainerStyle={styles.overlayContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={styles.avatarPreviewBox}>
              <Text style={styles.avatarPreviewEmoji}>{selectedEmoji}</Text>
            </View>
            <Text style={styles.title}>{profile ? 'Sửa hồ sơ bé' : 'Thêm bé'}</Text>
            <Text style={styles.subtitle}>Tạo một góc học tập thật riêng cho bé</Text>

            <Text style={styles.sectionLabel}>Chọn avatar</Text>
            <View style={styles.emojiRow}>
              {EMOJI_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiBtn,
                    selectedEmoji === emoji && styles.emojiBtnSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                  accessibilityRole="button"
                  accessibilityLabel={`Chọn avatar ${emoji}`}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                  {selectedEmoji === emoji ? (
                    <View style={styles.avatarCheck}>
                      <Check size={10} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Tên bé</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={(value) => {
                setName(value);
                setFormError('');
              }}
              placeholder="Ví dụ: Minh Anh"
              placeholderTextColor="#9AA5B1"
              maxLength={30}
              autoCapitalize="words"
              returnKeyType="next"
            />

            <Text style={styles.sectionLabel}>Ngày sinh <Text style={styles.optionalLabel}>· Không bắt buộc</Text></Text>
            <TextInput
              style={styles.input}
              value={birthDate}
              onChangeText={(value) => {
                setBirthDate(value);
                setFormError('');
              }}
              onBlur={() => setFormError(getBirthDateError(birthDate) || '')}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9AA5B1"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />

            {formError ? <Text style={styles.errorText}>{formError}</Text> : null}

            <View style={styles.btnRow}>
              {profile?.role === 'child' ? (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  disabled={isSaving}
                >
                  <Text style={styles.deleteBtnText}>Xóa hồ sơ</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isSaving}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? <ActivityIndicator color="#FFFFFF" size="small" /> : null}
                <Text style={styles.saveBtnText}>
                  {isSaving ? 'Đang lưu' : profile ? 'Lưu thay đổi' : 'Thêm bé'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const getBirthDateError = (value: string): string | null => {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'Nhập ngày sinh theo định dạng YYYY-MM-DD.';
  }
  const [year, month, day] = value.split('-').map(Number);
  const parsedDate = new Date(year, month - 1, day);
  const isCalendarDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;
  if (!isCalendarDate) return 'Ngày sinh không hợp lệ.';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parsedDate > today) return 'Ngày sinh không thể ở tương lai.';
  return null;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDE5EC',
    alignItems: 'center',
    alignSelf: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 5,
    marginBottom: 20,
  },
  avatarPreviewBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF2C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#35A9E0',
  },
  avatarPreviewEmoji: {
    fontSize: 38,
  },
  sectionLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 7,
    marginTop: 12,
  },
  optionalLabel: {
    color: '#9AA5B1',
    fontWeight: '400',
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    gap: 10,
  },
  emojiBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F4F7FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDE5EC',
    position: 'relative',
  },
  emojiBtnSelected: {
    borderColor: '#35A9E0',
    borderWidth: 2,
    backgroundColor: '#EAF7FD',
  },
  avatarCheck: {
    position: 'absolute',
    right: -2,
    bottom: -1,
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: '#35A9E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 23,
  },
  input: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#DDE5EC',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#111827',
    fontSize: 15,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 22,
  },
  cancelBtn: {
    minWidth: 70,
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 9,
    backgroundColor: '#EFF3F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 9,
    backgroundColor: '#35A9E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.65,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 13,
    borderRadius: 9,
    backgroundColor: '#FCE8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#EF5350',
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    color: '#D64545',
    alignSelf: 'flex-start',
    fontSize: 13,
    marginTop: 10,
  },
});
