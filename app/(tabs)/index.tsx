import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { ParentPinModal } from "../../src/components/ParentPinModal";
import { emathApi, KidCornerData } from "../../src/services/emathApi";

const { width } = Dimensions.get("window");

export default function HomeRoute() {
  const router = useRouter();
  const { activeProfile, authToken, signOut } = useAuth();
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [kidCornerData, setKidCornerData] = useState<KidCornerData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const profile = activeProfile || {
    id: "00000000-0000-4000-8000-000000000101",
    name: "Bé Bông",
    role: "child" as const,
    grade: "Lớp 1",
    avatarColor: "#FFDF9B",
    avatarIcon: "👧",
    totalStars: 14,
  };

  const isParent = profile.role === "parent";

  // Tải dữ liệu Góc của bé từ Database
  const loadKidCorner = useCallback(async () => {
    if (!activeProfile?.id) return;
    try {
      setLoading(true);
      const data = await emathApi.getKidCorner(
        activeProfile.id,
        authToken || undefined,
      );
      if (data) {
        setKidCornerData(data);
      }
    } catch (e) {
      console.warn("Lỗi tải Góc của bé từ DB, dùng fallback:", e);
    } finally {
      setLoading(false);
    }
  }, [activeProfile?.id, authToken]);

  useEffect(() => {
    loadKidCorner();
  }, [loadKidCorner]);

  useEffect(() => {
    return () => {
      try {
        Speech.stop();
      } catch (e) {}
    };
  }, []);

  // Phát âm lời chào của Mascot Bubu
  const speakGreeting = () => {
    try {
      Speech.stop();
      const message = `${profile.name} ơi! Cùng ngắm những huy hiệu lấp lánh bé đã thu thập được nhé!`;
      Speech.speak(message, {
        language: "vi-VN",
        pitch: 1.2,
        rate: 1.05,
      });
    } catch (e) {}
  };

  // Phát âm khi bấm vào sticker thú cưng
  const playAnimalSound = (animalName: string, soundText: string) => {
    try {
      Speech.stop();
      Speech.speak(soundText, {
        language: "vi-VN",
        pitch: 1.25,
        rate: 1.05,
      });
    } catch (e) {}
  };

  const handleSwitchProfile = () => {
    if (profile.role === "child") {
      setPinModalVisible(true);
    } else {
      router.replace("/profiles");
    }
  };

  // Danh sách huy hiệu (Badges)
  const BADGES = [
    {
      id: 1,
      title: "Vua Đếm Số",
      desc: "Đếm chuẩn 1 - 20",
      status: "achieved",
      tag: "Hoàn thành",
      icon: "123",
      iconEmoji: "🔢",
      bgColor: "#FEF3C7",
    },
    {
      id: 2,
      title: "Nhà Thám Hiểm",
      desc: "Vượt qua 5 ải",
      status: "achieved",
      tag: "Hoàn thành",
      icon: "compass",
      iconEmoji: "🧭",
      bgColor: "#E0F2FE",
    },
    {
      id: 3,
      title: "Bé Chăm Chỉ",
      desc: "Học 3 ngày liền",
      status: "achieved",
      tag: "Hoàn thành",
      icon: "award",
      iconEmoji: "⭐",
      bgColor: "#FCE7F3",
    },
    {
      id: 4,
      title: "Cú Vọ Tinh Anh",
      desc: "Làm bài ban đêm",
      status: "in_progress",
      progress: "2/3",
      progressRatio: 0.66,
      iconEmoji: "🦉",
      bgColor: "#EDE9FE",
    },
    {
      id: 5,
      title: "Nhà Hình Học",
      desc: "Nhận biết 4 hình",
      status: "locked",
      tag: "Chặng 2",
      iconEmoji: "📐",
      bgColor: "#F4EFEA",
    },
    {
      id: 6,
      title: "Vua So Sánh",
      desc: "Lớn hơn & Bé hơn",
      status: "locked",
      tag: "Chặng 3",
      iconEmoji: "⚖️",
      bgColor: "#F4EFEA",
    },
  ];

  // Danh sách bạn nhỏ (Stickers)
  const STICKERS = [
    {
      id: 1,
      name: "Thỏ Trắng",
      emoji: "🐰",
      tag: "Nhảy tưng tưng",
      bgColor: "#FDF2F8",
      tagBg: "#FFDAD8",
      tagColor: "#AE2F34",
      sound: "Thỏ con nhảy nhót! Boing boing!",
    },
    {
      id: 2,
      name: "Cáo Nhỏ",
      emoji: "🦊",
      tag: "Thông thái",
      bgColor: "#FFF7ED",
      tagBg: "#FFDF9B",
      tagColor: "#785A00",
      sound: "Cáo nhỏ thông thái xin chào bé!",
    },
    {
      id: 3,
      name: "Gà Con",
      emoji: "🐥",
      tag: "Chăm chỉ",
      bgColor: "#FEFCE8",
      tagBg: "#FFD167",
      tagColor: "#251A00",
      sound: "Chiếp chiếp! Bé học giỏi quá!",
    },
    {
      id: 4,
      name: "Cún Vàng",
      emoji: "🐶",
      tag: "Trung thành",
      bgColor: "#FFFBEB",
      tagBg: "#C6E7FF",
      tagColor: "#00658D",
      sound: "Gâu gâu! Cún vàng chúc mừng bé!",
    },
    {
      id: 5,
      name: "Chuột Nhí",
      emoji: "🐭",
      tag: "Nhanh nhẹn",
      bgColor: "#FAF5FF",
      tagBg: "#F3EAFF",
      tagColor: "#6F7880",
      sound: "Chít chít! Chuột con siêu nhanh nhẹn!",
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* HEADER - TOP APP BAR (BẬT BO GÓC TRÒN DƯỚI ĐẶC TRƯNG) */}
      <View style={styles.topAppBar}>
        {/* Profile Avatar Bé Na */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={handleSwitchProfile}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarEmoji}>
                {profile.avatarIcon || "👧"}
              </Text>
            </View>
            <View style={styles.avatarLevelBadge}>
              <Text style={styles.avatarLevelText}>1</Text>
            </View>
          </View>

          <View style={styles.profileMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>{profile.name || "Bé Na"}</Text>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeBadgeText}>
                  {profile.grade || "Lớp 1"}
                </Text>
              </View>
            </View>
            <Text style={styles.subProfileText}>Học sinh chăm ngoan</Text>
          </View>
        </TouchableOpacity>

        {/* Counter Pill & Controls */}
        <View style={styles.headerControls}>
          {/* 14 Gold Stars Counter Pill */}
          <View style={styles.starCounterPill}>
            <Text style={styles.starEmoji}>⭐</Text>
            <Text style={styles.starCountText}>
              {profile.totalStars !== undefined ? profile.totalStars : 14}
            </Text>
          </View>

          {/* Button - Bật âm thanh */}
          <TouchableOpacity
            style={styles.circleControlBtn}
            onPress={speakGreeting}
            activeOpacity={0.7}
          >
            <Ionicons name="volume-medium" size={20} color="#00658D" />
          </TouchableOpacity>

          {/* Button - Cài đặt / Đổi hồ sơ */}
          <TouchableOpacity
            style={styles.circleControlBtn}
            onPress={handleSwitchProfile}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-sharp" size={18} color="#6F7880" />
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN SCROLLABLE CONTENT CANVAS */}
      <ScrollView
        contentContainerStyle={styles.scrollCanvas}
        showsVerticalScrollIndicator={false}
      >
        {/* SECTION 1: HERO BANNER / MASCOT BUBU & SPEECH BUBBLE */}
        <View style={styles.heroBanner}>
          {/* Decorative Cloud blobs */}
          <View style={styles.decorCloudTopRight} />
          <View style={styles.decorCloudBottom} />

          {/* Speech Bubble from Bubu */}
          <View style={styles.speechBubble}>
            <View style={styles.speechTextCol}>
              <Text style={styles.speechTitle}>
                {profile.name || "Bé Na"} ơi! ✨
              </Text>
              <Text style={styles.speechDesc}>
                Cùng ngắm những huy hiệu lấp lánh bé đã thu thập được nhé!
              </Text>
            </View>

            {/* Audio Button */}
            <TouchableOpacity
              style={styles.speechAudioBtn}
              onPress={speakGreeting}
              activeOpacity={0.8}
            >
              <Ionicons name="volume-high" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Speech Bubble Arrow */}
            <View style={styles.speechBubbleArrow} />
          </View>

          {/* Mascot Display */}
          <View style={styles.mascotRow}>
            {/* Mascot 3D Illustration Avatar */}
            <View style={styles.mascotAvatarCard}>
              <Text style={styles.mascotEmoji}>🐻</Text>
              <View style={styles.mascotNameTag}>
                <Text style={styles.mascotNameTagText}>Bubu</Text>
              </View>
            </View>

            {/* Quick Encouragement Badges */}
            <View style={styles.encouragementCol}>
              <View style={styles.leadBadge}>
                <Text style={styles.leadBadgeIcon}>👑</Text>
                <Text style={styles.leadBadgeText}>Đang dẫn đầu!</Text>
              </View>
              <Text style={styles.encouragementText}>Bé học rất chăm! 🌟</Text>
            </View>
          </View>
        </View>

        {/* SECTION 2: STAT SUMMARY CARDS (Tactile, pillowy 3D tokens) */}
        <View style={styles.statsSummaryRow}>
          {/* Huy hiệu */}
          <View style={styles.statPillCard}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#FFDF9B" }]}
            >
              <Text style={styles.statIconText}>🏅</Text>
            </View>
            <Text style={styles.statCardLabel}>Huy hiệu</Text>
            <Text style={styles.statCardNumber}>6</Text>
          </View>

          {/* Ngôi sao */}
          <View style={styles.statPillCard}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#FFD167" }]}
            >
              <Text style={styles.statIconText}>⭐</Text>
            </View>
            <Text style={styles.statCardLabel}>Ngôi sao</Text>
            <Text style={styles.statCardNumber}>
              {profile.totalStars !== undefined ? profile.totalStars : 14}
            </Text>
          </View>

          {/* Sticker bạn nhỏ */}
          <View style={styles.statPillCard}>
            <View
              style={[styles.statIconCircle, { backgroundColor: "#FFDAD8" }]}
            >
              <Text style={styles.statIconText}>🐾</Text>
            </View>
            <Text style={styles.statCardLabel}>Bạn nhỏ</Text>
            <Text style={styles.statCardNumber}>5</Text>
          </View>
        </View>

        {/* SECTION 3: BADGES SECTION (HUY HIỆU ĐÃ ĐẠT & SẮP MỞ) */}
        <View style={styles.sectionContainer}>
          {/* Header Row */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View
                style={[
                  styles.sectionPillIndicator,
                  { backgroundColor: "#4DA8DA" },
                ]}
              />
              <Text style={styles.sectionHeading}>Bộ sưu tập Huy hiệu</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: "#C6E7FF" }]}>
              <Text style={[styles.sectionBadgeText, { color: "#00658D" }]}>
                3/6 Đã đạt
              </Text>
            </View>
          </View>

          {/* 2-Column Grid of Tactile Badges */}
          <View style={styles.badgesGrid}>
            {BADGES.map((badge) => {
              const isAchieved = badge.status === "achieved";
              const isInProgress = badge.status === "in_progress";
              const isLocked = badge.status === "locked";

              return (
                <View
                  key={badge.id}
                  style={[
                    styles.badge3DCard,
                    isLocked && styles.badge3DCardLocked,
                  ]}
                >
                  {/* Top-Right Success Checkmark */}
                  {isAchieved && (
                    <View style={styles.badgeCheckmarkBadge}>
                      <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                    </View>
                  )}

                  {/* Badge Icon in circle */}
                  <View
                    style={[
                      styles.badgeIconContainer,
                      { backgroundColor: badge.bgColor },
                      isLocked && styles.badgeIconContainerLocked,
                    ]}
                  >
                    {isLocked ? (
                      <Ionicons name="lock-closed" size={24} color="#6F7880" />
                    ) : (
                      <Text style={styles.badgeEmoji}>{badge.iconEmoji}</Text>
                    )}
                  </View>

                  {/* Title & Desc */}
                  <Text
                    style={[
                      styles.badgeCardTitle,
                      isLocked && styles.badgeCardTitleLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {badge.title}
                  </Text>
                  <Text
                    style={[
                      styles.badgeCardDesc,
                      isLocked && styles.badgeCardDescLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {badge.desc}
                  </Text>

                  {/* Bottom Indicator / Progress / Pill */}
                  {isAchieved && (
                    <View style={styles.badgeCompletedPill}>
                      <Text style={styles.badgeCompletedText}>{badge.tag}</Text>
                    </View>
                  )}

                  {isInProgress && (
                    <View style={styles.badgeProgressContainer}>
                      <View style={styles.badgeProgressTrack}>
                        <View
                          style={[
                            styles.badgeProgressFill,
                            {
                              width: `${(badge.progressRatio || 0.66) * 100}%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.badgeProgressText}>
                        Tiến độ {badge.progress}
                      </Text>
                    </View>
                  )}

                  {isLocked && (
                    <View style={styles.badgeLockedPill}>
                      <Text style={styles.badgeLockedText}>{badge.tag}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* SECTION 4: STICKERS / PET FRIENDS COLLECTION */}
        <View style={styles.sectionContainer}>
          {/* Header Row */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleGroup}>
              <View
                style={[
                  styles.sectionPillIndicator,
                  { backgroundColor: "#FF7372" },
                ]}
              />
              <Text style={styles.sectionHeading}>Bạn Nhỏ Đã Thu Thập</Text>
            </View>
            <View style={[styles.sectionBadge, { backgroundColor: "#FFDAD8" }]}>
              <Text style={[styles.sectionBadgeText, { color: "#AE2F34" }]}>
                5 Bạn
              </Text>
            </View>
          </View>

          {/* Instruction pill with audio prompt */}
          <View style={styles.instructionPill}>
            <Ionicons name="volume-medium" size={18} color="#00658D" />
            <Text style={styles.instructionPillText}>
              Bé hãy chạm vào các bạn nhỏ để nghe tiếng kêu vui nhộn nhé!
            </Text>
          </View>

          {/* Horizontal Scrollable Row of Chubby Animal Sticker Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stickersScrollContainer}
          >
            {STICKERS.map((sticker) => (
              <TouchableOpacity
                key={sticker.id}
                style={styles.sticker3DCard}
                activeOpacity={0.8}
                onPress={() => playAnimalSound(sticker.name, sticker.sound)}
              >
                {/* Animal Avatar Icon */}
                <View
                  style={[
                    styles.stickerAvatarCircle,
                    { backgroundColor: sticker.bgColor },
                  ]}
                >
                  <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                </View>

                {/* Name */}
                <Text style={styles.stickerName}>{sticker.name}</Text>

                {/* Trait Badge */}
                <View
                  style={[
                    styles.stickerTraitPill,
                    { backgroundColor: sticker.tagBg },
                  ]}
                >
                  <Ionicons
                    name="sparkles"
                    size={10}
                    color={sticker.tagColor}
                  />
                  <Text
                    style={[
                      styles.stickerTraitText,
                      { color: sticker.tagColor },
                    ]}
                  >
                    {sticker.tag}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SECTION 5: BIG CELEBRATORY CALL TO PLAY BUTTON */}
        <View style={styles.callToPlaySection}>
          <TouchableOpacity
            style={styles.callToPlayBtn}
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/journey")}
          >
            <Text style={styles.callToPlayRocket}>🚀</Text>
            <Text style={styles.callToPlayText}>TIẾP TỤC HÀNH TRÌNH</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PARENT PIN MODAL */}
      <ParentPinModal
        visible={pinModalVisible}
        profile={profile}
        title="Xác thực đổi hồ sơ"
        subtitle="Nhập mã PIN của bố mẹ để đổi sang hồ sơ khác hoặc thoát ra."
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
  container: {
    flex: 1,
    backgroundColor: "#FDF7FF",
  },

  // TOP APP BAR
  topAppBar: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFDF9B",
    borderWidth: 2,
    borderColor: "#4DA8DA",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarEmoji: {
    fontSize: 26,
  },
  avatarLevelBadge: {
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
  avatarLevelText: {
    color: "#765900",
    fontSize: 10,
    fontWeight: "800",
  },
  profileMeta: {
    justifyContent: "center",
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  gradeBadgeText: {
    color: "#001E2D",
    fontSize: 11,
    fontWeight: "700",
  },
  subProfileText: {
    color: "#3F484F",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starCounterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFDF9B",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  starEmoji: {
    fontSize: 14,
  },
  starCountText: {
    color: "#251A00",
    fontSize: 15,
    fontWeight: "800",
  },
  circleControlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3EAFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // SCROLL CONTENT
  scrollCanvas: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 20,
  },

  // SECTION 1: HERO BANNER
  heroBanner: {
    backgroundColor: "#D9EFFF",
    borderRadius: 36,
    padding: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  decorCloudTopRight: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    top: -20,
    right: -20,
  },
  decorCloudBottom: {
    position: "absolute",
    width: 140,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    bottom: -15,
    left: "30%",
  },
  speechBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEE4FF",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  speechTextCol: {
    flex: 1,
    marginRight: 10,
  },
  speechTitle: {
    color: "#1E1830",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  speechDesc: {
    color: "#3F484F",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  speechAudioBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4DA8DA",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  speechBubbleArrow: {
    position: "absolute",
    bottom: -10,
    left: 40,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
  },
  mascotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 16,
    paddingHorizontal: 8,
  },
  mascotAvatarCard: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFFDF9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
  },
  mascotEmoji: {
    fontSize: 54,
  },
  mascotNameTag: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#FFD167",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  mascotNameTagText: {
    color: "#765900",
    fontSize: 10,
    fontWeight: "800",
  },
  encouragementCol: {
    alignItems: "flex-end",
    gap: 6,
  },
  leadBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFD167",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 4,
  },
  leadBadgeIcon: {
    fontSize: 12,
  },
  leadBadgeText: {
    color: "#765900",
    fontSize: 12,
    fontWeight: "800",
  },
  encouragementText: {
    color: "#00658D",
    fontSize: 13,
    fontWeight: "700",
  },

  // SECTION 2: STAT SUMMARY CARDS (3D TOKENS)
  statsSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  statPillCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statIconText: {
    fontSize: 20,
  },
  statCardLabel: {
    color: "#3F484F",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  statCardNumber: {
    color: "#1E1830",
    fontSize: 22,
    fontWeight: "800",
  },

  // SECTION GENERAL
  sectionContainer: {
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionPillIndicator: {
    width: 10,
    height: 22,
    borderRadius: 9999,
  },
  sectionHeading: {
    color: "#1E1830",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "800",
  },

  // SECTION 3: 2-COLUMN BADGES GRID
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  badge3DCard: {
    width: (width - 44) / 2,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    padding: 14,
    alignItems: "center",
    position: "relative",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  badge3DCardLocked: {
    backgroundColor: "#F4EFEA",
    borderBottomColor: "#EADBCE",
    opacity: 0.88,
  },
  badgeCheckmarkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeIconContainerLocked: {
    backgroundColor: "#E9DDFF",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BFC8D0",
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeCardTitle: {
    color: "#1E1830",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
    textAlign: "center",
  },
  badgeCardTitleLocked: {
    color: "#6F7880",
  },
  badgeCardDesc: {
    color: "#3F484F",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 10,
  },
  badgeCardDescLocked: {
    color: "#9CA3AF",
  },
  badgeCompletedPill: {
    backgroundColor: "#FFDF9B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeCompletedText: {
    color: "#5B4300",
    fontSize: 11,
    fontWeight: "800",
  },
  badgeProgressContainer: {
    width: "100%",
    alignItems: "center",
    gap: 4,
  },
  badgeProgressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "#EEE4FF",
    borderRadius: 9999,
    overflow: "hidden",
  },
  badgeProgressFill: {
    height: "100%",
    backgroundColor: "#4DA8DA",
    borderRadius: 9999,
  },
  badgeProgressText: {
    color: "#00658D",
    fontSize: 11,
    fontWeight: "700",
  },
  badgeLockedPill: {
    backgroundColor: "#F3EAFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeLockedText: {
    color: "#6F7880",
    fontSize: 11,
    fontWeight: "700",
  },

  // SECTION 4: STICKERS
  instructionPill: {
    backgroundColor: "#F8F1FF",
    borderWidth: 1,
    borderColor: "#F3EAFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  instructionPillText: {
    flex: 1,
    color: "#3F484F",
    fontSize: 12,
    fontWeight: "500",
  },
  stickersScrollContainer: {
    paddingVertical: 6,
    gap: 12,
  },
  sticker3DCard: {
    width: 116,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    padding: 12,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  stickerAvatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  stickerEmoji: {
    fontSize: 32,
  },
  stickerName: {
    color: "#1E1830",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  stickerTraitPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    gap: 4,
  },
  stickerTraitText: {
    fontSize: 10,
    fontWeight: "800",
  },

  // SECTION 5: CALL TO PLAY BUTTON
  callToPlaySection: {
    marginTop: 6,
    marginBottom: 10,
  },
  callToPlayBtn: {
    backgroundColor: "#FF7372",
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderBottomWidth: 6,
    borderBottomColor: "#D84544",
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: "#FF7372",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  callToPlayRocket: {
    fontSize: 20,
  },
  callToPlayText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
