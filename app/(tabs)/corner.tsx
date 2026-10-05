import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as Speech from "expo-speech";
import {
  Award,
  Check,
  ChevronRight,
  Flame,
  Heart,
  Lock,
  Play,
  Settings,
  Sparkles,
  Star,
  Trophy,
  Volume2,
} from "lucide-react-native";

import { useAuth } from "../../src/context/AuthContext";
import {
  emathApi,
  KidCornerData,
  KidCornerBadge,
} from "../../src/services/emathApi";
import { storage } from "../../src/utils/storage";
import { ParentPinModal } from "../../src/components/ParentPinModal";

const { width } = Dimensions.get("window");

const BADGE_META: Record<string, { emoji: string; color: string }> = {
  FIRST_LESSON: { emoji: "🥇", color: "#FFDF9B" },
  COLOR_MASTER: { emoji: "🎨", color: "#C6E7FF" },
  SHAPE_MASTER: { emoji: "📐", color: "#E9DDFF" },
  NUMBER_MASTER: { emoji: "🔢", color: "#FFDF9B" },
  COMPARE_MASTER: { emoji: "⚖️", color: "#C6E7FF" },
  TIME_MASTER: { emoji: "⏰", color: "#E9DDFF" },
  STREAK_7_DAYS: { emoji: "🔥", color: "#FFDF9B" },
  TEN_LESSONS: { emoji: "🌟", color: "#FFD167" },
};

const STICKER_META: Record<string, { emoji: string; color: string }> = {
  STICKER_RED: { emoji: "🐱", color: "#FFDAD8" },
  STICKER_BLUE: { emoji: "🐟", color: "#C6E7FF" },
  STICKER_YELLOW: { emoji: "🦆", color: "#FFDF9B" },
  STICKER_GREEN: { emoji: "🐸", color: "#D1FAE5" },
  STICKER_MIXED_COLORS: { emoji: "🌈", color: "#E9DDFF" },
  STICKER_CIRCLE: { emoji: "🐻", color: "#FFDF9B" },
  STICKER_SQUARE: { emoji: "🐼", color: "#E2E8F0" },
  STICKER_TRIANGLE: { emoji: "🐠", color: "#C6E7FF" },
  STICKER_RECTANGLE: { emoji: "🦒", color: "#FEF3C7" },
  STICKER_SHAPES: { emoji: "📐", color: "#E9DDFF" },
  STICKER_ONE: { emoji: "🐝", color: "#FEF08A" },
  STICKER_TWO: { emoji: "🐥", color: "#FFDF9B" },
  STICKER_THREE: { emoji: "🐱", color: "#FFDAD8" },
  STICKER_FOUR: { emoji: "🐬", color: "#C6E7FF" },
  STICKER_COUNTING: { emoji: "🔢", color: "#E9DDFF" },
  STICKER_MORE: { emoji: "🐘", color: "#C6E7FF" },
  STICKER_LESS: { emoji: "🐰", color: "#FFDAD8" },
  STICKER_EQUAL: { emoji: "🐿️", color: "#FEF3C7" },
  STICKER_BIG_SMALL: { emoji: "🐻‍❄️", color: "#E2E8F0" },
  STICKER_COMPARE: { emoji: "⚖️", color: "#E9DDFF" },
  STICKER_MORNING: { emoji: "🌅", color: "#FFDF9B" },
  STICKER_NOON: { emoji: "☀️", color: "#FDE047" },
  STICKER_NIGHT: { emoji: "🌙", color: "#E0E7FF" },
  STICKER_ROUTINE: { emoji: "🐨", color: "#E2E8F0" },
  STICKER_TIME: { emoji: "⏰", color: "#FFD167" },
};

export default function AchievementsRoute() {
  const router = useRouter();
  const { activeProfile, authToken, signOut } = useAuth();
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [kidCornerData, setKidCornerData] = useState<KidCornerData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const profile = activeProfile || {
    id: "",
    name: "Bé",
    role: "child" as const,
    avatarColor: "#FFDF9B",
    avatarIcon: "🦁",
    totalStars: 0,
  };

  const isParent = profile.role === "parent";

  const loadKidCornerData = useCallback(async () => {
    let currentProfileId = activeProfile?.id;
    if (!currentProfileId) {
      try {
        const storedProfile = await storage.getItem("emath_active_profile");
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          currentProfileId = parsed?.id;
        }
      } catch (e) {}
    }

    if (!currentProfileId) return;

    let currentToken = authToken;
    if (!currentToken) {
      try {
        currentToken = await storage.getItem("emath_auth_token");
      } catch (e) {}
    }

    setLoading(true);
    try {
      const data = await emathApi.getKidCorner(
        currentProfileId,
        currentToken || undefined,
      );
      if (data) {
        setKidCornerData(data);
      }
    } catch (e) {
      console.warn("Lỗi tải Góc của bé:", e);
    } finally {
      setLoading(false);
    }
  }, [activeProfile?.id, authToken]);

  useFocusEffect(
    useCallback(() => {
      loadKidCornerData();
    }, [loadKidCornerData]),
  );

  const totalStars =
    kidCornerData?.stats?.totalStars ?? activeProfile?.totalStars ?? 0;
  const earnedBadgesCount = kidCornerData?.stats?.totalBadgesEarned ?? 0;
  const totalBadgesCount =
    kidCornerData?.stats?.totalBadgesCount ||
    (kidCornerData?.badges?.length ?? 8);

  const collectedStickersCount =
    kidCornerData?.stats?.totalStickersCollected ??
    (kidCornerData?.stickers?.filter((s) => s.isUnlocked).length ?? 0);
  const totalStickersCount =
    kidCornerData?.stats?.totalStickersCount ||
    (kidCornerData?.stickers?.length ?? 25);

  const displayedBadges =
    kidCornerData?.badges && kidCornerData.badges.length > 0
      ? kidCornerData.badges.map((b) => ({
          id: b.id,
          code: b.code,
          name: b.title,
          description: b.desc,
          tag: b.status === "achieved" ? "Hoàn thành 🏆" : "Chưa đạt 🔒",
          status:
            b.status === "achieved" ? ("earned" as const) : ("locked" as const),
          emoji: BADGE_META[b.code]?.emoji || "🏅",
          color: BADGE_META[b.code]?.color || "#FFDF9B",
        }))
      : [];

  const displayedStickers =
    kidCornerData?.stickers && kidCornerData.stickers.length > 0
      ? kidCornerData.stickers.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          desc: s.desc,
          isUnlocked: s.isUnlocked,
          emoji: STICKER_META[s.code]?.emoji || "🎁",
          color: STICKER_META[s.code]?.color || "#FFDF9B",
        }))
      : [];

  const speakGreeting = (customMessage?: string) => {
    let message = customMessage;
    if (!message) {
      if (isParent) {
        message = `Xin chào Phụ huynh ${profile.name}. Báo cáo học tập của bé đã sẵn sàng.`;
      } else if (earnedBadgesCount === 0) {
        message = `${profile.name} ơi! Hãy làm bài học đầu tiên để thu thập những huy hiệu lấp lánh đầu tiên nhé!`;
      } else {
        message = `${profile.name} ơi! Bé đã đạt ${earnedBadgesCount} huy hiệu xuất sắc. Cùng tiếp tục cố gắng nhé!`;
      }
    }

    Speech.speak(message, {
      language: "vi-VN",
      pitch: isParent ? 1.0 : 1.25,
      rate: 0.9,
    });
  };

  const handleSwitchProfile = () => {
    if (profile.role === "child") {
      setPinModalVisible(true);
    } else {
      router.replace("/profiles");
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      {/* 1. TOP APP BAR HEADER */}
      <View style={styles.topAppBar}>
        <View style={styles.headerInner}>
          {/* Left: Profile Badge */}
          <View style={styles.profileContainer}>
            <View
              style={[
                styles.avatarRing,
                { backgroundColor: profile.avatarColor || "#FFDF9B" },
              ]}
            >
              <Text style={styles.avatarEmoji}>
                {profile.avatarIcon || "🦁"}
              </Text>
            </View>
            <View style={styles.profileTextGroup}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {profile.name}
                </Text>
              </View>
            </View>
          </View>

          {/* Right: Gold Stars & Controls */}
          <View style={styles.headerRightControls}>
            {/* Stars Counter Pill */}
            <View style={styles.starsPill}>
              <Star size={15} color="#785A00" fill="#785A00" />
              <Text style={styles.starsPillNumber}>{totalStars}</Text>
            </View>

            {/* Sound Button */}
            <TouchableOpacity
              style={styles.circleIconButton}
              onPress={() => speakGreeting()}
              activeOpacity={0.8}
              accessibilityLabel="Nghe lời chào"
            >
              <Volume2 size={18} color="#00658D" />
            </TouchableOpacity>

            {/* Settings / Switch Profile Button */}
            <TouchableOpacity
              style={styles.circleIconButton}
              onPress={handleSwitchProfile}
              activeOpacity={0.8}
              accessibilityLabel="Cài đặt đổi hồ sơ"
            >
              <Settings size={18} color="#6F7880" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 2. MAIN SCROLLABLE CONTENT CANVAS */}
      <ScrollView
        contentContainerStyle={styles.scrollCanvas}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: HERO MASCOT & SPEECH BUBBLE */}
        <View style={styles.heroBanner}>
          {/* Decorative Clouds Background */}
          <View style={styles.cloudBlob1} />
          <View style={styles.cloudBlob2} />

          <View style={styles.heroInner}>
            {/* Speech Bubble from Bubu */}
            <View style={styles.speechBubble}>
              <View style={styles.speechTextGroup}>
                <Text style={styles.speechTitle}>{profile.name} ơi! ✨</Text>
                <Text style={styles.speechSubtitle}>
                  Cùng ngắm những huy hiệu lấp lánh bé đã thu thập được nhé!
                </Text>
              </View>

              <TouchableOpacity
                style={styles.speechAudioBtn}
                onPress={() => speakGreeting()}
                activeOpacity={0.8}
              >
                <Volume2 size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Mascot & Encouragement Display */}
            <View style={styles.mascotRow}>
              <View style={styles.mascotAvatarBox}>
                <Text style={styles.mascotEmoji}>
                  {profile.avatarIcon || "🦁"}
                </Text>
              </View>

              <View style={styles.encouragementWrapper}>
                <View style={styles.encouragementBadge}>
                  <Star size={11} color="#765900" fill="#765900" />
                  <Text style={styles.encouragementBadgeText}>
                    Siêu nhí chăm chỉ
                  </Text>
                </View>
                <Text style={styles.encouragementText}>
                  Đã đạt {earnedBadgesCount} huy hiệu xuất sắc! 🌟
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* SECTION 2: STAT SUMMARY CARDS (3D PILLOW TOKENS) */}
        <View style={styles.statsSummaryRow}>
          {/* Token 1: Badges */}
          <View style={styles.statTokenCard}>
            <View
              style={[styles.statTokenIconWrap, { backgroundColor: "#FFDF9B" }]}
            >
              <Trophy size={18} color="#251A00" />
            </View>
            <Text style={styles.statTokenLabel}>Huy hiệu</Text>
            <Text style={styles.statTokenNumber}>{earnedBadgesCount}</Text>
          </View>

          {/* Token 2: Stickers */}
          <View style={styles.statTokenCard}>
            <View
              style={[styles.statTokenIconWrap, { backgroundColor: "#C6E7FF" }]}
            >
              <Sparkles size={18} color="#00658D" />
            </View>
            <Text style={styles.statTokenLabel}>Hình dán</Text>
            <Text style={styles.statTokenNumber}>{collectedStickersCount}</Text>
          </View>

          {/* Token 3: Stars */}
          <View style={styles.statTokenCard}>
            <View
              style={[styles.statTokenIconWrap, { backgroundColor: "#FFD167" }]}
            >
              <Star size={18} color="#765900" fill="#765900" />
            </View>
            <Text style={styles.statTokenLabel}>Ngôi sao</Text>
            <Text style={styles.statTokenNumber}>{totalStars}</Text>
          </View>
        </View>

        {/* SECTION 3: BADGES SECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingLeftGroup}>
              <View
                style={[
                  styles.headingIndicator,
                  { backgroundColor: "#4DA8DA" },
                ]}
              />
              <Text style={styles.sectionMainTitle}>Huy hiệu toán học</Text>
            </View>
            <View style={[styles.countPill, { backgroundColor: "#C6E7FF" }]}>
              <Text style={[styles.countPillText, { color: "#00658D" }]}>
                {earnedBadgesCount}/{totalBadgesCount} đã đạt
              </Text>
            </View>
          </View>

          {/* 2-Column Grid of 3D Badges */}
          <View style={styles.badgesGrid}>
            {displayedBadges.map((badge) => {
              const isEarned = badge.status === "earned";
              const isLocked = badge.status === "locked";

              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badgeCard3D,
                    isLocked && styles.badgeCardLocked,
                  ]}
                >
                  {/* Earned Checkmark Indicator */}
                  {isEarned && (
                    <View style={styles.earnedCheckmark}>
                      <Check size={11} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  )}

                  {/* Badge Icon Circle */}
                  <View
                    style={[
                      styles.badgeEmojiCircle,
                      isLocked && styles.badgeEmojiCircleLocked,
                    ]}
                  >
                    {isLocked ? (
                      <Lock size={22} color="#6F7880" />
                    ) : (
                      <Text style={styles.badgeEmojiText}>{badge.emoji}</Text>
                    )}
                  </View>

                  {/* Badge Info */}
                  <Text
                    style={[
                      styles.badgeTitle,
                      isLocked && styles.badgeTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {badge.name}
                  </Text>
                  <Text
                    style={[
                      styles.badgeDesc,
                      isLocked && styles.badgeDescLocked,
                    ]}
                    numberOfLines={2}
                  >
                    {badge.description}
                  </Text>

                  {/* Badge Tag */}
                  <View
                    style={[
                      styles.badgeTagPill,
                      {
                        backgroundColor: isLocked
                          ? "#F3EAFF"
                          : badge.color || "#FFDF9B",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeTagText,
                        { color: isLocked ? "#6F7880" : "#5B4300" },
                      ]}
                    >
                      {badge.tag}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* SECTION 4: STICKERS COLLECTION */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeadingRow}>
            <View style={styles.headingLeftGroup}>
              <View
                style={[
                  styles.headingIndicator,
                  { backgroundColor: "#FF7372" },
                ]}
              />
              <Text style={styles.sectionMainTitle}>Bộ sưu tập hình dán</Text>
            </View>
            <View style={[styles.countPill, { backgroundColor: "#FFDF9B" }]}>
              <Text style={[styles.countPillText, { color: "#785A00" }]}>
                {collectedStickersCount}/{totalStickersCount} đã sưu tập
              </Text>
            </View>
          </View>

          {/* Grid of 3D Stickers */}
          <View style={styles.stickersGrid}>
            {displayedStickers.map((sticker) => {
              const isUnlocked = sticker.isUnlocked;

              return (
                <View
                  key={sticker.id}
                  style={[
                    styles.stickerCard3D,
                    !isUnlocked && styles.badgeCardLocked,
                  ]}
                >
                  {/* Avatar Wrap */}
                  <View
                    style={[
                      styles.stickerAvatarWrap,
                      {
                        backgroundColor: isUnlocked
                          ? sticker.color
                          : "#E9DDFF",
                      },
                    ]}
                  >
                    {isUnlocked ? (
                      <Text style={styles.stickerAvatarEmoji}>
                        {sticker.emoji}
                      </Text>
                    ) : (
                      <Lock size={20} color="#6F7880" />
                    )}
                  </View>

                  {/* Sticker Name */}
                  <Text
                    style={[
                      styles.stickerNameText,
                      !isUnlocked && styles.badgeTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {sticker.name}
                  </Text>

                  {/* Tag */}
                  <View
                    style={[
                      styles.stickerTagBadge,
                      {
                        backgroundColor: isUnlocked
                          ? "#D1FAE5"
                          : "#F3EAFF",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.stickerTagText,
                        { color: isUnlocked ? "#065F46" : "#6F7880" },
                      ]}
                    >
                      {isUnlocked ? "Đã nhận ✨" : "Chưa mở 🔒"}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* SECTION 5: BIG CELEBRATORY CALL TO PLAY BUTTON */}
        <TouchableOpacity
          style={styles.celebratoryPlayButton}
          activeOpacity={0.88}
          onPress={() => router.push("/(tabs)/journey")}
        >
          <View style={styles.playIconCircle}>
            <Play size={18} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={styles.celebratoryPlayButtonText}>
            TIẾP TỤC HÀNH TRÌNH TOÁN
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Parent PIN Modal */}
      <ParentPinModal
        visible={pinModalVisible}
        profile={profile}
        title="Xác thực đổi hồ sơ"
        subtitle="Nhập mã PIN của bố mẹ để đổi sang hồ sơ khác hoặc mở phần quản lý."
        onClose={() => setPinModalVisible(false)}
        onSuccess={() => {
          setPinModalVisible(false);
          router.replace("/profiles");
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Root Screen
  screen: {
    flex: 1,
    backgroundColor: "#FDF7FF",
  },

  // 1. TOP APP BAR HEADER
  topAppBar: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  headerInner: {
    width: "100%",
    maxWidth: 448,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  avatarRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#4DA8DA",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  avatarMiniBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFD167",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileTextGroup: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    color: "#00658D",
    fontSize: 20,
    fontWeight: "700",
  },
  gradeBadge: {
    backgroundColor: "#C6E7FF",
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  gradeBadgeText: {
    color: "#001E2D",
    fontSize: 12,
    fontWeight: "700",
  },
  roleSubtext: {
    color: "#3F484F",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 1,
  },
  headerRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFDF9B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  starsPillNumber: {
    color: "#251A00",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  circleIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3EAFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  // 2. MAIN SCROLLABLE CONTENT CANVAS
  scrollCanvas: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 128,
    maxWidth: 448,
    alignSelf: "center",
    width: "100%",
    gap: 24,
  },

  // SECTION 1: HERO MASCOT & SPEECH BUBBLE
  heroBanner: {
    width: "100%",
    backgroundColor: "#DDF1FF",
    borderRadius: 48,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    padding: 20,
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cloudBlob1: {
    position: "absolute",
    width: 96,
    height: 96,
    right: -22,
    top: -22,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  cloudBlob2: {
    position: "absolute",
    width: 120,
    height: 64,
    left: "30%",
    bottom: -15,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  heroInner: {
    position: "relative",
    zIndex: 2,
    gap: 12,
  },
  speechBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#EEE4FF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  speechTextGroup: {
    flex: 1,
    paddingRight: 10,
  },
  speechTitle: {
    color: "#1E1830",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 0.2,
    marginBottom: 2,
  },
  speechSubtitle: {
    color: "#3F484F",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  speechAudioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4DA8DA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  mascotRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  mascotAvatarBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "#FFFDF9",
    borderBottomWidth: 4,
    borderBottomColor: "#E5DEC9",
  },
  mascotEmoji: {
    fontSize: 54,
  },
  encouragementWrapper: {
    flex: 1,
    alignItems: "flex-end",
    paddingLeft: 12,
    paddingBottom: 4,
  },
  encouragementBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD167",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  encouragementBadgeText: {
    color: "#765900",
    fontSize: 12,
    fontWeight: "700",
  },
  encouragementText: {
    color: "#00658D",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "right",
  },

  // SECTION 2: STAT SUMMARY CARDS (3D PILLOW TOKENS)
  statsSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statTokenCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 5,
    borderBottomColor: "#E5DEC9",
    padding: 12,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statTokenIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statTokenLabel: {
    color: "#3F484F",
    fontSize: 12,
    fontWeight: "500",
  },
  statTokenNumber: {
    color: "#1E1830",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 2,
  },

  // SECTION 3 & 4: HEADINGS
  sectionContainer: {
    gap: 12,
  },
  sectionHeadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headingLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headingIndicator: {
    width: 12,
    height: 24,
    borderRadius: 9999,
  },
  sectionMainTitle: {
    color: "#1E1830",
    fontSize: 24,
    fontWeight: "700",
  },
  countPill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countPillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // 2-Column Badges Grid
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  badgeCard3D: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 5,
    borderBottomColor: "#E5DEC9",
    padding: 14,
    alignItems: "center",
    position: "relative",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  badgeCardLocked: {
    backgroundColor: "#F4EFEA",
    borderColor: "#EADBCE",
    borderBottomColor: "#D6C7B8",
    opacity: 0.9,
  },
  earnedCheckmark: {
    position: "absolute",
    right: 11,
    top: 11,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  badgeEmojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFF8EA",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
  },
  badgeEmojiCircleLocked: {
    backgroundColor: "#E9DDFF",
    borderWidth: 2,
    borderColor: "#BFC8D0",
    borderStyle: "dashed",
  },
  badgeEmojiText: {
    fontSize: 38,
  },
  badgeTitle: {
    color: "#1E1830",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
    marginTop: 4,
  },
  badgeTitleLocked: {
    color: "#6F7880",
  },
  badgeDesc: {
    color: "#3F484F",
    fontSize: 12.5,
    fontWeight: "400",
    textAlign: "center",
    marginTop: 2,
    minHeight: 32,
  },
  badgeDescLocked: {
    color: "#BFC8D0",
  },
  progressBarWrapper: {
    width: "100%",
    marginTop: 6,
    marginBottom: 2,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EEE4FF",
    borderWidth: 1,
    borderColor: "#F3EAFF",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#4DA8DA",
    borderRadius: 5,
  },
  badgeTagPill: {
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 6,
  },
  badgeTagText: {
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },

  // SECTION 4: STICKERS
  instructionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F1FF",
    borderWidth: 1,
    borderColor: "#F3EAFF",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  instructionText: {
    color: "#3F484F",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  stickersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 10,
  },
  stickerCard3D: {
    width: "31.2%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFFDF9",
    borderBottomWidth: 4,
    borderBottomColor: "#E5DEC9",
    padding: 10,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  stickerAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  stickerAvatarEmoji: {
    fontSize: 28,
  },
  stickerNameText: {
    color: "#1E1830",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  stickerTagBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 9999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  stickerTagText: {
    fontSize: 10,
    fontWeight: "700",
  },

  // SECTION 5: CELEBRATORY CALL TO PLAY BUTTON
  celebratoryPlayButton: {
    height: 72,
    backgroundColor: "#FF7372",
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderBottomWidth: 6,
    borderBottomColor: "#D84544",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    shadowColor: "#FF7372",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  playIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  celebratoryPlayButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.55,
  },
});
