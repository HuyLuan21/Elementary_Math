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
import { emathApi, QuestionData } from "../../src/services/emathApi";
import { storage } from "../../src/utils/storage";
import { ParentPinModal } from "../../src/components/ParentPinModal";

const { width } = Dimensions.get("window");

// Dữ liệu câu hỏi fallback chuẩn chương 1 (Đếm số, màu sắc, nhận biết hình học)
const FALLBACK_QUESTIONS: QuestionData[] = [
  {
    id: "1",
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
  {
    id: "2",
    type: "count",
    questionText: "Bé hãy đếm xem có bao nhiêu chú mèo con?",
    visualItems: ["🐱", "🐱", "🐱", "🐱"],
    options: [
      { id: "3", label: "3 chú mèo" },
      { id: "4", label: "4 chú mèo", icon: "⭐" },
      { id: "5", label: "5 chú mèo" },
    ],
    correctAnswerId: "4",
    explanation: "Chính xác! Có tất cả 4 chú mèo con dễ thương 🐱!",
  },
  {
    id: "3",
    type: "compare",
    questionText: "Bé chọn xem bên nào có nhiều quả hơn nhé:",
    compareLeft: { count: 4, icon: "🍎", label: "4 quả táo" },
    compareRight: { count: 2, icon: "🍎", label: "2 quả táo" },
    options: [
      { id: "left", label: "Bên trái (4 quả)", subLabel: "Nhiều hơn" },
      { id: "right", label: "Bên phải (2 quả)", subLabel: "Ít hơn" },
    ],
    correctAnswerId: "left",
    explanation: "Giỏi quá! 4 quả táo ở bên trái nhiều hơn 2 quả táo bên phải!",
  },
  {
    id: "4",
    type: "count",
    questionText: "Bé hãy đếm xem có bao nhiêu ngôi sao lấp lánh?",
    visualItems: ["⭐", "⭐", "⭐", "⭐", "⭐"],
    options: [
      { id: "4", label: "4 ngôi sao" },
      { id: "5", label: "5 ngôi sao", icon: "⭐" },
      { id: "6", label: "6 ngôi sao" },
    ],
    correctAnswerId: "5",
    explanation: "Tuyệt vời! Bé đã đếm đúng 5 ngôi sao lấp lánh ⭐!",
  },
];

// Helper phát âm an toàn, ngắt giọng nói cũ trước khi phát giọng mới
const speak = (text: string, options?: { pitch?: number; rate?: number }) => {
  try {
    Speech.stop();
    if (!text || text.trim().length === 0) return;
    Speech.speak(text, {
      language: "vi-VN",
      pitch: options?.pitch ?? 1.15,
      rate: options?.rate ?? 1.05,
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
        currentProfileId || undefined
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
      // Chỉ cho phép fallback nếu là bài đầu tiên của chương 1
      if (id === "00000000-0000-4000-8000-000000000500" || id === "1") {
        setQuestions(FALLBACK_QUESTIONS);
      } else {
        setIsLockedLesson(true);
        const msg = "Bài học này đang bị khóa 🔒. Bé hãy hoàn thành bài học trước để mở khóa nhé!";
        setLockMessage(msg);
        speak(msg, { pitch: 1.2, rate: 0.95 });
      }
    } finally {
      setLoading(false);
    }
  }, [id, authToken, activeProfile?.id]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  const currentQuestion = questions[currentIndex] || questions[0];

  // Phát âm câu hỏi khi chuyển câu & Cập nhật thanh tiến trình chuẩn 100%
  useEffect(() => {
    if (!loading && currentQuestion && !isCompleted && !showExitModal) {
      speak(currentQuestion.questionText);
    }

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

    return () => {
      stopSpeech();
    };
  }, [
    currentIndex,
    loading,
    isCompleted,
    isAnswerChecked,
    currentQuestion?.id,
    showExitModal,
    questions.length,
  ]);

  const handleSpeakQuestion = () => {
    if (currentQuestion?.questionText) {
      speak(currentQuestion.questionText);
    }
  };

  const handleSelectOption = (optionId: string) => {
    if (isAnswerChecked) return;
    setSelectedOptionId(optionId);
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
      setCorrectAnswersCount((prev) => prev + 1);
      setEarnedXp((prev) => prev + 10);
      speak(currentQuestion.explanation || "Chính xác! Bé giỏi quá!", {
        pitch: 1.2,
        rate: 1.05,
      });
    } else {
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

      speak("Chưa đúng rồi bé ơi! Cố gắng ở câu tiếp theo nhé!", {
        pitch: 1.1,
        rate: 1.05,
      });
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
        if (!targetProfileId) {
          targetProfileId = "00000000-0000-4000-8000-000000000101";
        }

        let targetToken = authToken;
        if (!targetToken) {
          try {
            targetToken = await storage.getItem("emath_auth_token");
          } catch (e) {}
        }

        if (id && targetProfileId) {
          try {
            await emathApi.submitLesson(
              id,
              targetProfileId,
              correctAnswersCount,
              questions.length,
              targetToken || undefined,
            );
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
            <Text style={styles.lockedBadgePillText}>LỘ TRÌNH CHƯA MỞ KHÓA</Text>
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
                { pitch: 1.2, rate: 0.95 }
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
              <Text style={styles.lockedBackBtnText}>QUAY VỀ HÀNH TRÌNH 🗺️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.lockedSecondaryBtn}
              activeOpacity={0.85}
              onPress={handleSwitchProfile}
            >
              <Text style={styles.lockedSecondaryBtnText}>ĐỔI HỒ SƠ KHÁC 👨‍👩‍👧‍👦</Text>
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
      {/* 1. TOP BAR: EXIT + PROGRESS + HEARTS */}
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

        {/* Trái tim (Mạng sống) */}
        <Animated.View
          style={[
            styles.heartBadge,
            { transform: [{ scale: heartScaleAnim }] },
          ]}
        >
          <Text style={styles.heartEmoji}>❤️</Text>
          <Text style={styles.heartCountText}>{hearts}</Text>
        </Animated.View>
      </View>

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
            {/* Type 1: Counting Items */}
            {currentQuestion.type === "count" && (
              <View style={styles.visualBoard}>
                <View style={styles.itemsWrap}>
                  {currentQuestion.visualItems?.map((emoji, idx) => (
                    <View key={idx} style={styles.itemBubble}>
                      <Text style={styles.itemEmoji}>{emoji}</Text>
                      <View style={styles.itemIndexPill}>
                        <Text style={styles.itemIndexText}>{idx + 1}</Text>
                      </View>
                    </View>
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
                {/* Left Box */}
                <View style={styles.compareCard}>
                  <Text style={styles.compareEmoji}>
                    {currentQuestion.compareLeft?.icon}
                  </Text>
                  <Text style={styles.compareNumber}>
                    {currentQuestion.compareLeft?.count}
                  </Text>
                  <Text style={styles.compareLabel}>
                    {currentQuestion.compareLeft?.label}
                  </Text>
                </View>

                {/* Center comparison slot */}
                <View style={styles.compareSlot}>
                  <Text style={styles.compareSlotText}>
                    {selectedOptionId || "?"}
                  </Text>
                </View>

                {/* Right Box */}
                <View style={styles.compareCard}>
                  <Text style={styles.compareEmoji}>
                    {currentQuestion.compareRight?.icon}
                  </Text>
                  <Text style={styles.compareNumber}>
                    {currentQuestion.compareRight?.count}
                  </Text>
                  <Text style={styles.compareLabel}>
                    {currentQuestion.compareRight?.label}
                  </Text>
                </View>
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
                    onPress={() => handleSelectOption(opt.id)}
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
        <View style={styles.victoryContainer}>
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
        </View>
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
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compareCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F8F1FF",
    borderRadius: 20,
    padding: 12,
  },
  compareEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  compareNumber: {
    color: "#1E1830",
    fontSize: 22,
    fontWeight: "900",
  },
  compareLabel: {
    color: "#6F7880",
    fontSize: 11,
    fontWeight: "600",
  },
  compareSlot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFD167",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  compareSlotText: {
    color: "#251A00",
    fontSize: 26,
    fontWeight: "900",
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
