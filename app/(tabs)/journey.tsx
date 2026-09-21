import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "../../src/components/BrandHeader";

export default function JourneyRoute() {
  const levels = [
    { id: 1, title: "Bài 1: Đếm số 1 đến 10", status: "completed", score: "10/10", icon: "⭐" },
    { id: 2, title: "Bài 2: Phép Cộng Cơ Bản", status: "completed", score: "9/10", icon: "➕" },
    { id: 3, title: "Bài 3: Phép Trừ Cơ Bản", status: "active", score: "", icon: "➖" },
    { id: 4, title: "Bài 4: So Sánh Lớn Bé", status: "locked", score: "", icon: "🔒" },
    { id: 5, title: "Bài 5: Hình Tròn, Hình Vuông", status: "locked", score: "", icon: "🔒" },
    { id: 6, title: "Bài 6: Thử Thách Điểm 10", status: "locked", score: "", icon: "🏆" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BrandHeader />
        <Text style={styles.headerTitle}>🗺️ Hành Trình Học Toán</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>Chinh phục từng chặng đèo toán học nào!</Text>

        <View style={styles.journeyList}>
          {levels.map((item, idx) => (
            <View key={item.id} style={styles.levelRow}>
              <View style={styles.timelineColumn}>
                <View
                  style={[
                    styles.node,
                    item.status === "completed" && styles.nodeCompleted,
                    item.status === "active" && styles.nodeActive,
                    item.status === "locked" && styles.nodeLocked,
                  ]}
                >
                  <Text style={styles.nodeIcon}>{item.icon}</Text>
                </View>
                {idx < levels.length - 1 && (
                  <View
                    style={[
                      styles.line,
                      item.status === "completed" && styles.lineCompleted,
                    ]}
                  />
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.card,
                  item.status === "active" && styles.cardActive,
                  item.status === "locked" && styles.cardLocked,
                ]}
                disabled={item.status === "locked"}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.score ? (
                    <Text style={styles.scoreBadge}>{item.score}</Text>
                  ) : null}
                </View>

                <Text style={styles.cardDesc}>
                  {item.status === "completed" && "✅ Đã hoàn thành"}
                  {item.status === "active" && "🔥 Bài đang học - Nhấn để làm bài!"}
                  {item.status === "locked" && "🔒 Hoàn thành bài trước để mở khóa"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#262626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  subTitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 24,
  },
  journeyList: {
    paddingLeft: 10,
  },
  levelRow: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineColumn: {
    alignItems: "center",
    marginRight: 16,
  },
  node: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#262626",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#404040",
  },
  nodeCompleted: {
    backgroundColor: "#059669",
    borderColor: "#10B981",
  },
  nodeActive: {
    backgroundColor: "#E50914",
    borderColor: "#FF4D4D",
  },
  nodeLocked: {
    backgroundColor: "#1F1F1F",
    borderColor: "#333333",
  },
  nodeIcon: {
    fontSize: 18,
  },
  line: {
    width: 3,
    flex: 1,
    backgroundColor: "#262626",
    marginVertical: 4,
  },
  lineCompleted: {
    backgroundColor: "#059669",
  },
  card: {
    flex: 1,
    backgroundColor: "#1F1F1F",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#262626",
    justifyContent: "center",
  },
  cardActive: {
    borderColor: "#E50914",
    backgroundColor: "#2A1415",
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  scoreBadge: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardDesc: {
    color: "#9CA3AF",
    fontSize: 12,
  },
});
