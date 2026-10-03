import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LogOut, RefreshCw, Users } from "lucide-react-native";
import { useAuth } from "../../../src/context/AuthContext";
import { parentApi } from "../../../src/services/parentApi";
import { ParentOverviewProfile } from "../../../src/types/parentReport";

type OverviewState = {
  status: "loading" | "success" | "error";
  profiles: ParentOverviewProfile[];
};

export default function ParentOverviewRoute() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [overviewState, setOverviewState] = useState<OverviewState>({
    status: "loading",
    profiles: [],
  });

  useEffect(() => {
    let isCurrentRequest = true;
    setOverviewState((current) => ({
      status: "loading",
      profiles: current.profiles,
    }));

    parentApi
      .getParentOverview()
      .then((profiles) => {
        if (isCurrentRequest) {
          setOverviewState({
            status: "success",
            profiles,
          });
        }
      })
      .catch((error: unknown) => {
        console.error("Không thể tải tổng quan phụ huynh:", error);
        if (isCurrentRequest) {
          setOverviewState((current) => ({
            status: "error",
            profiles: current.profiles,
          }));
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  const openChildReport = (profileId: string) => {
    router.push({
      pathname: "/(tabs)/parent/report/[profileId]",
      params: { profileId },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <View style={styles.headerIcon}>
              <Users size={23} color="#8C6410" />
            </View>
            <View>
              <Text style={styles.eyebrow}>KHU VỰC GIA ĐÌNH</Text>
              <Text style={styles.title}>Góc Ba Mẹ</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đăng xuất"
            onPress={handleSignOut}
            style={styles.logoutButton}
          >
            <LogOut size={18} color="#687480" />
          </Pressable>
        </View>

        <Text style={styles.intro}>
          Cùng xem hành trình học tập của các bé nhé!
        </Text>

        {overviewState.status === "loading" ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#E9A900" />
            <Text style={styles.stateTitle}>Đang tải hồ sơ các bé...</Text>
          </View>
        ) : overviewState.status === "error" ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🧸</Text>
            <Text style={styles.stateTitle}>Chưa tải được thông tin</Text>
            <Text style={styles.stateDescription}>
              Vui lòng kiểm tra kết nối rồi thử lại.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRetryCount((count) => count + 1)}
              style={styles.retryButton}
            >
              <RefreshCw size={17} color="#3F484F" />
              <Text style={styles.retryText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : overviewState.profiles.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>👋</Text>
            <Text style={styles.stateTitle}>Chưa có hồ sơ bé</Text>
            <Text style={styles.stateDescription}>
              Hãy thêm hồ sơ bé để xem báo cáo học tập.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Hồ sơ các bé</Text>
              <Text style={styles.profileCount}>
                {overviewState.profiles.length} bé
              </Text>
            </View>
            {overviewState.profiles.map((profile) => (
              <ProfileOverviewCard
                key={profile.id}
                profile={profile}
                onPress={() => openChildReport(profile.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

function ProfileOverviewCard({
  profile,
  onPress,
}: {
  profile: ParentOverviewProfile;
  onPress: () => void;
}) {
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
        <OverviewMetric value={profile.summary.sticker_count} label="Nhãn dán" />
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
}

function OverviewMetric({
  value,
  label,
}: {
  value: number | string;
  label: string;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

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
  container: {
    flex: 1,
    backgroundColor: "#FFF9EA",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFE7A0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  eyebrow: {
    color: "#A47A19",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: "#27313B",
    fontSize: 25,
    fontWeight: "800",
  },
  logoutButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  intro: {
    color: "#69737E",
    fontSize: 14,
    marginTop: 15,
    marginBottom: 22,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#303942",
    fontSize: 18,
    fontWeight: "800",
  },
  profileCount: {
    color: "#8B6C24",
    backgroundColor: "#FFEFC1",
    borderRadius: 14,
    overflow: "hidden",
    paddingHorizontal: 11,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "700",
  },
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F1F2",
    paddingTop: 12,
  },
  metric: {
    width: "32%",
    alignItems: "center",
    paddingVertical: 5,
  },
  metricValue: {
    color: "#3F484F",
    fontSize: 17,
    fontWeight: "800",
  },
  metricLabel: {
    color: "#858D95",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  lastLearning: {
    color: "#9299A0",
    fontSize: 11,
    marginTop: 7,
    textAlign: "right",
  },
  stateCard: {
    minHeight: 230,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  stateEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  stateTitle: {
    color: "#303942",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 10,
  },
  stateDescription: {
    color: "#747E88",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD167",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 16,
  },
  retryText: {
    color: "#3F484F",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 7,
  },
});
