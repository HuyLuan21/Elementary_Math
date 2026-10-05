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
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import { parentApi } from "../../../../src/services/parentApi";
import {
  ChildReport,
  ChapterReport,
  LessonReport,
  RecentActivity,
} from "../../../../src/types/parentReport";

type ReportState = {
  profileId: string | null;
  status: "loading" | "success" | "error";
  report: ChildReport | null;
};

export default function ChildReportRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ profileId: string | string[] }>();
  const profileId = Array.isArray(params.profileId)
    ? params.profileId[0] ?? null
    : params.profileId ?? null;
  const [retryCount, setRetryCount] = useState(0);
  const [reportState, setReportState] = useState<ReportState>({
    profileId: null,
    status: "loading",
    report: null,
  });

  useEffect(() => {
    if (!profileId) {
      setReportState({ profileId: null, status: "error", report: null });
      return;
    }

    let isCurrentRequest = true;
    setReportState({ profileId, status: "loading", report: null });

    parentApi
      .getChildReport(profileId)
      .then((report) => {
        if (isCurrentRequest) {
          setReportState({
            profileId,
            status: "success",
            report,
          });
        }
      })
      .catch((error: unknown) => {
        console.error("Không thể tải báo cáo của bé:", error);
        if (isCurrentRequest) {
          setReportState({ profileId, status: "error", report: null });
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [profileId, retryCount]);

  const stateMatchesProfile = reportState.profileId === profileId;
  const isLoading =
    Boolean(profileId) &&
    (!stateMatchesProfile || reportState.status === "loading");
  const hasError =
    !profileId || (stateMatchesProfile && reportState.status === "error");
  const report =
    stateMatchesProfile && reportState.status === "success"
      ? reportState.report
      : null;

  const goToOverview = () => {
    router.replace("/(tabs)/parent");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại tổng quan phụ huynh"
            onPress={goToOverview}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#3F484F" />
          </Pressable>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.eyebrow}>BÁO CÁO HỌC TẬP</Text>
            <Text style={styles.title} numberOfLines={1}>
              {report?.profile.display_name ?? "Báo cáo của bé"}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#E9A900" />
            <Text style={styles.stateTitle}>Đang tải báo cáo...</Text>
          </View>
        ) : hasError ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🧸</Text>
            <Text style={styles.stateTitle}>Chưa tải được báo cáo</Text>
            <Text style={styles.stateDescription}>
              Vui lòng thử lại hoặc quay về tổng quan.
            </Text>
            {profileId ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => setRetryCount((count) => count + 1)}
                style={styles.retryButton}
              >
                <RefreshCw size={17} color="#3F484F" />
                <Text style={styles.retryText}>Thử lại</Text>
              </Pressable>
            ) : null}
          </View>
        ) : report ? (
          <>
            <ChildProfileCard report={report} />
            <SummarySection summary={report.summary} />
            <ParentAdviceSection report={report} />
            <ReportSection title="📚 Các chặng học">
              {report.chapters.length ? (
                report.chapters.map((chapter) => (
                  <ChapterCard key={chapter.chapter_id} chapter={chapter} />
                ))
              ) : (
                <EmptyReport message="Chưa có dữ liệu chặng học" />
              )}
            </ReportSection>
            <ReportSection title="✏️ Bài học">
              {report.lessons.length ? (
                report.lessons.map((lesson) => (
                  <LessonCard key={lesson.lesson_id} lesson={lesson} />
                ))
              ) : (
                <EmptyReport message="Chưa có dữ liệu bài học" />
              )}
            </ReportSection>
            <ReportSection title="📅 Hoạt động gần đây">
              {report.recent_activity.length ? (
                report.recent_activity.map((activity) => (
                  <ActivityCard
                    key={activity.activity_date}
                    activity={activity}
                  />
                ))
              ) : (
                <EmptyReport message="Chưa có hoạt động gần đây" />
              )}
            </ReportSection>
            <ReportSection title="🏅 Huy hiệu">
              {report.badges.length ? (
                <View style={styles.collectionGrid}>
                  {report.badges.map((badge) => (
                    <AchievementCard
                      key={badge.id}
                      name={badge.name}
                      imageUrl={badge.image_url}
                      placeholder="🏅"
                    />
                  ))}
                </View>
              ) : (
                <EmptyReport message="Bé chưa có huy hiệu nào" />
              )}
            </ReportSection>
            <Pressable
              accessibilityRole="button"
              onPress={goToOverview}
              style={styles.overviewButton}
            >
              <ArrowLeft size={18} color="#3F484F" />
              <Text style={styles.overviewButtonText}>
                Quay lại tổng quan
              </Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChildProfileCard({ report }: { report: ChildReport }) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarUrl = report.profile.avatar_url;

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileAvatar}>
        {avatarUrl && !avatarFailed ? (
          <Image
            source={{ uri: avatarUrl }}
            onError={() => setAvatarFailed(true)}
            resizeMode="cover"
            style={styles.profileAvatarImage}
            accessibilityLabel={`Ảnh đại diện của ${report.profile.display_name}`}
          />
        ) : (
          <Text style={styles.profileAvatarPlaceholder}>🧒</Text>
        )}
      </View>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{report.profile.display_name}</Text>
        <Text style={styles.profileBirth}>
          {report.profile.birth_date
            ? `Sinh ngày ${formatDate(report.profile.birth_date)}`
            : "Chưa cập nhật ngày sinh"}
        </Text>
      </View>
    </View>
  );
}

function SummarySection({
  summary,
}: {
  summary: ChildReport["summary"];
}) {
  return (
    <>
      <View style={styles.summaryGrid}>
        <SummaryMetric value={summary.total_stars} label="Ngôi sao" emoji="⭐" />
        <SummaryMetric
          value={summary.completed_lessons}
          label="Bài hoàn thành"
          emoji="✏️"
        />
        <SummaryMetric
          value={summary.learning_days}
          label="Ngày học"
          emoji="📅"
        />
        <SummaryMetric
          value={summary.badge_count}
          label="Huy hiệu"
          emoji="🏅"
        />
        <SummaryMetric
          value={formatDuration(summary.total_seconds)}
          label="Thời gian học"
          emoji="⏱️"
        />
      </View>
      <Text style={styles.lastLearned}>
        {summary.last_learning_at
          ? `Học gần nhất: ${formatDate(summary.last_learning_at)}`
          : "Bé chưa có hoạt động học gần đây"}
      </Text>
    </>
  );
}

function ParentAdviceSection({ report }: { report: ChildReport }) {
  const completedCount = report.summary.completed_lessons;
  const totalStars = report.summary.total_stars;
  const name = report.profile.display_name || "Bé";

  const adviceList: Array<{ icon: string; title: string; desc: string }> = [];

  if (completedCount === 0) {
    adviceList.push({
      icon: "🌱",
      title: "Bắt đầu hành trình cùng bé",
      desc: `${name} đang ở vạch xuất phát. Ba mẹ hãy dành 10-15 phút mỗi tối ngồi cùng bé để khuyến khích sự tò mò và tạo hứng thú học tập nhé!`,
    });
  } else if (completedCount < 5) {
    adviceList.push({
      icon: "🌟",
      title: "Xây dựng thói quen hàng ngày",
      desc: `${name} đã hoàn thành ${completedCount} bài học rất tốt! Ba mẹ hãy duy trì thói quen học 1 bài mỗi ngày và khen thưởng bé bằng những lời động viên tích cực.`,
    });
  } else {
    adviceList.push({
      icon: "🏆",
      title: "Tiến bộ vượt bậc",
      desc: `${name} đã hoàn thành ${completedCount} bài học và thu thập được ${totalStars} ⭐! Ba mẹ có thể mở rộng bài học bằng cách đố bé đếm và so sánh đồ vật thực tế trong nhà.`,
    });
  }

  adviceList.push({
    icon: "⏱️",
    title: "Thời lượng học lý tưởng",
    desc: "Thời gian vàng cho bé mầm non là 15-20 phút/ngày. Tránh để bé nhìn màn hình quá lâu để bảo vệ mắt và giữ cho não bộ luôn thư giãn.",
  });

  adviceList.push({
    icon: "💬",
    title: "Tương tác thực tế",
    desc: "Khi cùng bé học các bài hình học và màu sắc, ba mẹ hãy hỏi bé: 'Quả dưa hấu hình gì?', 'Chiếc áo này màu gì?' để tăng khả năng quan sát.",
  });

  return (
    <View style={styles.adviceContainer}>
      <View style={styles.adviceHeaderRow}>
        <Text style={styles.adviceSectionEmoji}>💡</Text>
        <Text style={styles.adviceSectionTitle}>Lời khuyên cho Ba Mẹ</Text>
      </View>
      {adviceList.map((item, idx) => (
        <View key={idx} style={styles.adviceCard}>
          <Text style={styles.adviceIcon}>{item.icon}</Text>
          <View style={styles.adviceTextGroup}>
            <Text style={styles.adviceTitle}>{item.title}</Text>
            <Text style={styles.adviceDesc}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SummaryMetric({
  value,
  label,
  emoji,
}: {
  value: string | number;
  label: string;
  emoji: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryEmoji}>{emoji}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ChapterCard({ chapter }: { chapter: ChapterReport }) {
  return (
    <View style={styles.listCard}>
      <View style={styles.listCardText}>
        <Text style={styles.itemTitle}>{chapter.title}</Text>
        {chapter.description ? (
          <Text style={styles.itemDescription}>{chapter.description}</Text>
        ) : null}
        <Text style={styles.itemMeta}>
          {chapter.completed_lessons} bài · {chapter.earned_stars} sao
          {chapter.completed_at
            ? ` · Hoàn thành ${formatDate(chapter.completed_at)}`
            : ""}
        </Text>
      </View>
      <StatusPill status={chapter.status} />
    </View>
  );
}

function LessonCard({ lesson }: { lesson: LessonReport }) {
  return (
    <View style={styles.listCard}>
      <View style={styles.listCardText}>
        <Text style={styles.itemTitle}>{lesson.title}</Text>
        {lesson.description ? (
          <Text style={styles.itemDescription}>{lesson.description}</Text>
        ) : null}
        <Text style={styles.itemMeta}>
          {lesson.stars} sao · Điểm cao nhất {lesson.best_score} ·{" "}
          {lesson.attempts_count} lượt
        </Text>
        {lesson.last_played_at ? (
          <Text style={styles.itemDate}>
            Học gần nhất {formatDate(lesson.last_played_at)}
          </Text>
        ) : null}
      </View>
      <StatusPill status={lesson.status} />
    </View>
  );
}

function StatusPill({ status }: { status: string }) {
  const label =
    status === "completed"
      ? "Hoàn thành"
      : status === "in_progress"
        ? "Đang học"
        : status;
  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusText}>{label}</Text>
    </View>
  );
}

function ActivityCard({ activity }: { activity: RecentActivity }) {
  return (
    <View style={styles.activityCard}>
      <View style={styles.activityDateBlock}>
        <Text style={styles.activityDate}>
          {formatDate(activity.activity_date)}
        </Text>
        <Text style={styles.activityLessons}>
          {activity.lessons_done} bài
        </Text>
      </View>
      <View style={styles.activityMetrics}>
        <Text style={styles.activityMetric}>⭐ {activity.stars_gained}</Text>
        <Text style={styles.activityMetric}>
          ⏱️ {formatDuration(activity.total_seconds)}
        </Text>
      </View>
    </View>
  );
}

function AchievementCard({
  name,
  imageUrl,
  placeholder,
}: {
  name: string;
  imageUrl: string | null;
  placeholder: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <View style={styles.achievementCard}>
      {imageUrl && !imageFailed ? (
        <Image
          source={{ uri: imageUrl }}
          onError={() => setImageFailed(true)}
          resizeMode="contain"
          style={styles.achievementImage}
          accessibilityLabel={name}
        />
      ) : (
        <View style={styles.achievementPlaceholder}>
          <Text style={styles.achievementEmoji}>{placeholder}</Text>
        </View>
      )}
      <Text numberOfLines={2} style={styles.achievementName}>
        {name}
      </Text>
    </View>
  );
}

function EmptyReport({ message }: { message: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
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
    backgroundColor: "#F4F7FB",
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 90,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  headerTitleGroup: {
    flex: 1,
  },
  eyebrow: {
    color: "#A47A19",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: "#27313B",
    fontSize: 22,
    fontWeight: "800",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 14,
    marginBottom: 13,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF0C2",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarImage: {
    width: "100%",
    height: "100%",
  },
  profileAvatarPlaceholder: {
    fontSize: 29,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    color: "#303942",
    fontSize: 17,
    fontWeight: "800",
  },
  profileBirth: {
    color: "#7B838C",
    fontSize: 12,
    marginTop: 4,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryCard: {
    width: "31.5%",
    minHeight: 106,
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 9,
  },
  summaryEmoji: {
    fontSize: 19,
  },
  summaryValue: {
    color: "#303942",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 3,
  },
  summaryLabel: {
    color: "#7B838C",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  lastLearned: {
    color: "#9299A0",
    fontSize: 11,
    marginBottom: 14,
    marginTop: -3,
    textAlign: "right",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#303942",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 10,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 8,
  },
  listCardText: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    color: "#37414B",
    fontSize: 14,
    fontWeight: "700",
  },
  itemDescription: {
    color: "#707B85",
    fontSize: 11,
    marginTop: 4,
  },
  itemMeta: {
    color: "#7B838C",
    fontSize: 11,
    marginTop: 5,
  },
  itemDate: {
    color: "#9299A0",
    fontSize: 10,
    marginTop: 3,
  },
  statusPill: {
    backgroundColor: "#FFF0C2",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    color: "#806116",
    fontSize: 10,
    fontWeight: "700",
  },
  activityCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 13,
    marginBottom: 8,
  },
  activityDateBlock: {
    flex: 1,
  },
  activityDate: {
    color: "#37414B",
    fontSize: 13,
    fontWeight: "700",
  },
  activityLessons: {
    color: "#7B838C",
    fontSize: 11,
    marginTop: 3,
  },
  activityMetrics: {
    alignItems: "flex-end",
  },
  activityMetric: {
    color: "#66717B",
    fontSize: 11,
    marginVertical: 2,
  },
  collectionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  achievementCard: {
    width: "31%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 9,
    marginRight: "2.5%",
    marginBottom: 9,
  },
  achievementImage: {
    width: 60,
    height: 60,
  },
  achievementPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: "#FFF4D4",
    alignItems: "center",
    justifyContent: "center",
  },
  achievementEmoji: {
    fontSize: 30,
  },
  achievementName: {
    color: "#4A545E",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#7B838C",
    fontSize: 12,
    textAlign: "center",
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
  overviewButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#FFD167",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 11,
    marginTop: 2,
  },
  overviewButtonText: {
    color: "#3F484F",
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 8,
  },
  adviceContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#F0E4C3",
  },
  adviceHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adviceSectionEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  adviceSectionTitle: {
    color: "#303942",
    fontSize: 16,
    fontWeight: "800",
  },
  adviceCard: {
    flexDirection: "row",
    backgroundColor: "#FFFBF0",
    borderRadius: 13,
    padding: 11,
    marginBottom: 8,
    alignItems: "flex-start",
  },
  adviceIcon: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 1,
  },
  adviceTextGroup: {
    flex: 1,
  },
  adviceTitle: {
    color: "#37414B",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  adviceDesc: {
    color: "#68737D",
    fontSize: 11.5,
    lineHeight: 16,
  },
});
