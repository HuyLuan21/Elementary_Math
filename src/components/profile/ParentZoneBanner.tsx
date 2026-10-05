import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { UserProfile } from "../../types/auth";

interface ParentZoneBannerProps {
  parentProfile: UserProfile;
  onPress: (profile: UserProfile) => void;
}

export const ParentZoneBanner: React.FC<ParentZoneBannerProps> = ({
  parentProfile,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.parentRow}
      onPress={() => onPress(parentProfile)}
      accessibilityRole="button"
      accessibilityLabel="Truy cập khu vực phụ huynh"
    >
      <Text style={styles.parentEmoji}>{parentProfile.avatarIcon}</Text>
      <View style={styles.parentCopy}>
        <Text style={styles.parentTitle}>Khu vực phụ huynh</Text>
        <Text style={styles.parentSubtitle}>Quản lý tài khoản gia đình</Text>
      </View>
      <Text style={styles.parentArrow}>›</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  parentRow: {
    minHeight: 80,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE5EC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  parentEmoji: {
    fontSize: 34,
    marginRight: 14,
  },
  parentCopy: {
    flex: 1,
  },
  parentTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
  },
  parentSubtitle: {
    color: "#7B8490",
    fontSize: 13,
    marginTop: 2,
  },
  parentArrow: {
    color: "#A0AAB7",
    fontSize: 27,
    fontWeight: "300",
    marginLeft: 8,
  },
});
