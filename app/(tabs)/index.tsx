import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { useAuth } from "../../src/context/AuthContext";
import { BrandHeader } from "../../src/components/BrandHeader";

export default function HomeRoute() {
  const router = useRouter();
  const { activeProfile, signOut } = useAuth();

  const profile = activeProfile || {
    id: "kid-1",
    name: "Bé Nam",
    role: "child" as const,
    grade: "Lớp 1",
    avatarColor: "#E11D48",
    avatarIcon: "🦁",
  };

  const isParent = profile.role === "parent";

  const speakGreeting = () => {
    const message = isParent
      ? `Xin chào Phụ huynh ${profile.name}. Báo cáo học tập của bé đã sẵn sàng.`
      : `Chào mừng ${profile.name}! Hôm nay chúng ta cùng học toán thật vui nhé!`;

    Speech.speak(message, {
      language: "vi-VN",
      pitch: isParent ? 1.0 : 1.2,
      rate: 0.9,
    });
  };

  const handleSwitchProfile = () => {
    router.replace("/profiles");
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <BrandHeader />

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={handleSwitchProfile}
        >
          <View
            style={[
              styles.miniAvatar,
              { backgroundColor: profile.avatarColor },
            ]}
          >
            <Text style={styles.miniAvatarEmoji}>{profile.avatarIcon}</Text>
          </View>
          <Text style={styles.profileBadgeName}>{profile.name}</Text>
          <Text style={styles.switchText}>Đổi ▼</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[
            styles.banner,
            isParent ? styles.parentBannerBg : styles.kidBannerBg,
          ]}
        >
          <View style={styles.bannerInfo}>
            <Text style={styles.welcomeTag}>
              {isParent
                ? "🛡️ CHẾ ĐỘ PHỤ HUYNH"
                : `⭐ ${profile.grade || "HỌC SINH"}`}
            </Text>
            <Text style={styles.bannerTitle}>
              {isParent
                ? `Xin chào, ${profile.name}`
                : `Hôm nay học gì thế, ${profile.name}?`}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {isParent
                ? "Theo dõi tiến độ, thời gian làm bài & kết quả học toán của các bé."
                : "Khám phá các bài toán vui nhộn và thử thách chinh phục điểm 10!"}
            </Text>

            <TouchableOpacity style={styles.speakBtn} onPress={speakGreeting}>
              <Text style={styles.speakBtnText}>🔊 Nghe lời chào</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bannerAvatarBig}>
            <Text style={styles.bigAvatarEmoji}>{profile.avatarIcon}</Text>
          </View>
        </View>

        {!isParent ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Bài học toán dành cho bé</Text>

            <View style={styles.cardsGrid}>
              <TouchableOpacity
                style={[styles.lessonCard, { backgroundColor: "#1E293B" }]}
                onPress={() => router.push("/(tabs)/journey")}
              >
                <Text style={styles.cardEmoji}>➕➖</Text>
                <Text style={styles.cardTitle}>Phép Cộng & Trừ</Text>
                <Text style={styles.cardDesc}>
                  10 bài tập vui nhộn với hình ảnh
                </Text>
                <View style={styles.startBadge}>
                  <Text style={styles.startBadgeText}>Bắt đầu ngay ▶</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.lessonCard, { backgroundColor: "#311B92" }]}
                onPress={() => router.push("/(tabs)/journey")}
              >
                <Text style={styles.cardEmoji}>📐🔺</Text>
                <Text style={styles.cardTitle}>Nhận Biết Hình Học</Text>
                <Text style={styles.cardDesc}>
                  Hình vuông, hình tròn, tam giác
                </Text>
                <View style={styles.startBadge}>
                  <Text style={styles.startBadgeText}>Khám phá ▶</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.lessonCard, { backgroundColor: "#004D40" }]}
                onPress={() => router.push("/(tabs)/journey")}
              >
                <Text style={styles.cardEmoji}>🧩🧠</Text>
                <Text style={styles.cardTitle}>Đố Vui Logic</Text>
                <Text style={styles.cardDesc}>Thử thách phát triển tư duy</Text>
                <View style={styles.startBadge}>
                  <Text style={styles.startBadgeText}>Chơi ngay ▶</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.lessonCard, { backgroundColor: "#4A148C" }]}
                onPress={() => router.push("/(tabs)/journey")}
              >
                <Text style={styles.cardEmoji}>🏆⏱️</Text>
                <Text style={styles.cardTitle}>Thi Đấu Tính Nhanh</Text>
                <Text style={styles.cardDesc}>
                  Thử thách 60 giây đạt điểm cao
                </Text>
                <View style={styles.startBadge}>
                  <Text style={styles.startBadgeText}>Vào thi ▶</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📊 Báo cáo học tập & Quản lý
            </Text>

            <View style={styles.parentStatsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>45 phút</Text>
                <Text style={styles.statLabel}>Thời gian học hôm nay</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>18/20</Text>
                <Text style={styles.statLabel}>Bài tập hoàn thành</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>9.2/10</Text>
                <Text style={styles.statLabel}>Điểm số trung bình</Text>
              </View>
            </View>

            <View style={styles.parentActionList}>
              <TouchableOpacity
                style={styles.parentActionItem}
                onPress={() => router.push("/(tabs)/parent")}
              >
                <Text style={styles.parentActionIcon}>⏰</Text>
                <View style={styles.parentActionContent}>
                  <Text style={styles.parentActionTitle}>
                    Giới hạn thời gian học
                  </Text>
                  <Text style={styles.parentActionSub}>
                    Đã đặt: Max 60 phút/ngày
                  </Text>
                </View>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.parentActionItem}
                onPress={() => router.push("/(tabs)/parent")}
              >
                <Text style={styles.parentActionIcon}>🔑</Text>
                <View style={styles.parentActionContent}>
                  <Text style={styles.parentActionTitle}>
                    Cài đặt mã PIN Phụ huynh
                  </Text>
                  <Text style={styles.parentActionSub}>
                    Mã PIN hiện tại: 1234
                  </Text>
                </View>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.parentActionItem}
                onPress={handleSwitchProfile}
              >
                <Text style={styles.parentActionIcon}>👶</Text>
                <View style={styles.parentActionContent}>
                  <Text style={styles.parentActionTitle}>
                    Quản lý danh sách Hồ sơ Bé
                  </Text>
                  <Text style={styles.parentActionSub}>
                    3 bé học viên đang hoạt động
                  </Text>
                </View>
                <Text style={styles.arrowText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footerRow}>
          <TouchableOpacity
            style={styles.switchProfileBtn}
            onPress={handleSwitchProfile}
          >
            <Text style={styles.switchProfileBtnText}>🔁 Chọn hồ sơ khác</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
            <Text style={styles.logoutBtnText}>🚪 Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
  },
  profileBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  miniAvatarEmoji: {
    fontSize: 14,
  },
  profileBadgeName: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginRight: 6,
  },
  switchText: {
    color: "#A0A0A0",
    fontSize: 10,
  },
  scrollContent: {
    padding: 20,
  },
  banner: {
    borderRadius: 16,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  kidBannerBg: {
    backgroundColor: "#1E1B4B",
    borderWidth: 1,
    borderColor: "#4338CA",
  },
  parentBannerBg: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#38BDF8",
  },
  bannerInfo: {
    flex: 1,
  },
  welcomeTag: {
    color: "#FFD700",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  speakBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speakBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  bannerAvatarBig: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  bigAvatarEmoji: {
    fontSize: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  lessonCard: {
    width: "48%",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ffffff15",
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDesc: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 14,
  },
  startBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  startBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  parentStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  statNumber: {
    color: "#38BDF8",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
  },
  parentActionList: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  parentActionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  parentActionIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  parentActionContent: {
    flex: 1,
  },
  parentActionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  parentActionSub: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 2,
  },
  arrowText: {
    color: "#64748B",
    fontSize: 20,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 30,
  },
  switchProfileBtn: {
    flex: 1,
    backgroundColor: "#262626",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  switchProfileBtnText: {
    color: "#E5E5E5",
    fontWeight: "bold",
    fontSize: 14,
  },
  logoutBtn: {
    flex: 1,
    backgroundColor: "#331515",
    borderWidth: 1,
    borderColor: "#E50914",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  logoutBtnText: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 14,
  },
});
