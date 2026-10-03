import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { BrandHeader } from "../../src/components/BrandHeader";
import { useAuth } from "../../src/context/AuthContext";
import { emathApi, JourneyChapter, JourneyLevel } from "../../src/services/emathApi";

const { width } = Dimensions.get("window");

interface LevelItem {
  id: number;
  chapter: number;
  chapterTitle: string;
  chapterDesc: string;
  title: string;
  desc: string;
  type: "lesson" | "chest" | "trophy" | "fast_quiz";
  status: "completed" | "active" | "locked";
  stars: number;
  xp: number;
  iconName: string;
}

const JOURNEY_DATA: LevelItem[] = [
  // CHAPTER 1
  {
    id: 1,
    chapter: 1,
    chapterTitle: "Chương 1: Làm Quen Con Số",
    chapterDesc: "Nhận biết mặt số và tập đếm vui nhộn",
    title: "Bài 1: Đếm số từ 1 đến 5",
    desc: "Cùng làm quen và đếm các bạn động vật dễ thương từ 1 đến 5.",
    type: "lesson",
    status: "completed",
    stars: 3,
    xp: 20,
    iconName: "star",
  },
  {
    id: 2,
    chapter: 1,
    chapterTitle: "Chương 1: Làm Quen Con Số",
    chapterDesc: "Nhận biết mặt số và tập đếm vui nhộn",
    title: "Bài 2: Đếm số từ 6 đến 10",
    desc: "Tập đếm các đồ vật xung quanh bé lên tới 10.",
    type: "lesson",
    status: "completed",
    stars: 3,
    xp: 20,
    iconName: "book-open",
  },
  {
    id: 3,
    chapter: 1,
    chapterTitle: "Chương 1: Làm Quen Con Số",
    chapterDesc: "Nhận biết mặt số và tập đếm vui nhộn",
    title: "Rương Bí Mật Số Học",
    desc: "Chúc mừng bé đã chăm chỉ! Mở rương để nhận 50 kim cương.",
    type: "chest",
    status: "completed",
    stars: 0,
    xp: 50,
    iconName: "gift",
  },
  {
    id: 4,
    chapter: 1,
    chapterTitle: "Chương 1: Làm Quen Con Số",
    chapterDesc: "Nhận biết mặt số và tập đếm vui nhộn",
    title: "Bài 3: So Sánh Lớn Hơn, Bé Hơn",
    desc: "Học cách so sánh số lượng kẹo và quả táo.",
    type: "lesson",
    status: "active",
    stars: 0,
    xp: 25,
    iconName: "shapes",
  },
  {
    id: 5,
    chapter: 1,
    chapterTitle: "Chương 1: Làm Quen Con Số",
    chapterDesc: "Nhận biết mặt số và tập đếm vui nhộn",
    title: "Đấu Trường Chớp Nhoáng",
    desc: "Thử tài phản xạ chọn số nhanh trong 60 giây.",
    type: "fast_quiz",
    status: "locked",
    stars: 0,
    xp: 30,
    iconName: "bolt",
  },
  {
    id: 6,
    chapter: 1,
    chapterTitle: "Chương 1: Làm Quen Con Số",
    chapterDesc: "Nhận biết mặt số và tập đếm vui nhộn",
    title: "Trùm Cuối Chương 1",
    desc: "Vượt qua bài tổng hợp để nhận Cúp Bạc!",
    type: "trophy",
    status: "locked",
    stars: 0,
    xp: 60,
    iconName: "trophy",
  },

  // CHAPTER 2
  {
    id: 7,
    chapter: 2,
    chapterTitle: "Chương 2: Phép Cộng Kỳ Diệu",
    chapterDesc: "Gộp các nhóm đồ vật và cộng số",
    title: "Bài 4: Phép Cộng Trong Phạm Vi 5",
    desc: "Học phép cộng với các que tính và ngón tay.",
    type: "lesson",
    status: "locked",
    stars: 0,
    xp: 25,
    iconName: "plus",
  },
  {
    id: 8,
    chapter: 2,
    chapterTitle: "Chương 2: Phép Cộng Kỳ Diệu",
    chapterDesc: "Gộp các nhóm đồ vật và cộng số",
    title: "Bài 5: Phép Cộng Trong Phạm Vi 10",
    desc: "Giải các câu đố cộng đồ chơi thú vị.",
    type: "lesson",
    status: "locked",
    stars: 0,
    xp: 25,
    iconName: "calculator",
  },
  {
    id: 9,
    chapter: 2,
    chapterTitle: "Chương 2: Phép Cộng Kỳ Diệu",
    chapterDesc: "Gộp các nhóm đồ vật và cộng số",
    title: "Rương Thần Kỳ",
    desc: "Rương kho báu dành cho phù thủy toán học.",
    type: "chest",
    status: "locked",
    stars: 0,
    xp: 50,
    iconName: "gift",
  },
  {
    id: 10,
    chapter: 2,
    chapterTitle: "Chương 2: Phép Cộng Kỳ Diệu",
    chapterDesc: "Gộp các nhóm đồ vật và cộng số",
    title: "Thử Thách Vương Giả Toán Học",
    desc: "Bài kiểm tra cuối kỳ đạt Huy Hiệu Vàng.",
    type: "trophy",
    status: "locked",
    stars: 0,
    xp: 100,
    iconName: "crown",
  },
];

// Khai báo chuỗi độ lệch X tạo hình sóng lượn Duolingo (-80 -> +80)
const S_CURVE_OFFSETS = [0, 60, 85, 45, -40, -85, -55, 0, 65, 80, 20];

export default function JourneyRoute() {
  const router = useRouter();
  const { activeProfile, authToken } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<any | null>(null);
  const [chapters, setChapters] = useState<JourneyChapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const chapterLayouts = useRef<{ [key: string]: number }>({});
  const hasAutoScrolled = useRef<boolean>(false);

  // Animation nhảy nhót cho Bong bóng "BẮT ĐẦU"
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Tải dữ liệu hành trình từ Backend DB
  const loadJourney = useCallback(async () => {
    try {
      setLoading(true);
      hasAutoScrolled.current = false;
      const data = await emathApi.getJourney(activeProfile?.id, authToken || undefined);
      if (data && data.length > 0) {
        setChapters(data);
      } else {
        // Fallback default chapters nếu DB trống
        setChapters([
          {
            id: "1",
            title: "Chương 1: Làm Quen Con Số",
            desc: "Nhận biết mặt số & tập đếm 1-10",
            orderIndex: 1,
            levels: JOURNEY_DATA.filter((i) => i.chapter === 1) as any,
          },
          {
            id: "2",
            title: "Chương 2: Phép Cộng Kỳ Diệu",
            desc: "Gộp nhóm đồ vật & cộng vui nhộn",
            orderIndex: 2,
            levels: JOURNEY_DATA.filter((i) => i.chapter === 2) as any,
          },
        ]);
      }
    } catch (error) {
      console.warn("Lỗi tải hành trình từ DB, dùng fallback:", error);
      setChapters([
        {
          id: "1",
          title: "Chương 1: Làm Quen Con Số",
          desc: "Nhận biết mặt số & tập đếm 1-10",
          orderIndex: 1,
          levels: JOURNEY_DATA.filter((i) => i.chapter === 1) as any,
        },
        {
          id: "2",
          title: "Chương 2: Phép Cộng Kỳ Diệu",
          desc: "Gộp nhóm đồ vật & cộng vui nhộn",
          orderIndex: 2,
          levels: JOURNEY_DATA.filter((i) => i.chapter === 2) as any,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [activeProfile?.id, authToken]);

  useFocusEffect(
    useCallback(() => {
      loadJourney();
    }, [loadJourney])
  );

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  let globalIndexCounter = 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* HEADER TOP BAR */}
      <View style={styles.topHeader}>
        <BrandHeader />
        {/* Gamification Bar */}
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statText}>5</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statIcon}>💎</Text>
            <Text style={[styles.statText, { color: "#38BDF8" }]}>350</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={[styles.statText, { color: "#EF4444" }]}>5</Text>
          </View>
        </View>
      </View>

      {/* SCROLLABLE WINDING MAP */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {chapters.map((chap, cIdx) => (
          <View
            key={chap.id}
            style={styles.chapterSection}
            onLayout={(e) => {
              chapterLayouts.current[chap.id] = e.nativeEvent.layout.y;
            }}
          >
            {/* Chapter Banner */}
            <View style={[styles.chapterBanner, { borderColor: chap.color }]}>
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTag}>HỌC PHẦN {chap.id}</Text>
                <Text style={styles.chapterTitle}>{chap.title}</Text>
                <Text style={styles.chapterDesc}>{chap.desc}</Text>
              </View>
              <TouchableOpacity
                style={[styles.guideBookBtn, { backgroundColor: chap.color }]}
                activeOpacity={0.8}
              >
                <Ionicons name="book" size={18} color="#FFF" />
                <Text style={styles.guideBookText}>Sổ tay</Text>
              </TouchableOpacity>
            </View>

            {/* Path Nodes */}
            <View style={styles.nodesContainer}>
              {chap.levels.map((item, idx) => {
                const currentIndex = globalIndexCounter;
                globalIndexCounter++;

                const currentX =
                  S_CURVE_OFFSETS[currentIndex % S_CURVE_OFFSETS.length];
                const nextX =
                  S_CURVE_OFFSETS[(currentIndex + 1) % S_CURVE_OFFSETS.length];

                const isCompleted = item.status === "completed";
                const isActive = item.status === "active";
                const isLocked = item.status === "locked";

                // Màu sắc theo loại node & trạng thái
                let nodeColor = "#10B981"; // completed: Xanh ngọc
                let nodeBottomColor = "#047857";

                if (isActive) {
                  nodeColor = "#E50914"; // active: Đỏ nổi bật
                  nodeBottomColor = "#991B1B";
                } else if (isLocked) {
                  nodeColor = "#262626"; // locked: Xám
                  nodeBottomColor = "#141414";
                } else if (item.type === "chest") {
                  nodeColor = "#F59E0B"; // chest vàng
                  nodeBottomColor = "#B45309";
                } else if (item.type === "trophy") {
                  nodeColor = "#8B5CF6"; // trophy tím
                  nodeBottomColor = "#6D28D9";
                }

                return (
                  <View
                    key={item.id}
                    style={styles.nodeWrapper}
                    onLayout={(e) => {
                      if (isActive && !hasAutoScrolled.current) {
                        hasAutoScrolled.current = true;
                        const nodeY = e.nativeEvent.layout.y;
                        const chapY = chapterLayouts.current[chap.id] || 0;
                        const targetY = Math.max(0, chapY + nodeY - 180);

                        setTimeout(() => {
                          scrollViewRef.current?.scrollTo({
                            y: targetY,
                            animated: true,
                          });
                        }, 250);
                      }
                    }}
                  >
                    {/* SPEECH BUBBLE FOR ACTIVE NODE */}
                    {isActive && (
                      <Animated.View
                        style={[
                          styles.activeTooltip,
                          {
                            transform: [
                              { translateX: currentX },
                              { translateY: bounceAnim },
                            ],
                          },
                        ]}
                      >
                        <Text style={styles.activeTooltipText}>BẮT ĐẦU!</Text>
                        <View style={styles.tooltipArrow} />
                      </Animated.View>
                    )}

                    {/* MAIN 3D NODE BUTTON */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={isLocked}
                      onPress={() => setSelectedLevel(item)}
                      style={[
                        styles.nodeBase,
                        {
                          transform: [{ translateX: currentX }],
                          backgroundColor: nodeColor,
                          borderColor: nodeBottomColor,
                        },
                        isActive && styles.activeNodeGlow,
                        item.type === "chest" && styles.chestNodeShape,
                        item.type === "trophy" && styles.trophyNodeShape,
                      ]}
                    >
                      {/* Outer Ring for Active */}
                      {isActive && <View style={styles.activeRing} />}

                      {/* Icon inside Node */}
                      {isLocked ? (
                        <Ionicons name="lock-closed" size={24} color="#737373" />
                      ) : item.type === "chest" ? (
                        <MaterialCommunityIcons
                          name="treasure-chest"
                          size={32}
                          color={isCompleted ? "#FEF08A" : "#FFF"}
                        />
                      ) : item.type === "trophy" ? (
                        <FontAwesome5
                          name="trophy"
                          size={28}
                          color={isCompleted ? "#FCD34D" : "#FFF"}
                        />
                      ) : item.type === "fast_quiz" ? (
                        <FontAwesome5 name="bolt" size={26} color="#FFF" />
                      ) : (
                        <FontAwesome5
                          name={isCompleted ? "check" : item.iconName}
                          size={24}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>

                    {/* STARS BADGE FOR COMPLETED LESSONS */}
                    {isCompleted && item.stars > 0 && (
                      <View
                        style={[
                          styles.starsBadge,
                          { transform: [{ translateX: currentX }] },
                        ]}
                      >
                        {[1, 2, 3].map((s) => (
                          <Ionicons
                            key={s}
                            name="star"
                            size={12}
                            color={s <= item.stars ? "#FBBF24" : "#525252"}
                            style={{ marginHorizontal: 1 }}
                          />
                        ))}
                      </View>
                    )}

                    {/* STEPPING STONES (DOTS) CONNECTING TO NEXT NODE */}
                    {idx < chap.levels.length - 1 && (
                      <View style={styles.steppingStonesContainer}>
                        {[0.25, 0.5, 0.75].map((ratio, dIdx) => {
                          const dotX = currentX + (nextX - currentX) * ratio;
                          return (
                            <View
                              key={dIdx}
                              style={[
                                styles.stepDot,
                                {
                                  transform: [{ translateX: dotX }],
                                  backgroundColor: isCompleted
                                    ? "#10B981"
                                    : "#333333",
                                },
                              ]}
                            />
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* LEVEL DETAILS BOTTOM SHEET / MODAL */}
      <Modal
        visible={!!selectedLevel}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedLevel(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalTop}>
              <View style={styles.modalCategoryBadge}>
                <Text style={styles.modalCategoryText}>
                  {selectedLevel?.chapterTitle.toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedLevel(null)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#A3A3A3" />
              </TouchableOpacity>
            </View>

            {/* Title & Desc */}
            <Text style={styles.modalTitle}>{selectedLevel?.title}</Text>
            <Text style={styles.modalDesc}>{selectedLevel?.desc}</Text>

            {/* Rewards info */}
            <View style={styles.rewardCard}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardEmoji}>⚡</Text>
                <Text style={styles.rewardValue}>+{selectedLevel?.xp} XP</Text>
                <Text style={styles.rewardLabel}>Kinh nghiệm</Text>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <Text style={styles.rewardEmoji}>⭐</Text>
                <Text style={styles.rewardValue}>
                  {selectedLevel?.stars || 3} Sao
                </Text>
                <Text style={styles.rewardLabel}>Mục tiêu</Text>
              </View>
            </View>

            {/* ACTION BUTTON (3D DUOLINGO STYLE) */}
            <TouchableOpacity
              style={styles.startButton}
              activeOpacity={0.8}
              onPress={() => {
                const targetId = selectedLevel?.id || 1;
                setSelectedLevel(null);
                router.push({
                  pathname: "/lesson/[id]",
                  params: { id: targetId.toString() },
                });
              }}
            >
              <Text style={styles.startButtonText}>
                {selectedLevel?.status === "completed"
                  ? "ÔN TẬP LẠI"
                  : "BẮT ĐẦU (+10 XP)"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  topHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#181818",
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#262626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    color: "#F59E0B",
    fontSize: 13,
    fontWeight: "800",
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: "center",
  },
  chapterSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  chapterBanner: {
    width: width - 32,
    backgroundColor: "#1E1E1E",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 5,
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  chapterInfo: {
    flex: 1,
    marginRight: 10,
  },
  chapterTag: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },
  chapterTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  chapterDesc: {
    color: "#A3A3A3",
    fontSize: 12,
  },
  guideBookBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  guideBookText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  nodesContainer: {
    width: "100%",
    alignItems: "center",
  },
  nodeWrapper: {
    alignItems: "center",
    marginVertical: 4,
  },

  // 3D DUOLINGO NODE BUTTON
  nodeBase: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 6, // Hiệu ứng 3D đáy nút của Duolingo
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 2,
  },
  chestNodeShape: {
    width: 68,
    height: 68,
    borderRadius: 20,
  },
  trophyNodeShape: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  activeNodeGlow: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  activeRing: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "rgba(229, 9, 20, 0.5)",
    borderStyle: "dashed",
  },

  // ACTIVE SPEECH BUBBLE TOOLTIP
  activeTooltip: {
    position: "absolute",
    top: -38,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 6,
  },
  activeTooltipText: {
    color: "#E50914",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFFFFF",
  },

  // STARS BELOW COMPLETED NODE
  starsBadge: {
    flexDirection: "row",
    marginTop: 6,
    backgroundColor: "#1F1F1F",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333333",
  },

  // CONNECTING STEPPING STONES
  steppingStonesContainer: {
    marginVertical: 8,
    alignItems: "center",
    gap: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderBottomWidth: 2,
    borderBottomColor: "#171717",
  },

  // MODAL STYLING
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    borderWidth: 1,
    borderColor: "#333333",
  },
  modalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalCategoryBadge: {
    backgroundColor: "#312E81",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalCategoryText: {
    color: "#818CF8",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalDesc: {
    color: "#9CA3AF",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  rewardCard: {
    flexDirection: "row",
    backgroundColor: "#262626",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    justifyContent: "space-around",
    alignItems: "center",
  },
  rewardItem: {
    alignItems: "center",
  },
  rewardEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  rewardValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  rewardLabel: {
    color: "#737373",
    fontSize: 12,
  },
  rewardDivider: {
    width: 1,
    height: 36,
    backgroundColor: "#404040",
  },
  startButton: {
    backgroundColor: "#E50914",
    borderBottomWidth: 5,
    borderBottomColor: "#991B1B",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
