import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { authApi } from '../services/authApi';

type ParentPinModalMode = 'setup' | 'verify';

interface ParentPinModalProps {
  visible: boolean;
  mode: ParentPinModalMode;
  onClose: () => void;
  onSuccess: () => void;
  onPinAlreadySet?: () => Promise<boolean>;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  visible,
  mode,
  onClose,
  onSuccess,
  onPinAlreadySet,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isSetupMode = mode === 'setup';

  useEffect(() => {
    if (!visible) {
      setPinInput('');
      setConfirmPin('');
      setPinError('');
    }
  }, [visible, mode]);

  const handleClose = () => {
    if (isLoading || isSetupMode) return;
    setPinInput('');
    setConfirmPin('');
    setPinError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!/^\d{4}$/.test(pinInput) || isLoading) return;

    if (isSetupMode && pinInput !== confirmPin) {
      setPinError('Mã PIN xác nhận không khớp.');
      return;
    }

    setPinError('');
    setIsLoading(true);
    try {
      if (isSetupMode) {
        const response = await authApi.setPin(pinInput);
        if (!response.data.pin_enabled) {
          setPinError('Không thể thiết lập mã PIN. Vui lòng thử lại.');
          return;
        }
      } else {
        const verified = await authApi.verifyPin(pinInput);
        if (!verified) {
          setPinError('Mã PIN không đúng.');
          return;
        }
      }

      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể xác thực mã PIN.';

      if (
        isSetupMode &&
        errorMessage === 'Mã PIN đã được thiết lập.' &&
        onPinAlreadySet
      ) {
        try {
          if (await onPinAlreadySet()) return;
        } catch (refreshError: unknown) {
          setPinError(
            refreshError instanceof Error
              ? refreshError.message
              : 'Không thể tải trạng thái mã PIN.'
          );
          return;
        }
      }

      setPinError(errorMessage);
    } finally {
      setPinInput('');
      setConfirmPin('');
      setIsLoading(false);
    }
  };

  const setNumericPin = (value: string, setter: (pin: string) => void) => {
    setter(value.replace(/\D/g, '').slice(0, 4));
    setPinError('');
  };

  const confirmMismatch =
    isSetupMode && confirmPin.length > 0 && pinInput !== confirmPin;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalOverlay}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalLockEmoji}>🛡️</Text>
            <Text style={styles.modalTitle}>
              {isSetupMode ? 'Thiết lập mã PIN phụ huynh' : 'Xác nhận mã PIN'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isSetupMode
                ? 'Tạo mã PIN 4 chữ số để bảo vệ tài khoản phụ huynh.'
                : 'Nhập mã PIN phụ huynh để tiếp tục đổi tài khoản.'}
            </Text>

            {pinError ? <Text style={styles.pinErrorText}>{pinError}</Text> : null}

            <TextInput
              style={styles.pinInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinInput}
              onChangeText={(value) => setNumericPin(value, setPinInput)}
              placeholder="Nhập mã PIN"
              placeholderTextColor="#666"
              autoFocus
              editable={!isLoading}
              accessibilityLabel="Nhập mã PIN"
            />

            {isSetupMode ? (
              <>
                <TextInput
                  style={styles.pinInput}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={confirmPin}
                  onChangeText={(value) => setNumericPin(value, setConfirmPin)}
                  placeholder="Nhập lại mã PIN"
                  placeholderTextColor="#666"
                  editable={!isLoading}
                  accessibilityLabel="Nhập lại mã PIN"
                />
                {confirmMismatch ? (
                  <Text style={styles.pinErrorText}>
                    Mã PIN xác nhận không khớp.
                  </Text>
                ) : null}
              </>
            ) : null}

            <View style={styles.modalActions}>
              {!isSetupMode ? (
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <Text style={styles.cancelModalText}>Hủy</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.confirmModalBtn,
                  isSetupMode && styles.setupConfirmModalBtn,
                  (isLoading ||
                    !/^\d{4}$/.test(pinInput) ||
                    (isSetupMode &&
                      (!/^\d{4}$/.test(confirmPin) || pinInput !== confirmPin))) &&
                    styles.confirmModalBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={
                  isLoading ||
                  !/^\d{4}$/.test(pinInput) ||
                  (isSetupMode &&
                    (!/^\d{4}$/.test(confirmPin) || pinInput !== confirmPin))
                }
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmModalText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalScrollView: {
    flex: 1,
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
    textAlign: 'center',
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
    width: 200,
    height: 50,
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#404040',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 8,
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
  setupConfirmModalBtn: {
    marginLeft: 0,
  },
  confirmModalBtnDisabled: {
    opacity: 0.55,
  },
  confirmModalText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
