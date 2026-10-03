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
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { achievementApi } from "../../src/services/achievementApi";
import {
  BadgeAchievement,
  ProfileAchievements,
  StickerAchievement,
} from "../../src/types/achievement";

type LoadState = {
  profileId: string | null;
  status: "loading" | "success" | "error";
  data: ProfileAchievements | null;
};

export default function AchievementsRoute() {
  const router = useRouter();
  const { activeProfile } = useAuth();
  const profileId = activeProfile?.id ?? null;
  const isChildProfile = activeProfile?.role === "child";
  const [retryCount, setRetryCount] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>({
    profileId: null,
    status: "loading",
    data: null,
  });

  useEffect(() => {
    if (!profileId || !isChildProfile) {
      setLoadState({ profileId, status: "success", data: null });
      return;
    }

    let isCurrentRequest = true;
    setLoadState({ profileId, status: "loading", data: null });

    achievementApi
      .getProfileAchievements(profileId)
      .then((data) => {
        if (isCurrentRequest) {
          setLoadState({ profileId, status: "success", data });
        }
      })
      .catch((error: unknown) => {
        console.error("Không thể tải thành tích của hồ sơ:", error);
        if (isCurrentRequest) {
          setLoadState({ profileId, status: "error", data: null });
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [isChildProfile, profileId, retryCount]);

  const stateMatchesProfile = loadState.profileId === profileId;
  const isLoading =
    isChildProfile &&
    (!stateMatchesProfile || loadState.status === "loading");
  const hasError = stateMatchesProfile && loadState.status === "error";
  const achievements =
    stateMatchesProfile && loadState.status === "success"
      ? loadState.data
      : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>BỘ SƯU TẬP CỦA BÉ</Text>
            <Text style={styles.title}>Góc của bé</Text>
          </View>
          {activeProfile ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đổi hồ sơ"
              onPress={() => router.replace("/profiles")}
              style={styles.profileButton}
            >
              <ProfileAvatar
                avatarUrl={activeProfile.avatarUrl}
                avatarIcon={activeProfile.avatarIcon}
                avatarColor={activeProfile.avatarColor}
              />
              <Text numberOfLines={1} style={styles.profileName}>
                {activeProfile.name}
              </Text>
              <Text style={styles.profileChevron}>⌄</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <StatCard
            emoji="🏅"
            label="Huy hiệu"
            count={achievements?.summary.badge_count}
            color="#FFF2C6"
          />
          <StatCard
            emoji="🏷️"
            label="Nhãn dán"
            count={achievements?.summary.sticker_count}
            color="#E9F5FF"
          />
        </View>

        {!activeProfile || !isChildProfile ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeEmoji}>👋</Text>
            <Text style={styles.noticeTitle}>Chọn hồ sơ của bé nhé!</Text>
            <Text style={styles.noticeText}>
              Thành tích sẽ hiện ở đây khi bé được chọn.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/profiles")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Chọn hồ sơ bé</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#E9A900" />
            <Text style={styles.loadingText}>Đang xem bộ sưu tập...</Text>
          </View>
        ) : hasError ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeEmoji}>🧸</Text>
            <Text style={styles.noticeTitle}>Chưa tải được thành tích</Text>
            <Text style={styles.noticeText}>
              Mình thử lại nhé? Bộ sưu tập sẽ vẫn ở đây.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRetryCount((count) => count + 1)}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : achievements ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏅 Huy hiệu của bé</Text>
              {achievements.badges.length ? (
                <View style={styles.badgeGrid}>
                  {achievements.badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </View>
              ) : (
                <EmptyState
                  emoji="🌟"
                  message="Chưa có huy hiệu nào"
                />
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏷️ Nhãn dán của bé</Text>
              {achievements.stickers.length ? (
                <View style={styles.stickerGrid}>
                  {achievements.stickers.map((sticker) => (
                    <StickerCard key={sticker.id} sticker={sticker} />
                  ))}
                </View>
              ) : (
                <EmptyState
                  emoji="🎨"
                  message="Chưa có nhãn dán nào"
                />
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileAvatar({
  avatarUrl,
  avatarIcon,
  avatarColor,
}: {
  avatarUrl?: string | null;
  avatarIcon: string;
  avatarColor: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const isRemoteImage =
    Boolean(avatarUrl) &&
    /^https?:\/\//i.test(avatarUrl ?? "") &&
    !imageFailed;

  return (
    <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
      {isRemoteImage ? (
        <Image
          source={{ uri: avatarUrl ?? "" }}
          onError={() => setImageFailed(true)}
          style={styles.avatarImage}
          accessibilityLabel="Ảnh đại diện"
        />
      ) : (
        <Text style={styles.avatarEmoji}>{avatarIcon}</Text>
      )}
    </View>
  );
}

function StatCard({
  emoji,
  label,
  count,
  color,
}: {
  emoji: string;
  label: string;
  count?: number;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statCount}>{count ?? "—"}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AchievementImage({
  imageUrl,
  placeholder,
  style,
}: {
  imageUrl: string | null;
  placeholder: string;
  style: object;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageUrl || imageFailed) {
    return (
      <View style={[style, styles.imagePlaceholder]}>
        <Text style={styles.placeholderEmoji}>{placeholder}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: imageUrl }}
      onError={() => setImageFailed(true)}
      resizeMode="contain"
      style={style}
      accessibilityLabel="Hình ảnh thành tích"
    />
  );
}

function BadgeCard({ badge }: { badge: BadgeAchievement }) {
  return (
    <View style={styles.badgeCard}>
      <AchievementImage
        imageUrl={badge.image_url}
        placeholder="🏅"
        style={styles.badgeImage}
      />
      <Text numberOfLines={2} style={styles.badgeName}>
        {badge.name}
      </Text>
      {badge.description ? (
        <Text numberOfLines={2} style={styles.badgeDescription}>
          {badge.description}
        </Text>
      ) : null}
    </View>
  );
}

function StickerCard({ sticker }: { sticker: StickerAchievement }) {
  return (
    <View style={styles.stickerCard}>
      <AchievementImage
        imageUrl={sticker.image_url}
        placeholder="🌟"
        style={styles.stickerImage}
      />
      <Text numberOfLines={2} style={styles.stickerName}>
        {sticker.name}
      </Text>
    </View>
  );
}

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9EA",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  eyebrow: {
    color: "#A47A19",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  title: {
    color: "#27313B",
    fontSize: 26,
    fontWeight: "800",
  },
  profileButton: {
    maxWidth: "53%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 5,
    paddingLeft: 5,
    paddingRight: 11,
    shadowColor: "#513B07",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarEmoji: {
    fontSize: 21,
  },
  profileName: {
    color: "#3F484F",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 7,
    flexShrink: 1,
  },
  profileChevron: {
    color: "#8B7650",
    fontSize: 17,
    marginLeft: 6,
    marginTop: -5,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minHeight: 118,
    borderRadius: 20,
    padding: 14,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 2,
  },
  statCount: {
    color: "#27313B",
    fontSize: 27,
    fontWeight: "800",
  },
  statLabel: {
    color: "#5E6670",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: "#27313B",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  badgeCard: {
    width: "48%",
    minHeight: 176,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 13,
    marginBottom: 12,
  },
  badgeImage: {
    width: 78,
    height: 78,
    marginBottom: 8,
  },
  badgeName: {
    color: "#303942",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  badgeDescription: {
    color: "#77808A",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 4,
  },
  stickerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  stickerCard: {
    width: "31%",
    minHeight: 126,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 9,
    marginBottom: 11,
  },
  stickerImage: {
    width: 72,
    height: 72,
    marginBottom: 5,
  },
  stickerName: {
    color: "#45505B",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF4D4",
    borderRadius: 16,
  },
  placeholderEmoji: {
    fontSize: 36,
  },
  emptyCard: {
    minHeight: 118,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  emptyText: {
    color: "#717A84",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  loadingCard: {
    minHeight: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: "#717A84",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  noticeCard: {
    minHeight: 235,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 22,
  },
  noticeEmoji: {
    fontSize: 38,
    marginBottom: 9,
  },
  noticeTitle: {
    color: "#303942",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  noticeText: {
    color: "#717A84",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 15,
  },
  primaryButton: {
    backgroundColor: "#FFD167",
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: "#3F484F",
    fontSize: 14,
    fontWeight: "800",
  },
});
