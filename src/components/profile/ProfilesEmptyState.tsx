import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Plus } from "lucide-react-native";

interface ProfilesEmptyStateProps {
  onAddPress: () => void;
  isMaxProfilesReached?: boolean;
}

export const ProfilesEmptyState: React.FC<ProfilesEmptyStateProps> = ({
  onAddPress,
  isMaxProfilesReached = false,
}) => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIllustration}>
        <Text style={styles.emptyEmoji}>🐣</Text>
      </View>
      <Text style={styles.emptyTitle}>Chưa có hồ sơ bé</Text>
      <Text style={styles.emptyText}>
        Thêm hồ sơ để bắt đầu hành trình học toán
      </Text>
      {!isMaxProfilesReached ? (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={onAddPress}
          accessibilityRole="button"
          accessibilityLabel="Thêm hồ sơ bé"
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
          <Text style={styles.addButtonText}>Thêm bé</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    minHeight: 270,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE5EC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginBottom: 18,
  },
  emptyIllustration: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#FFF3C9",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: {
    fontSize: 51,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 15,
  },
  emptyText: {
    color: "#7B8490",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 290,
  },
  emptyButton: {
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#35A9E0",
    marginTop: 19,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
