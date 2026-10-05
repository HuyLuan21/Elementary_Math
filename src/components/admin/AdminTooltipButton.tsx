import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface AdminTooltipButtonProps {
  tooltip: string;
  onPress: (e: any) => void;
  style?: ViewStyle | (ViewStyle | false | undefined)[];
  children: React.ReactNode;
  placement?: 'top' | 'bottom';
  align?: 'center' | 'left' | 'right';
}

export const AdminTooltipButton: React.FC<AdminTooltipButtonProps> = ({
  tooltip,
  onPress,
  style,
  children,
  placement = 'top',
  align = 'center',
}) => {
  const [hovered, setHovered] = useState(false);

  const isBottom = placement === 'bottom';
  const isRight = align === 'right';
  const isLeft = align === 'left';

  return (
    <View
      style={[
        styles.wrapper,
        hovered && { zIndex: 999999, elevation: 999 },
      ]}
    >
      {hovered ? (
        <View
          style={[
            styles.tooltipBox,
            isBottom ? styles.tooltipBoxBottom : styles.tooltipBoxTop,
            isRight ? styles.alignRightBox : isLeft ? styles.alignLeftBox : styles.alignCenterBox,
          ]}
          pointerEvents="none"
        >
          <Text style={styles.tooltipText}>{tooltip}</Text>
          <View
            style={[
              styles.tooltipArrow,
              isBottom ? styles.tooltipArrowBottom : styles.tooltipArrowTop,
              isRight ? styles.arrowRight : isLeft ? styles.arrowLeft : styles.arrowCenter,
            ]}
          />
        </View>
      ) : null}
      <TouchableOpacity
        style={style}
        onPress={onPress}
        // @ts-ignore
        onMouseEnter={() => setHovered(true)}
        // @ts-ignore
        onMouseLeave={() => setHovered(false)}
        accessibilityLabel={tooltip}
        // @ts-ignore
        title={tooltip}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipBox: {
    position: 'absolute',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    zIndex: 999999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 999,
    // @ts-ignore
    pointerEvents: 'none',
  },
  alignCenterBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignRightBox: {
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignLeftBox: {
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltipBoxTop: {
    bottom: '100%',
    marginBottom: 8,
  },
  tooltipBoxBottom: {
    top: '100%',
    marginTop: 8,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    // @ts-ignore
    whiteSpace: 'nowrap',
  },
  tooltipArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  arrowCenter: {
    alignSelf: 'center',
  },
  arrowRight: {
    right: 12,
  },
  arrowLeft: {
    left: 12,
  },
  tooltipArrowTop: {
    bottom: -5,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#0F172A',
  },
  tooltipArrowBottom: {
    top: -5,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0F172A',
  },
});
