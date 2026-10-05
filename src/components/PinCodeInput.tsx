import React, { forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface PinCodeInputProps {
  label?: string;
  value: string;
  onChangeText: (val: string) => void;
  onFocus?: () => void;
  isFocused?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  marginTop?: number;
}

export const PinCodeInput = forwardRef<TextInput, PinCodeInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      onFocus,
      isFocused = false,
      autoFocus = false,
      disabled = false,
      marginTop = 0,
    },
    ref
  ) => {
    const handlePress = () => {
      if (disabled) return;
      if (ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
      onFocus?.();
    };

    return (
      <View style={[styles.container, { marginTop }]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <Pressable
          style={styles.pinBoxesContainer}
          onPress={handlePress}
          accessible
          accessibilityLabel={label || 'Ô nhập mã PIN'}
        >
          {[0, 1, 2, 3].map((index) => {
            const digit = value[index];
            const isActive = isFocused && value.length === index;
            return (
              <View
                key={index}
                style={[
                  styles.pinBox,
                  digit !== undefined && styles.pinBoxFilled,
                  isActive && styles.pinBoxActive,
                ]}
              >
                {digit !== undefined ? <View style={styles.pinDot} /> : null}
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={ref}
          style={styles.hiddenInput}
          keyboardType="number-pad"
          maxLength={4}
          secureTextEntry
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          autoFocus={autoFocus}
          editable={!disabled}
          caretHidden
        />
      </View>
    );
  }
);

PinCodeInput.displayName = 'PinCodeInput';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
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
});
