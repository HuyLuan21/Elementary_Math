import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";
import { emathApi, QuestionData, SubmitLessonResult } from "../../src/services/emathApi";
import { storage } from "../../src/utils/storage";
import { ParentPinModal } from "../../src/components/ParentPinModal";
import { playSoundEffect } from "../../src/utils/soundPlayer";

const { width } = Dimensions.get("window");

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

// Dữ liệu câu hỏi fallback chuẩn chương 1 (Đếm số, màu sắc, nhận biết hình học, thời gian)
const FALLBACK_QUESTIONS: QuestionData[] = [
  {
    id: "1",
    type: "color_choice",
    questionText: "Hình nào dưới đây có màu đỏ 🔴?",
    numberedCards: [
      {
        index: 1,
        label: "Hình 1",
        color: "#EF4444",
        shape: "circle",
      },
      {
        index: 2,
        label: "Hình 2",
        color: "#10B981",
        shape: "square",
      },
      {
        index: 3,
        label: "Hình 3",
        color: "#3B82F6",
        shape: "circle",
      },
    ],
    options: [
      { id: "1", label: "Hình 1" },
      { id: "2", label: "Hình 2" },
      { id: "3", label: "Hình 3" },
    ],
    correctAnswerId: "1",
    explanation: "Chính xác! Hình số 1 có màu đỏ rực rỡ 🔴!",
  },
  {
    id: "2",
    type: "shape_choice",
    questionText: "Đâu là hình tròn ⭕?",
    numberedCards: [
      {
        index: 1,
        label: "Hình 1",
        color: "#38BDF8",
        shape: "circle",
      },
      {
        index: 2,
        label: "Hình 2",
        color: "#FBBF24",
        shape: "square",
      },
      {
        index: 3,
        label: "Hình 3",
        color: "#F87171",
        shape: "triangle",
      },
    ],
    options: [
      { id: "1", label: "Hình 1" },
      { id: "2", label: "Hình 2" },
      { id: "3", label: "Hình 3" },
    ],
    correctAnswerId: "1",
    explanation: "Tuyệt vời! Hình số 1 chính là hình tròn xinh xắn ⭕!",
  },
  {
    id: "3",
    type: "time",
    questionText: "Kim đồng hồ đang chỉ mấy giờ ⏰?",
    clockTime: { hour: 3, minute: 0 },
    options: [
      { id: "2:00", label: "2:00", subLabel: "2 giờ đúng" },
      { id: "3:00", label: "3:00", subLabel: "3 giờ đúng", icon: "⭐" },
      { id: "4:00", label: "4:00", subLabel: "4 giờ đúng" },
    ],
    correctAnswerId: "3:00",
    explanation: "Giỏi quá! Kim ngắn chỉ số 3 và kim dài chỉ số 12 là đúng 3:00 ⏰!",
  },
  {
    id: "4",
    type: "count",
    questionText: "Bé hãy đếm xem có bao nhiêu quả táo đỏ?",
    visualItems: ["🍎", "🍎", "🍎"],
    options: [
      { id: "2", label: "2 quả" },
      { id: "3", label: "3 quả", icon: "⭐" },
      { id: "4", label: "4 quả" },
    ],
    correctAnswerId: "3",
    explanation: "Đúng rồi! Có tất cả 3 quả táo đỏ thơm ngon 🍎!",
  },
];

// Helper chuyển đổi văn bản sang câu đọc tự nhiên cho trẻ nhỏ
const cleanTextForSpeech = (text: string): string => {
  if (!text) return "";
  const trimmed = text.trim();

  // Đọc giờ giấc tự nhiên: "3:00" -> "3 giờ", "03:30" -> "3 giờ 30 phút"
  const timeExactMatch = trimmed.match(/^0?(\d{1,2}):00$/);
  if (timeExactMatch) {
    return `${timeExactMatch[1]} giờ`;
  }
  const timeMinuteMatch = trimmed.match(/^0?(\d{1,2}):(\d{2})$/);
  if (timeMinuteMatch) {
    const mins = parseInt(timeMinuteMatch[2], 10);
    return mins === 0
      ? `${timeMinuteMatch[1]} giờ`
      : `${timeMinuteMatch[1]} giờ ${mins} phút`;
  }

  // Loại bỏ các ký tự icon / emoji toán học khi phát âm tiếng Việt
  const cleaned = trimmed
    .replace(/[=≠><+\-*/👉👈🔴🔵🟡🟢⭕🔲🔺▭✨🎉⭐🍱🥞😴🌙⏰🎒🪥]/gu, " ")
    .replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1FA00}-\u{1FAFF}]/gu,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || trimmed;
};

// Helper phát âm an toàn, ngắt giọng nói cũ trước khi phát giọng mới
const speak = (text: string, options?: { pitch?: number; rate?: number }) => {
  try {
    Speech.stop();
    const cleanText = cleanTextForSpeech(text);
    if (!cleanText || cleanText.trim().length === 0) return;
    Speech.speak(cleanText, {
      language: "vi-VN",
      pitch: options?.pitch ?? 1.15,
      rate: options?.rate ?? 1.0,
    });
  } catch (e) {
    console.warn("Speech error:", e);
  }
};

const stopSpeech = () => {
  try {
    Speech.stop();
  } catch (e) {}
};

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activeProfile, authToken } = useAuth();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonTitle, setLessonTitle] = useState("Bài tập toán vui nhộn");
  const [isLockedLesson, setIsLockedLesson] = useState(false);
  const [lockMessage, setLockMessage] = useState<string>("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [awardedSticker, setAwardedSticker] = useState<
    SubmitLessonResult["awardedSticker"] | null
  >(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);

  const handleSwitchProfile = () => {
    if (activeProfile?.role === "child" || !activeProfile) {
      setPinModalVisible(true);
    } else {
      router.replace("/profiles");
    }
  };

  // Animation values
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const bottomSheetAnim = useRef(new Animated.Value(200)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Tắt âm thanh ngay lập tức khi unmount màn hình
  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, []);

  // Tải danh sách câu hỏi từ Backend Database
  const loadLessonData = useCallback(async () => {
    if (!id) {
      setQuestions(FALLBACK_QUESTIONS);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setIsLockedLesson(false);

      // Lấy profileId từ React state hoặc trực tiếp từ storage (cho trường hợp F5 / đổi URL trên web)
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

      let currentToken = authToken;
      if (!currentToken) {
        try {
          currentToken = await storage.getItem("emath_auth_token");
        } catch (e) {}
      }

      const data = await emathApi.getLessonQuestions(
        id,
        currentToken || undefined,
        currentProfileId || undefined,
      );

      if (data && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        if (data.title) setLessonTitle(data.title);
      } else {
        setQuestions(FALLBACK_QUESTIONS);
      }
    } catch (err: any) {
      const responseData = err?.response?.data;
      if (err?.response?.status === 403 || responseData?.isLocked) {
        setIsLockedLesson(true);
        const msg =
          responseData?.message ||
          "Bài học này đang bị khóa 🔒. Bé hãy hoàn thành bài học trước để mở khóa nhé!";
        setLockMessage(msg);
        speak(msg, { pitch: 1.2, rate: 0.95 });
        return;
      }
      console.warn("Lỗi tải câu hỏi từ DB:", err);
      setIsLockedLesson(true);
      const msg =
        responseData?.message ||
        "Bài học này đang bị khóa 🔒 hoặc chưa có sẵn. Bé hãy kiểm tra lại nhé!";
      setLockMessage(msg);
      speak(msg, { pitch: 1.2, rate: 0.95 });
    } finally {
      setLoading(false);
    }
  }, [id, authToken, activeProfile?.id]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  const currentQuestion = questions[currentIndex] || questions[0];

  // Phát âm câu hỏi khi chuyển câu mới
  useEffect(() => {
    if (!loading && currentQuestion && !isCompleted && !showExitModal) {
      speak(currentQuestion.questionText);
    }

    return () => {
      stopSpeech();
    };
  }, [
    currentIndex,
    loading,
    isCompleted,
    showExitModal,
    currentQuestion?.id,
  ]);

  // Cập nhật thanh tiến trình chuẩn 100%
  useEffect(() => {
    if (questions.length > 0) {
      const targetPercent = isCompleted
        ? 100
        : isAnswerChecked
          ? ((currentIndex + 1) / questions.length) * 100
          : (currentIndex / questions.length) * 100;

      Animated.timing(progressAnim, {
        toValue: targetPercent,
        duration: 350,
        useNativeDriver: false,
      }).start();
    }
  }, [currentIndex, isAnswerChecked, isCompleted, questions.length]);

  const handleSpeakQuestion = () => {
    if (currentQuestion?.questionText) {
      speak(currentQuestion.questionText);
    }
  };

  const handleSelectOption = (optionId: string, optionLabel?: string) => {
    if (isAnswerChecked) return;
    setSelectedOptionId(optionId);

    // Tự động đọc to đáp án ngay khi bé chạm vào để bé dễ dàng nhận biết
    const rawLabel =
      optionLabel ||
      currentQuestion?.options.find((o) => o.id === optionId)?.label ||
      optionId;

    const speechText = cleanTextForSpeech(rawLabel);
    if (speechText) {
      speak(speechText, { pitch: 1.18, rate: 1.0 });
    }
  };

  // Kiểm tra câu trả lời
  const handleCheckAnswer = () => {
    if (!selectedOptionId || isAnswerChecked || !currentQuestion) return;

    const correct =
      String(selectedOptionId).trim().toLowerCase() ===
      String(currentQuestion.correctAnswerId).trim().toLowerCase();
    setIsCorrect(correct);
    setIsAnswerChecked(true);

    if (correct) {
      stopSpeech();
      playSoundEffect("correct");
      setCorrectAnswersCount((prev) => prev + 1);
      setEarnedXp((prev) => prev + 10);
    } else {
      stopSpeech();
      playSoundEffect("wrong");
      // Trừ 1 tim và hiệu ứng rung tim
      setHearts((prev) => Math.max(0, prev - 1));
      Animated.sequence([
        Animated.timing(heartScaleAnim, {
          toValue: 1.4,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(heartScaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Hiện bottom feedback sheet
    Animated.spring(bottomSheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  // Sang câu hỏi tiếp theo hoặc kết thúc bài
  const handleNextQuestion = async () => {
    stopSpeech();
    Animated.timing(bottomSheetAnim, {
      toValue: 200,
      duration: 200,
      useNativeDriver: true,
    }).start(async () => {
      setSelectedOptionId(null);
      setIsAnswerChecked(false);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        stopSpeech();
        playSoundEffect("complete");
        setIsCompleted(true);
        Animated.timing(progressAnim, {
          toValue: 100,
          duration: 350,
          useNativeDriver: false,
        }).start();

        // Gửi kết quả về Backend Database để lưu trữ & mở khóa bài kế tiếp
        let targetProfileId = activeProfile?.id;
        if (!targetProfileId) {
          try {
            const storedProfile = await storage.getItem("emath_active_profile");
            if (storedProfile) {
              const parsed = JSON.parse(storedProfile);
              targetProfileId = parsed?.id;
            }
          } catch (e) {}
        }

        let targetToken = authToken;
        if (!targetToken) {
          try {
            targetToken = await storage.getItem("emath_auth_token");
          } catch (e) {}
        }

        if (id && targetProfileId) {
          try {
            const submitResult = await emathApi.submitLesson(
              id,
              targetProfileId,
              correctAnswersCount,
              questions.length,
              targetToken || undefined,
            );
            if (submitResult?.awardedSticker) {
              setAwardedSticker(submitResult.awardedSticker);
            }
          } catch (e) {
            console.warn("Lỗi lưu kết quả bài thi vào DB:", e);
          }
        }
      }
    });
  };

  const totalQuestions = questions.length;
  const accuracyRate =
    totalQuestions > 0
      ? Math.round((correctAnswersCount / totalQuestions) * 100)
      : 0;
  const starsEarned =
    accuracyRate >= 80
      ? 3
      : accuracyRate >= 50
        ? 2
        : accuracyRate >= 20
          ? 1
          : 0;

  // Màn hình thông báo bài học bị khóa (tự động chuyển hướng về Hành trình)
  // Màn hình thông báo không có quyền truy cập / Bài học bị khóa
  if (isLockedLesson) {
    return (
      <SafeAreaView
        style={[styles.container, styles.lockedScreenWrapper]}
        edges={["top", "left", "right"]}
      >
        <View style={styles.lockedCard}>
          <View style={styles.lockedIconRing}>
            <Text style={styles.lockedEmoji}>🔒</Text>
          </View>

          <View style={styles.lockedBadgePill}>
            <Text style={styles.lockedBadgePillText}>
              LỘ TRÌNH CHƯA MỞ KHÓA
            </Text>
          </View>

          <Text style={styles.lockedTitle}>Chưa thể truy cập bài này!</Text>

          <Text style={styles.lockedDesc}>
            {lockMessage ||
              "Bé cần hoàn thành bài học trước đó trong lộ trình để mở khóa bài học này nhé! Hoặc phụ huynh có thể chuyển sang hồ sơ bé khác."}
          </Text>

          <TouchableOpacity
            style={styles.lockedReplayAudioBtn}
            activeOpacity={0.8}
            onPress={() =>
              speak(
                lockMessage ||
                  "Bài học này đang bị khóa. Bé hãy hoàn thành bài học trước để mở khóa nhé!",
                { pitch: 1.2, rate: 0.95 },
              )
            }
          >
            <Ionicons name="volume-high" size={18} color="#00658D" />
            <Text style={styles.lockedReplayAudioText}>Nghe lại hướng dẫn</Text>
          </TouchableOpacity>

          <View style={styles.lockedActionGroup}>
            <TouchableOpacity
              style={styles.lockedBackBtn}
              activeOpacity={0.88}
              onPress={() => router.replace("/(tabs)/journey")}
            >
              <Text style={styles.lockedBackBtnText}>
                QUAY VỀ HÀNH TRÌNH 🗺️
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.lockedSecondaryBtn}
              activeOpacity={0.85}
              onPress={handleSwitchProfile}
            >
              <Text style={styles.lockedSecondaryBtnText}>
                ĐỔI HỒ SƠ KHÁC 👨‍👩‍👧‍👦
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ParentPinModal
          visible={pinModalVisible}
          mode="verify"
          onClose={() => setPinModalVisible(false)}
          onSuccess={() => {
            setPinModalVisible(false);
            router.replace("/profiles");
          }}
        />
      </SafeAreaView>
    );
  }

  if (loading || !currentQuestion || questions.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, styles.loadingWrapper]}
        edges={["top", "left", "right"]}
      >
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>
          Bé đợi chút nhé, bài học đang tải... 🌟
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* 1. TOP BAR: EXIT + PROGRESS */}
      {!isCompleted && (
        <View style={styles.topBar}>
          {/* Nút thoát */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setShowExitModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#6F7880" />
          </TouchableOpacity>

          {/* Thanh tiến độ */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                },
              ]}
            >
              <View style={styles.progressHighlight} />
            </Animated.View>
          </View>
        </View>
      )}

      {!isCompleted ? (
        <>
          {/* 2. QUESTION AREA CANVAS */}
          <ScrollView
            contentContainerStyle={styles.questionContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header câu hỏi + Nút loa */}
            <View style={styles.questionHeader}>
              <TouchableOpacity
                style={styles.soundSpeakerBtn}
                onPress={handleSpeakQuestion}
                activeOpacity={0.8}
              >
                <Ionicons name="volume-high" size={24} color="#00658D" />
              </TouchableOpacity>
              <Text style={styles.questionText}>
                {currentQuestion.questionText}
              </Text>
            </View>

            {/* VISUAL ILLUSTRATION ACCORDING TO QUESTION TYPE */}
            {/* Type 1: Counting Items or Single Object (e.g. Quả táo 🍎) */}
            {(currentQuestion.type === "count" ||
              (!!currentQuestion.visualItems &&
                currentQuestion.visualItems.length > 0 &&
                !currentQuestion.numberedCards &&
                !currentQuestion.clockTime)) && (
              <View style={styles.visualBoard}>
                <View style={styles.itemsWrap}>
                  {currentQuestion.visualItems?.map((emoji, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.itemBubble,
                        currentQuestion.visualItems?.length === 1 &&
                          styles.singleItemBubble,
                      ]}
                      onPress={() => speak(`${idx + 1}`)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.itemEmoji,
                          currentQuestion.visualItems?.length === 1 &&
                            styles.singleItemEmoji,
                        ]}
                      >
                        {emoji}
                      </Text>
                      {currentQuestion.type === "count" && (
                        <View style={styles.itemIndexPill}>
                          <Text style={styles.itemIndexText}>{idx + 1}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Type 2: Math Equation */}
            {currentQuestion.type === "equation" && (
              <View style={styles.equationBoard}>
                {/* Left Group */}
                <View style={styles.equationGroup}>
                  <View style={styles.equationItemsRow}>
                    {currentQuestion.visualFormula?.leftItems.map(
                      (emoji, idx) => (
                        <Text key={idx} style={styles.equationEmoji}>
                          {emoji}
                        </Text>
                      ),
                    )}
                  </View>
                  <View style={styles.equationNumberPill}>
                    <Text style={styles.equationNumberText}>
                      {currentQuestion.visualFormula?.leftItems.length}
                    </Text>
                  </View>
                </View>

                {/* Operator (+ / -) */}
                <View style={styles.operatorCircle}>
                  <Text style={styles.operatorText}>
                    {currentQuestion.visualFormula?.operator}
                  </Text>
                </View>

                {/* Right Group */}
                <View style={styles.equationGroup}>
                  <View style={styles.equationItemsRow}>
                    {currentQuestion.visualFormula?.rightItems.map(
                      (emoji, idx) => (
                        <Text key={idx} style={styles.equationEmoji}>
                          {emoji}
                        </Text>
                      ),
                    )}
                  </View>
                  <View style={styles.equationNumberPill}>
                    <Text style={styles.equationNumberText}>
                      {currentQuestion.visualFormula?.rightItems.length}
                    </Text>
                  </View>
                </View>

                {/* Equal Sign */}
                <Text style={styles.equalSignText}>=</Text>

                {/* Question mark placeholder */}
                <View style={styles.questionMarkBox}>
                  <Text style={styles.questionMarkText}>?</Text>
                </View>
              </View>
            )}

            {/* Type 3: Compare */}
            {currentQuestion.type === "compare" && (
              <View style={styles.compareBoard}>
                {/* Left Card */}
                <TouchableOpacity
                  style={[
                    styles.compareCard,
                    (selectedOptionId === "left" || selectedOptionId === "1") &&
                      styles.compareCardSelected,
                  ]}
                  onPress={() => {
                    const leftOpt = currentQuestion.options.find(
                      (o) =>
                        o.id === "left" ||
                        o.id === "1" ||
                        o.label.toLowerCase().includes("trái"),
                    );
                    if (leftOpt) {
                      handleSelectOption(leftOpt.id, leftOpt.label);
                    } else {
                      speak(
                        `Bên trái có ${currentQuestion.compareLeft?.count || 1} quả`,
                      );
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={isAnswerChecked}
                >
                  <View style={styles.compareCardTag}>
                    <Text style={styles.compareCardTagText}>Bên trái 👈</Text>
                  </View>

                  <View style={styles.compareItemsWrap}>
                    {(
                      currentQuestion.compareLeft?.items ||
                      Array(currentQuestion.compareLeft?.count || 1).fill(
                        currentQuestion.compareLeft?.icon || "🍎",
                      )
                    ).map((emoji, idx) => (
                      <Text key={idx} style={styles.compareEmoji}>
                        {emoji}
                      </Text>
                    ))}
                  </View>

                  {typeof currentQuestion.compareLeft?.count === "number" && (
                    <View style={styles.compareCountPill}>
                      <Text style={styles.compareCountNumber}>
                        {currentQuestion.compareLeft.count} quả
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Center comparison slot */}
                <View style={styles.compareSlot}>
                  <Text style={styles.compareSlotText}>
                    {selectedOptionId === "left"
                      ? "👈"
                      : selectedOptionId === "right"
                        ? "👉"
                        : selectedOptionId === "equal"
                          ? "="
                          : selectedOptionId === "not_equal"
                            ? "≠"
                            : "VS"}
                  </Text>
                </View>

                {/* Right Card */}
                <TouchableOpacity
                  style={[
                    styles.compareCard,
                    (selectedOptionId === "right" ||
                      selectedOptionId === "2") &&
                      styles.compareCardSelected,
                  ]}
                  onPress={() => {
                    const rightOpt = currentQuestion.options.find(
                      (o) =>
                        o.id === "right" ||
                        o.id === "2" ||
                        o.label.toLowerCase().includes("phải"),
                    );
                    if (rightOpt) {
                      handleSelectOption(rightOpt.id, rightOpt.label);
                    } else {
                      speak(
                        `Bên phải có ${currentQuestion.compareRight?.count || 1} quả`,
                      );
                    }
                  }}
                  activeOpacity={0.8}
                  disabled={isAnswerChecked}
                >
                  <View style={styles.compareCardTag}>
                    <Text style={styles.compareCardTagText}>Bên phải 👉</Text>
                  </View>

                  <View style={styles.compareItemsWrap}>
                    {(
                      currentQuestion.compareRight?.items ||
                      Array(currentQuestion.compareRight?.count || 1).fill(
                        currentQuestion.compareRight?.icon || "🍎",
                      )
                    ).map((emoji, idx) => (
                      <Text key={idx} style={styles.compareEmoji}>
                        {emoji}
                      </Text>
                    ))}
                  </View>

                  {typeof currentQuestion.compareRight?.count === "number" && (
                    <View style={styles.compareCountPill}>
                      <Text style={styles.compareCountNumber}>
                        {currentQuestion.compareRight.count} quả
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Type 4: Numbered Color/Shape Cards */}
            {(currentQuestion.type === "color_choice" ||
              currentQuestion.type === "shape_choice" ||
              !!currentQuestion.numberedCards) &&
              currentQuestion.numberedCards && (
                <View style={styles.numberedCardsBoard}>
                  <View style={styles.numberedCardsRow}>
                    {currentQuestion.numberedCards.map((card) => {
                      const isCardSelected =
                        selectedOptionId === String(card.index);
                      return (
                        <TouchableOpacity
                          key={card.index}
                          style={[
                            styles.numberedCardItem,
                            isCardSelected && styles.numberedCardItemSelected,
                          ]}
                          onPress={() =>
                            handleSelectOption(
                              String(card.index),
                              `Hình ${card.index}`,
                            )
                          }
                          activeOpacity={0.8}
                          disabled={isAnswerChecked}
                        >
                          {/* Number Badge Pill */}
                          <View
                            style={[
                              styles.numberedBadgePill,
                              isCardSelected &&
                                styles.numberedBadgePillSelected,
                            ]}
                          >
                            <Text style={styles.numberedBadgeText}>
                              Hình {card.index}
                            </Text>
                          </View>

                          {/* Geometric Shape Box */}
                          <View style={styles.shapeContainer}>
                            {card.shape === "triangle" ? (
                              <View
                                style={[
                                  styles.shapeTriangle,
                                  {
                                    borderBottomColor:
                                      card.color || "#4DA8DA",
                                  },
                                ]}
                              />
                            ) : card.shape === "circle" ? (
                              <View
                                style={[
                                  styles.shapeCircle,
                                  {
                                    backgroundColor:
                                      card.color || "#4DA8DA",
                                  },
                                ]}
                              />
                            ) : card.shape === "rectangle" ? (
                              <View
                                style={[
                                  styles.shapeRectangle,
                                  {
                                    backgroundColor:
                                      card.color || "#4DA8DA",
                                  },
                                ]}
                              />
                            ) : (
                              <View
                                style={[
                                  styles.shapeSquare,
                                  {
                                    backgroundColor:
                                      card.color || "#4DA8DA",
                                  },
                                ]}
                              />
                            )}
                          </View>

                          {/* Sub Label (if present) */}
                          {card.name ? (
                            <Text
                              style={styles.shapeCardLabel}
                              numberOfLines={1}
                            >
                              {card.name}
                            </Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

            {/* Type 5: Analog Clock Face */}
            {(currentQuestion.type === "time" || !!currentQuestion.clockTime) && (
              <View style={styles.clockBoard}>
                <View style={styles.clockDial}>
                  {/* Hour markers around dial */}
                  {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num) => {
                    const angle = (num * 30 - 90) * (Math.PI / 180);
                    const radius = 64;
                    const x = Math.round(Math.cos(angle) * radius);
                    const y = Math.round(Math.sin(angle) * radius);
                    return (
                      <View
                        key={num}
                        style={[
                          styles.clockNumberWrap,
                          { transform: [{ translateX: x }, { translateY: y }] },
                        ]}
                      >
                        <Text style={styles.clockNumberText}>{num}</Text>
                      </View>
                    );
                  })}

                  {/* Hour Hand (Kim ngắn - đỏ) */}
                  <View
                    style={[
                      styles.handHourWrapper,
                      {
                        transform: [
                          {
                            rotate: `${
                              ((currentQuestion.clockTime?.hour || 3) % 12) *
                                30 +
                              (currentQuestion.clockTime?.minute || 0) * 0.5
                            }deg`,
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.handHour} />
                  </View>

                  {/* Minute Hand (Kim dài - xanh) */}
                  <View
                    style={[
                      styles.handMinuteWrapper,
                      {
                        transform: [
                          {
                            rotate: `${
                              (currentQuestion.clockTime?.minute || 0) * 6
                            }deg`,
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.handMinute} />
                  </View>

                  {/* Center Pivot Pin */}
                  <View style={styles.clockCenterPin} />
                </View>

                <Text style={styles.clockHintText}>
                  ⏰ Kim ngắn màu đỏ chỉ giờ • Kim dài màu xanh chỉ phút
                </Text>
              </View>
            )}

            {/* OPTIONS GRID (TACTILE 3D BUTTONS) */}
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOptionId === opt.id;
                let optionStyle = styles.optionBtnDefault;
                let optionTextStyle = styles.optionTextDefault;

                if (isSelected) {
                  optionStyle = styles.optionBtnSelected;
                  optionTextStyle = styles.optionTextSelected;
                }

                if (isAnswerChecked && isSelected) {
                  if (isCorrect) {
                    optionStyle = styles.optionBtnCorrect;
                    optionTextStyle = styles.optionTextCorrect;
                  } else {
                    optionStyle = styles.optionBtnWrong;
                    optionTextStyle = styles.optionTextWrong;
                  }
                }

                return (
                  <TouchableOpacity
                    key={`${opt.id}-${idx}`}
                    style={[styles.optionBtnBase, optionStyle]}
                    onPress={() => handleSelectOption(opt.id, opt.label)}
                    activeOpacity={0.8}
                    disabled={isAnswerChecked}
                  >
                    <Text style={[styles.optionTextBase, optionTextStyle]}>
                      {opt.label}
                    </Text>
                    {opt.subLabel && (
                      <Text style={styles.optionSubText}>{opt.subLabel}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* 3. BOTTOM ACTION FOOTER BAR */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[
                styles.checkBtnBase,
                selectedOptionId
                  ? styles.checkBtnActive
                  : styles.checkBtnDisabled,
              ]}
              disabled={!selectedOptionId || isAnswerChecked}
              onPress={handleCheckAnswer}
              activeOpacity={0.85}
            >
              <Text
                style={[
                  styles.checkBtnTextBase,
                  selectedOptionId
                    ? styles.checkBtnTextActive
                    : styles.checkBtnTextDisabled,
                ]}
              >
                KIỂM TRA
              </Text>
            </TouchableOpacity>
          </View>

          {/* 4. DUOLINGO-STYLE BOTTOM FEEDBACK MODAL SHEET */}
          {isAnswerChecked && (
            <Animated.View
              style={[
                styles.feedbackSheet,
                isCorrect ? styles.feedbackCorrect : styles.feedbackWrong,
                { transform: [{ translateY: bottomSheetAnim }] },
              ]}
            >
              <View style={styles.feedbackContent}>
                <View style={styles.feedbackHeaderRow}>
                  <View
                    style={[
                      styles.feedbackIconCircle,
                      isCorrect
                        ? styles.feedbackIconCorrect
                        : styles.feedbackIconWrong,
                    ]}
                  >
                    <Ionicons
                      name={isCorrect ? "checkmark" : "close"}
                      size={26}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.feedbackTextGroup}>
                    <Text
                      style={[
                        styles.feedbackTitle,
                        isCorrect
                          ? styles.feedbackTitleCorrect
                          : styles.feedbackTitleWrong,
                      ]}
                    >
                      {isCorrect
                        ? "Chính xác! Tuyệt vời 🎉"
                        : "Chưa đúng rồi 🥺"}
                    </Text>
                    <Text style={styles.feedbackSub}>
                      {isCorrect
                        ? "+10 XP Điểm thưởng"
                        : `Đáp án đúng là: ${currentQuestion.correctAnswerId}`}
                    </Text>
                  </View>
                </View>

                {/* Continue button */}
                <TouchableOpacity
                  style={[
                    styles.continueBtnBase,
                    isCorrect
                      ? styles.continueBtnCorrect
                      : styles.continueBtnWrong,
                  ]}
                  onPress={handleNextQuestion}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>
                    {currentIndex < questions.length - 1
                      ? "TIẾP TỤC"
                      : "HOÀN THÀNH BÀI HỌC"}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </>
      ) : (
        /* 5. CELEBRATION VICTORY SCREEN */
        <ScrollView
          contentContainerStyle={styles.victoryScrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.victoryCard}>
            {/* Big Trophy / Mascot */}
            <View style={styles.victoryMascotCircle}>
              <Text style={styles.victoryTrophyEmoji}>
                {accuracyRate >= 80
                  ? "🏆"
                  : accuracyRate >= 50
                    ? "⭐"
                    : accuracyRate > 0
                      ? "🌱"
                      : "🥺"}
              </Text>
            </View>

            <Text style={styles.victoryHeading}>
              {accuracyRate >= 80
                ? "BÀI HỌC HOÀN TẤT!"
                : accuracyRate >= 50
                  ? "HOÀN THÀNH TỐT!"
                  : accuracyRate > 0
                    ? "CỐ GẮNG LẦN SAU!"
                    : "CHƯA ĐẠT RỒI!"}
            </Text>
            <Text style={styles.victorySub}>
              {accuracyRate >= 80
                ? "Bé đã làm rất xuất sắc và ghi nhớ bài cực nhanh! 🎉"
                : accuracyRate >= 50
                  ? `Bé đã trả lời đúng ${correctAnswersCount}/${totalQuestions} câu, cùng luyện thêm để đạt 3 sao nhé! 🌟`
                  : accuracyRate > 0
                    ? `Bé đã trả lời đúng ${correctAnswersCount}/${totalQuestions} câu, hãy thử lại để đạt kết quả cao hơn nhé! 💪`
                    : `Bé chưa trả lời đúng câu nào (0/${totalQuestions}). Hãy ấn nút bên dưới và làm lại nhé! 🚀`}
            </Text>

            {/* Sticker Award Card when 3 stars earned */}
            {awardedSticker && (
              <View style={styles.stickerAwardCard}>
                <View style={styles.stickerAwardHeader}>
                  <Text style={styles.stickerAwardTag}>
                    {awardedSticker.isNew
                      ? "🎁 MỞ KHÓA STICKER MỚI!"
                      : "✨ THƯỞNG STICKER XUẤT SẮC"}
                  </Text>
                </View>
                <View style={styles.stickerAwardBody}>
                  <View
                    style={[
                      styles.stickerAwardAvatar,
                      {
                        backgroundColor:
                          STICKER_META[awardedSticker.code]?.color || "#FFDF9B",
                      },
                    ]}
                  >
                    <Text style={styles.stickerAwardEmoji}>
                      {STICKER_META[awardedSticker.code]?.emoji || "🎁"}
                    </Text>
                  </View>
                  <View style={styles.stickerAwardInfo}>
                    <Text style={styles.stickerAwardName}>
                      {awardedSticker.name}
                    </Text>
                    <Text style={styles.stickerAwardDesc}>
                      {awardedSticker.description ||
                        "Đã lưu vào bộ sưu tập hình dán của bé"}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Stat Badges */}
            <View style={styles.victoryStatsRow}>
              {/* XP */}
              <View style={styles.victoryStatCard}>
                <Text style={styles.victoryStatEmoji}>⚡</Text>
                <Text style={styles.victoryStatNumber}>
                  +{earnedXp + (accuracyRate >= 50 ? 10 : 5)}
                </Text>
                <Text style={styles.victoryStatLabel}>Tổng XP</Text>
              </View>

              {/* Accuracy */}
              <View style={styles.victoryStatCard}>
                <Text style={styles.victoryStatEmoji}>🎯</Text>
                <Text style={styles.victoryStatNumber}>{accuracyRate}%</Text>
                <Text style={styles.victoryStatLabel}>
                  {correctAnswersCount}/{totalQuestions} Đúng
                </Text>
              </View>

              {/* Stars */}
              <View style={styles.victoryStatCard}>
                <Text style={styles.victoryStatEmoji}>⭐</Text>
                <Text style={styles.victoryStatNumber}>{starsEarned}/3</Text>
                <Text style={styles.victoryStatLabel}>Ngôi sao</Text>
              </View>
            </View>

            {/* Continue button */}
            <TouchableOpacity
              style={styles.victoryFinishBtn}
              onPress={() => {
                stopSpeech();
                router.replace("/(tabs)/journey");
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.victoryFinishBtnText}>
                TIẾP TỤC HÀNH TRÌNH 🚀
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* CONFIRM QUIT MODAL */}
      <Modal
        visible={showExitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExitModal(false)}
      >
        <View style={styles.exitModalOverlay}>
          <View style={styles.exitModalCard}>
            <Text style={styles.exitModalEmoji}>🥺</Text>
            <Text style={styles.exitModalTitle}>Bé có muốn dừng lại?</Text>
            <Text style={styles.exitModalDesc}>
              Bé sắp hoàn thành bài học rồi đó, ở lại để nhận ngôi sao lấp lánh
              nhé!
            </Text>

            <View style={styles.exitModalActions}>
              <TouchableOpacity
                style={styles.exitStayBtn}
                onPress={() => setShowExitModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.exitStayBtnText}>HỌC TIẾP</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitQuitBtn}
                onPress={() => {
                  stopSpeech();
                  setShowExitModal(false);
                  router.back();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.exitQuitBtnText}>Tạm dừng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7FF",
  },
  loadingWrapper: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6C4AB6",
  },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 14,
  },
  closeBtn: {
    padding: 4,
  },
  progressBarTrack: {
    flex: 1,
    height: 16,
    backgroundColor: "#EEE4FF",
    borderRadius: 9999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 9999,
    position: "relative",
  },
  progressHighlight: {
    position: "absolute",
    top: 2,
    left: 6,
    right: 6,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    borderRadius: 9999,
  },
  heartBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFDF9B",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
  },
  heartEmoji: {
    fontSize: 16,
  },
  heartCountText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "900",
  },

  // QUESTION CONTENT
  questionContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
    gap: 20,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  soundSpeakerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C6E7FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    flex: 1,
    color: "#1E1830",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 28,
  },

  // VISUAL BOARDS
  visualBoard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    padding: 20,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 14,
  },
  itemBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFBEB",
    borderWidth: 1.5,
    borderColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  itemEmoji: {
    fontSize: 32,
  },
  singleItemBubble: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#FFF8EA",
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  singleItemEmoji: {
    fontSize: 52,
  },
  itemIndexPill: {
    position: "absolute",
    bottom: -6,
    backgroundColor: "#4DA8DA",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 9999,
  },
  itemIndexText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },

  // EQUATION BOARD
  equationBoard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    paddingVertical: 24,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  equationGroup: {
    alignItems: "center",
    gap: 6,
  },
  equationItemsRow: {
    flexDirection: "row",
    gap: 2,
  },
  equationEmoji: {
    fontSize: 24,
  },
  equationNumberPill: {
    backgroundColor: "#C6E7FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  equationNumberText: {
    color: "#00658D",
    fontSize: 18,
    fontWeight: "900",
  },
  operatorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFDF9B",
    justifyContent: "center",
    alignItems: "center",
  },
  operatorText: {
    color: "#785A00",
    fontSize: 22,
    fontWeight: "900",
  },
  equalSignText: {
    color: "#3F484F",
    fontSize: 26,
    fontWeight: "900",
  },
  questionMarkBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#AE2F34",
    backgroundColor: "#FFDAD8",
    justifyContent: "center",
    alignItems: "center",
  },
  questionMarkText: {
    color: "#AE2F34",
    fontSize: 24,
    fontWeight: "900",
  },

  // COMPARE BOARD
  compareBoard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  compareCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F1FF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#EEE4FF",
    borderBottomWidth: 4,
    borderBottomColor: "#E2D4F8",
    padding: 12,
    minHeight: 140,
    justifyContent: "space-between",
  },
  compareCardSelected: {
    backgroundColor: "#F0F9FF",
    borderColor: "#4DA8DA",
    borderBottomColor: "#0284C7",
  },
  compareCardTag: {
    backgroundColor: "rgba(0, 101, 141, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  compareCardTagText: {
    color: "#00658D",
    fontSize: 11,
    fontWeight: "800",
  },
  compareItemsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginVertical: 8,
  },
  compareEmoji: {
    fontSize: 28,
  },
  compareCountPill: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#EEE4FF",
  },
  compareCountNumber: {
    color: "#1E1830",
    fontSize: 14,
    fontWeight: "900",
  },
  compareSlot: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFD167",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    borderBottomWidth: 5,
    borderBottomColor: "#DDA31D",
    justifyContent: "center",
    alignItems: "center",
  },
  compareSlotText: {
    color: "#785A00",
    fontSize: 18,
    fontWeight: "900",
  },

  // NUMBERED CARDS BOARD (COLORS & SHAPES)
  numberedCardsBoard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  numberedCardsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    gap: 10,
  },
  numberedCardItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FDF7FF",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#EEE4FF",
    borderBottomWidth: 4,
    borderBottomColor: "#E2D4F8",
    padding: 10,
    gap: 8,
  },
  numberedCardItemSelected: {
    backgroundColor: "#FFF4E6",
    borderColor: "#FF7A00",
    borderBottomColor: "#E05A00",
    borderBottomWidth: 5,
    transform: [{ scale: 1.03 }],
  },
  numberedBadgePill: {
    backgroundColor: "#00658D",
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  numberedBadgePillSelected: {
    backgroundColor: "#FF7A00",
  },
  numberedBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  shapeContainer: {
    width: 68,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
  },
  shapeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  shapeSquare: {
    width: 58,
    height: 58,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  shapeRectangle: {
    width: 68,
    height: 44,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  shapeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 28,
    borderRightWidth: 28,
    borderBottomWidth: 50,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  shapeCardLabel: {
    color: "#1E1830",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  // CLOCK BOARD (ANALOG CLOCK)
  clockBoard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  clockDial: {
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: "#FFFDF9",
    borderWidth: 6,
    borderColor: "#00658D",
    borderBottomWidth: 8,
    borderBottomColor: "#004B6A",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  clockNumberWrap: {
    position: "absolute",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  clockNumberText: {
    color: "#1E1830",
    fontSize: 14,
    fontWeight: "900",
  },
  handHourWrapper: {
    position: "absolute",
    width: 8,
    height: 120,
    top: 28,
    left: 78,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  handHour: {
    width: 6,
    height: 40,
    backgroundColor: "#EF4444",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#B91C1C",
  },
  handMinuteWrapper: {
    position: "absolute",
    width: 6,
    height: 144,
    top: 16,
    left: 79,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  handMinute: {
    width: 4,
    height: 58,
    backgroundColor: "#00658D",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#004864",
  },
  clockCenterPin: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FFD167",
    borderWidth: 2,
    borderColor: "#785A00",
    position: "absolute",
    zIndex: 10,
  },
  clockHintText: {
    color: "#6F7880",
    fontSize: 12,
    fontWeight: "600",
  },

  // OPTIONS CONTAINER
  optionsContainer: {
    gap: 12,
  },
  optionBtnBase: {
    borderRadius: 20,
    borderWidth: 3,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 6,
  },
  optionBtnDefault: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFDF9",
    borderBottomColor: "#E5DEC9",
  },
  optionBtnSelected: {
    backgroundColor: "#F0F9FF",
    borderColor: "#4DA8DA",
    borderBottomColor: "#0284C7",
  },
  optionBtnCorrect: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
    borderBottomColor: "#047857",
  },
  optionBtnWrong: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
    borderBottomColor: "#B91C1C",
  },
  optionTextBase: {
    fontSize: 18,
    fontWeight: "800",
  },
  optionTextDefault: {
    color: "#1E1830",
  },
  optionTextSelected: {
    color: "#0284C7",
  },
  optionTextCorrect: {
    color: "#047857",
  },
  optionTextWrong: {
    color: "#B91C1C",
  },
  optionSubText: {
    color: "#6F7880",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  // FOOTER
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3EAFF",
  },
  checkBtnBase: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 6,
  },
  checkBtnActive: {
    backgroundColor: "#10B981",
    borderBottomColor: "#059669",
  },
  checkBtnDisabled: {
    backgroundColor: "#E5E7EB",
    borderBottomColor: "#D1D5DB",
  },
  checkBtnTextBase: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  checkBtnTextActive: {
    color: "#FFFFFF",
  },
  checkBtnTextDisabled: {
    color: "#9CA3AF",
  },

  // BOTTOM FEEDBACK SHEET
  feedbackSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 20,
  },
  feedbackCorrect: {
    backgroundColor: "#D1FAE5",
  },
  feedbackWrong: {
    backgroundColor: "#FEE2E2",
  },
  feedbackContent: {
    gap: 16,
  },
  feedbackHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  feedbackIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  feedbackIconCorrect: {
    backgroundColor: "#10B981",
  },
  feedbackIconWrong: {
    backgroundColor: "#EF4444",
  },
  feedbackTextGroup: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 2,
  },
  feedbackTitleCorrect: {
    color: "#065F46",
  },
  feedbackTitleWrong: {
    color: "#991B1B",
  },
  feedbackSub: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  continueBtnBase: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 6,
  },
  continueBtnCorrect: {
    backgroundColor: "#10B981",
    borderBottomColor: "#059669",
  },
  continueBtnWrong: {
    backgroundColor: "#EF4444",
    borderBottomColor: "#B91C1C",
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // VICTORY SCREEN
  victoryScrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: 448,
    alignSelf: "center",
    width: "100%",
  },
  victoryContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  victoryCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 8,
    borderBottomColor: "#E5DEC9",
    padding: 24,
    alignItems: "center",
  },
  stickerAwardCard: {
    width: "100%",
    backgroundColor: "#FFFBEB",
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FEF3C7",
    borderBottomWidth: 4,
    borderBottomColor: "#FDE68A",
    padding: 14,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  stickerAwardHeader: {
    marginBottom: 8,
  },
  stickerAwardTag: {
    color: "#B45309",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  stickerAwardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  stickerAwardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  stickerAwardEmoji: {
    fontSize: 28,
  },
  stickerAwardInfo: {
    flex: 1,
  },
  stickerAwardName: {
    color: "#1E1830",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  stickerAwardDesc: {
    color: "#6F7880",
    fontSize: 12,
    fontWeight: "500",
  },
  victoryMascotCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFDF9B",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  victoryTrophyEmoji: {
    fontSize: 54,
  },
  victoryHeading: {
    color: "#1E1830",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  victorySub: {
    color: "#6F7880",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  victoryStatsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
    marginBottom: 28,
  },
  victoryStatCard: {
    flex: 1,
    backgroundColor: "#FDF7FF",
    borderRadius: 20,
    padding: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#EEE4FF",
  },
  victoryStatEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  victoryStatNumber: {
    color: "#1E1830",
    fontSize: 18,
    fontWeight: "900",
  },
  victoryStatLabel: {
    color: "#6F7880",
    fontSize: 11,
    fontWeight: "600",
  },
  victoryFinishBtn: {
    width: "100%",
    backgroundColor: "#FF7372",
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderBottomWidth: 6,
    borderBottomColor: "#D84544",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  victoryFinishBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },

  // EXIT MODAL
  exitModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  exitModalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },
  exitModalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  exitModalTitle: {
    color: "#1E1830",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  exitModalDesc: {
    color: "#6F7880",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  exitModalActions: {
    width: "100%",
    gap: 10,
  },
  exitStayBtn: {
    backgroundColor: "#4DA8DA",
    borderRadius: 9999,
    borderBottomWidth: 5,
    borderBottomColor: "#0284C7",
    paddingVertical: 14,
    alignItems: "center",
  },
  exitStayBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  exitQuitBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  exitQuitBtnText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "700",
  },

  // LOCKED / ACCESS DENIED SCREEN
  lockedScreenWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FDF7FF",
  },
  lockedCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    borderWidth: 3,
    borderColor: "#FFFDF9",
    borderBottomWidth: 6,
    borderBottomColor: "#E5DEC9",
    padding: 24,
    alignItems: "center",
    shadowColor: "#5C5470",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  lockedIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F3EAFF",
    borderWidth: 2,
    borderColor: "#EEE4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  lockedEmoji: {
    fontSize: 40,
  },
  lockedBadgePill: {
    backgroundColor: "#FFDAD8",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 10,
  },
  lockedBadgePillText: {
    color: "#AE2F34",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  lockedTitle: {
    color: "#1E1830",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  lockedDesc: {
    color: "#3F484F",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 16,
  },
  lockedReplayAudioBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 22,
  },
  lockedReplayAudioText: {
    color: "#00658D",
    fontSize: 13,
    fontWeight: "700",
  },
  lockedActionGroup: {
    width: "100%",
    gap: 12,
  },
  lockedBackBtn: {
    width: "100%",
    backgroundColor: "#FF7372",
    borderRadius: 9999,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderBottomWidth: 5,
    borderBottomColor: "#D84544",
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#FF7372",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  lockedBackBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  lockedSecondaryBtn: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderBottomWidth: 4,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 12,
    alignItems: "center",
  },
  lockedSecondaryBtnText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
