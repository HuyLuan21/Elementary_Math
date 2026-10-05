import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, KeyRound, Lock, ShieldCheck, X } from 'lucide-react-native';
import { authApi } from '../services/authApi';

export type ParentPinModalMode = 'setup' | 'verify' | 'change';

interface ParentPinModalProps {
  visible: boolean;
  mode?: ParentPinModalMode;
  title?: string;
  subtitle?: string;
  profile?: any;
  onClose: () => void;
  onSuccess: () => void;
  onPinAlreadySet?: () => Promise<boolean>;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  visible,
  mode = 'verify',
  title,
  subtitle,
  onClose,
  onSuccess,
  onPinAlreadySet,
}) => {
  const [oldPin, setOldPin] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'old' | 'new' | 'confirm' | null>(null);

  const isSetupMode = mode === 'setup';
  const isChangeMode = mode === 'change';
  const isVerifyMode = mode === 'verify';

  const oldPinInputRef = useRef<TextInput>(null);
  const pinInputRef = useRef<TextInput>(null);
  const confirmPinInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setOldPin('');
      setPinInput('');
      setConfirmPin('');
      setPinError('');
      setFocusedField(null);
      setIsLoading(false);
    } else {
      const initialField = isChangeMode ? 'old' : 'new';
      setFocusedField(initialField);
      setTimeout(() => {
        if (isChangeMode) {
          oldPinInputRef.current?.focus();
        } else {
          pinInputRef.current?.focus();
        }
      }, 150);
    }
  }, [visible, mode, isChangeMode]);

  const handleClose = () => {
    if (isLoading || isSetupMode) return;
    setOldPin('');
    setPinInput('');
    setConfirmPin('');
    setPinError('');
    setFocusedField(null);
    onClose();
  };

  const handleSubmit = async (overridePin?: string) => {
    const currentPin = overridePin || pinInput;

    if (isChangeMode) {
      if (!/^\d{4}$/.test(oldPin)) {
        setPinError('Vui lòng nhập mã PIN hiện tại (4 số).');
        setFocusedField('old');
        oldPinInputRef.current?.focus();
        return;
      }
      if (!/^\d{4}$/.test(currentPin)) {
        setPinError('Vui lòng nhập mã PIN mới (4 số).');
        setFocusedField('new');
        pinInputRef.current?.focus();
        return;
      }
      if (currentPin !== confirmPin) {
        setPinError('Mã PIN mới xác nhận không khớp.');
        setFocusedField('confirm');
        confirmPinInputRef.current?.focus();
        return;
      }
    } else if (isSetupMode) {
      if (!/^\d{4}$/.test(currentPin)) return;
      if (currentPin !== confirmPin) {
        setPinError('Mã PIN xác nhận không khớp.');
        setFocusedField('confirm');
        confirmPinInputRef.current?.focus();
        return;
      }
    } else {
      if (!/^\d{4}$/.test(currentPin) || isLoading) return;
    }

    setPinError('');
    setIsLoading(true);
    try {
      if (isChangeMode) {
        await authApi.changePin(oldPin, currentPin);
        Alert.alert('Thành công 🎉', 'Đã đổi mã PIN phụ huynh thành công!');
      } else if (isSetupMode) {
        const response = await authApi.setPin(currentPin);
        if (!response.data.pin_enabled) {
          setPinError('Không thể thiết lập mã PIN. Vui lòng thử lại.');
          return;
        }
      } else {
        const verified = await authApi.verifyPin(currentPin);
        if (!verified) {
          setPinError('Mã PIN không chính xác. Vui lòng thử lại.');
          setPinInput('');
          setFocusedField('new');
          pinInputRef.current?.focus();
          return;
        }
      }

      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Không thể thực hiện yêu cầu.';

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
      if (isVerifyMode) {
        setPinInput('');
        setFocusedField('new');
        pinInputRef.current?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOldPinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setOldPin(cleaned);
    setPinError('');
    if (cleaned.length === 4) {
      setFocusedField('new');
      pinInputRef.current?.focus();
    }
  };

  const handlePinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setPinInput(cleaned);
    setPinError('');

    if (isVerifyMode && cleaned.length === 4) {
      handleSubmit(cleaned);
    } else if ((isChangeMode || isSetupMode) && cleaned.length === 4) {
      setFocusedField('confirm');
      confirmPinInputRef.current?.focus();
    }
  };

  const handleConfirmPinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    setConfirmPin(cleaned);
    setPinError('');
  };

  const isFormValid =
    isChangeMode
      ? /^\d{4}$/.test(oldPin) &&
        /^\d{4}$/.test(pinInput) &&
        /^\d{4}$/.test(confirmPin) &&
        pinInput === confirmPin
      : /^\d{4}$/.test(pinInput) &&
        (!isSetupMode || (/^\d{4}$/.test(confirmPin) && pinInput === confirmPin));

  const modalTitle =
    title ||
    (isChangeMode
      ? 'Đổi mã PIN phụ huynh'
      : isSetupMode
        ? 'Thiết lập mã PIN phụ huynh'
        : 'Khu vực phụ huynh');

  const modalSubtitle =
    subtitle ||
    (isChangeMode
      ? 'Nhập mã PIN hiện tại và tạo mã PIN 4 chữ số mới.'
      : isSetupMode
        ? 'Tạo mã PIN 4 chữ số để bảo vệ trang cài đặt và báo cáo học tập của bé.'
        : 'Vui lòng nhập mã PIN 4 chữ số để tiếp tục.');

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
          contentContainerStyle={styles.scrollOverlay}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {!isSetupMode && (
              <TouchableOpacity
                style={styles.closeIconBtn}
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Đóng"
              >
                <X size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}

            {/* Icon Header */}
            <View style={styles.iconCircle}>
              {isChangeMode ? (
                <KeyRound size={32} color="#2563EB" strokeWidth={2.2} />
              ) : isSetupMode ? (
                <ShieldCheck size={32} color="#2563EB" strokeWidth={2.2} />
              ) : (
                <Lock size={30} color="#2563EB" strokeWidth={2.2} />
              )}
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalSubtitle}>{modalSubtitle}</Text>

            {/* Error Message */}
            {pinError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.pinErrorText}>{pinError}</Text>
              </View>
            ) : null}

            {/* Change Mode: Old PIN */}
            {isChangeMode && (
              <>
                <Text style={styles.inputLabel}>Mã PIN hiện tại</Text>
                <Pressable
                  style={styles.pinBoxesContainer}
                  onPress={() => {
                    setFocusedField('old');
                    oldPinInputRef.current?.focus();
                  }}
                >
                  {[0, 1, 2, 3].map((index) => {
                    const digit = oldPin[index];
                    const isFocused = focusedField === 'old' && oldPin.length === index;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.pinBox,
                          digit !== undefined && styles.pinBoxFilled,
                          isFocused && styles.pinBoxActive,
                        ]}
                      >
                        {digit !== undefined ? (
                          <View style={styles.pinDot} />
                        ) : null}
                      </View>
                    );
                  })}
                </Pressable>

                <TextInput
                  ref={oldPinInputRef}
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={oldPin}
                  onChangeText={handleOldPinChange}
                  onFocus={() => setFocusedField('old')}
                  autoFocus
                  editable={!isLoading}
                  caretHidden
                />
              </>
            )}

            {/* PIN Input (New PIN or Single PIN) */}
            {(isSetupMode || isChangeMode) && (
              <Text style={[styles.inputLabel, { marginTop: isChangeMode ? 14 : 0 }]}>
                {isChangeMode ? 'Mã PIN mới (4 số)' : 'Mã PIN mới'}
              </Text>
            )}
            <Pressable
              style={styles.pinBoxesContainer}
              onPress={() => {
                setFocusedField('new');
                pinInputRef.current?.focus();
              }}
            >
              {[0, 1, 2, 3].map((index) => {
                const digit = pinInput[index];
                const isFocused = focusedField === 'new' && pinInput.length === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.pinBox,
                      digit !== undefined && styles.pinBoxFilled,
                      isFocused && styles.pinBoxActive,
                    ]}
                  >
                    {digit !== undefined ? (
                      <View style={styles.pinDot} />
                    ) : null}
                  </View>
                );
              })}
            </Pressable>

            <TextInput
              ref={pinInputRef}
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              value={pinInput}
              onChangeText={handlePinChange}
              onFocus={() => setFocusedField('new')}
              autoFocus={!isChangeMode}
              editable={!isLoading}
              caretHidden
            />

            {/* Setup / Change Mode: Confirm PIN */}
            {(isSetupMode || isChangeMode) && (
              <>
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>
                  Xác nhận lại mã PIN mới
                </Text>
                <Pressable
                  style={styles.pinBoxesContainer}
                  onPress={() => {
                    setFocusedField('confirm');
                    confirmPinInputRef.current?.focus();
                  }}
                >
                  {[0, 1, 2, 3].map((index) => {
                    const digit = confirmPin[index];
                    const isFocused = focusedField === 'confirm' && confirmPin.length === index;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.pinBox,
                          digit !== undefined && styles.pinBoxFilled,
                          isFocused && styles.pinBoxActive,
                        ]}
                      >
                        {digit !== undefined ? (
                          <View style={styles.pinDot} />
                        ) : null}
                      </View>
                    );
                  })}
                </Pressable>

                <TextInput
                  ref={confirmPinInputRef}
                  style={styles.hiddenInput}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  value={confirmPin}
                  onChangeText={handleConfirmPinChange}
                  onFocus={() => setFocusedField('confirm')}
                  editable={!isLoading}
                  caretHidden
                />

                {confirmPin.length === 4 && (
                  <View style={styles.matchStatusRow}>
                    {pinInput === confirmPin ? (
                      <View style={styles.matchSuccess}>
                        <Check size={14} color="#16A34A" strokeWidth={3} />
                        <Text style={styles.matchSuccessText}>
                          Mã PIN trùng khớp
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.matchErrorText}>
                        Mã PIN xác nhận không khớp
                      </Text>
                    )}
                  </View>
                )}
              </>
            )}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              {!isSetupMode && (
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={handleClose}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelModalText}>Hủy</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.confirmModalBtn,
                  isSetupMode && styles.setupConfirmModalBtn,
                  (!isFormValid || isLoading) && styles.confirmModalBtnDisabled,
                ]}
                onPress={() => handleSubmit()}
                disabled={!isFormValid || isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmModalText}>
                    {isChangeMode
                      ? 'Lưu mã PIN mới'
                      : isSetupMode
                        ? 'Lưu mã PIN'
                        : 'Xác nhận'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  scrollOverlay: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  closeIconBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    width: '100%',
  },
  pinErrorText: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
    marginLeft: 4,
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginVertical: 4,
  },
  pinBox: {
    width: 52,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxFilled: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  pinBoxActive: {
    borderColor: '#2563EB',
    borderWidth: 2,
    backgroundColor: '#EFF6FF',
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E293B',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  matchStatusRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  matchSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  matchSuccessText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '600',
  },
  matchErrorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginTop: 20,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelModalText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmModalBtn: {
    flex: 1.4,
    backgroundColor: '#2563EB',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  setupConfirmModalBtn: {
    flex: 1,
  },
  confirmModalBtnDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmModalText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
