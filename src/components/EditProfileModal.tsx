import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { UserProfile } from '../types/auth';

interface EditProfileModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSave: (profileId: string, name: string, avatarIcon?: string) => Promise<void>;
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setSelectedEmoji(profile.avatarIcon || '🦁');
    }
  }, [profile]);

  if (!profile) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Tên học viên không được để trống');
      return;
    }

    setIsSaving(true);
    try {
      await onSave(profile.id, name.trim(), selectedEmoji);
      onClose();
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu thay đổi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa hồ sơ',
      `Bạn có chắc chắn muốn xóa hồ sơ "${profile.name}"? Dữ liệu bài học của bé sẽ bị xóa.`,
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
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa hồ sơ');
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
        <View style={styles.container}>
          <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
          <Text style={styles.subtitle}>Cập nhật tên và biểu tượng cho bé</Text>

          <View style={styles.avatarPreviewBox}>
            <Text style={styles.avatarPreviewEmoji}>{selectedEmoji}</Text>
          </View>

          <Text style={styles.sectionLabel}>Chọn biểu tượng đại diện</Text>
          <View style={styles.emojiRow}>
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={[
                  styles.emojiBtn,
                  selectedEmoji === emoji && styles.emojiBtnSelected,
                ]}
                onPress={() => setSelectedEmoji(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Tên bé</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập tên bé..."
            placeholderTextColor="#737373"
            maxLength={30}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isSaving}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveBtnText}>
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </Text>
            </TouchableOpacity>
          </View>

          {profile.role === 'child' && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              disabled={isSaving}
            >
              <Text style={styles.deleteBtnText}>🗑️ Xóa hồ sơ này</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A3A3A3',
    fontSize: 13,
    marginBottom: 18,
  },
  avatarPreviewBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  avatarPreviewEmoji: {
    fontSize: 44,
  },
  sectionLabel: {
    color: '#D4D4D4',
    fontSize: 13,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 4,
  },
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  emojiBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#404040',
  },
  emojiBtnSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#312E81',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 20,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#333333',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#E5E5E5',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  deleteBtn: {
    marginTop: 16,
    paddingVertical: 8,
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
  },
});
