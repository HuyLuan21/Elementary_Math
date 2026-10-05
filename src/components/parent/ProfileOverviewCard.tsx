import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { ParentOverviewProfile } from "../../types/parentReport";
import { OverviewMetric } from "./OverviewMetric";

interface ProfileOverviewCardProps {
  profile: ParentOverviewProfile;
  onPress: () => void;
}

export const ProfileOverviewCard: React.FC<ProfileOverviewCardProps> = ({
  profile,
  onPress,
}) => {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarUrl = profile.avatar_url;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Mở báo cáo của ${profile.display_name}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileCard,
        pressed && styles.profileCardPressed,
      ]}
    >
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          {avatarUrl && !avatarFailed ? (
            <Image
              source={{ uri: avatarUrl }}
              onError={() => setAvatarFailed(true)}
              resizeMode="cover"
              style={styles.avatarImage}
              accessibilityLabel={`Ảnh đại diện của ${profile.display_name}`}
            />
          ) : (
            <Text style={styles.avatarPlaceholder}>🧒</Text>
          )}
        </View>
        <View style={styles.profileTitleArea}>
          <Text numberOfLines={1} style={styles.profileName}>
            {profile.display_name}
          </Text>
          <Text style={styles.birthDate}>
            {formatBirthDate(profile.birth_date)}
          </Text>
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </View>

      <View style={styles.summaryGrid}>
        <OverviewMetric value={profile.summary.total_stars} label="Ngôi sao" />
        <OverviewMetric
          value={profile.summary.completed_lessons}
          label="Bài học"
        />
        <OverviewMetric value={profile.summary.learning_days} label="Ngày học" />
        <OverviewMetric value={profile.summary.badge_count} label="Huy hiệu" />
        <OverviewMetric
          value={formatDuration(profile.summary.total_seconds)}
          label="Thời gian học"
        />
      </View>

      <Text style={styles.lastLearning}>
        {profile.summary.last_learning_at
          ? `Học gần nhất: ${formatDate(profile.summary.last_learning_at)}`
          : "Bé chưa bắt đầu học"}
      </Text>
    </Pressable>
  );
};

function formatBirthDate(value: string | null): string {
  if (!value) return "Chưa cập nhật ngày sinh";
  return `Sinh ngày ${formatDate(value)}`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} giây`;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours === 0) return `${minutes} phút`;
  return remainingMinutes
    ? `${hours} giờ ${remainingMinutes} phút`
    : `${hours} giờ`;
}

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    marginBottom: 14,
    shadowColor: "#513B07",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 9,
    elevation: 2,
  },
  profileCardPressed: {
    opacity: 0.86,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFF0C2",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    fontSize: 30,
  },
  profileTitleArea: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    color: "#303942",
    fontSize: 17,
    fontWeight: "800",
  },
  birthDate: {
    color: "#7B838C",
    fontSize: 12,
    marginTop: 3,
  },
  cardArrow: {
    color: "#9AA1A8",
    fontSize: 28,
    marginLeft: 5,
  },
  summaryGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F1F2",
    paddingTop: 12,
  },
  lastLearning: {
    color: "#9299A0",
    fontSize: 11,
    marginTop: 7,
    textAlign: "right",
  },
});
