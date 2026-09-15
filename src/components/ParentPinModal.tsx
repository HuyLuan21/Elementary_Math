import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { UserProfile } from '../types/auth';

interface ParentPinModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSuccess: (profile: UserProfile) => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  visible,
  profile,
  onClose,
  onSuccess,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  const handleVerify = () => {
    if (!profile) return;
    const requiredPin = profile.pinCode || '1234';

    if (pinInput === requiredPin) {
      setPinInput('');
      setPinError('');
      onSuccess(profile);
    } else {
      setPinError('Mã PIN không đúng! Thử lại (Gợi ý: 1234)');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalLockEmoji}>🛡️</Text>
          <Text style={styles.modalTitle}>Xác thực Phụ huynh</Text>
          <Text style={styles.modalSubtitle}>
            Nhập mã PIN 4 chữ số để vào khu vực quản lý dành cho cha mẹ.
          </Text>

          {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

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
            <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose}>
              <Text style={styles.cancelModalText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmModalBtn} onPress={handleVerify}>
              <Text style={styles.confirmModalText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
