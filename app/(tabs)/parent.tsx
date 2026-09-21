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
import { useAuth } from "../../src/context/AuthContext";
import { BrandHeader } from "../../src/components/BrandHeader";

export default function ParentRoute() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BrandHeader />
        <Text style={styles.headerTitle}>🛡️ Chế độ Phụ Huynh</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subTitle}>Quản lý học tập và cài đặt tài khoản</Text>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionHeader}>📈 Báo cáo tuần này</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>3.5 giờ</Text>
              <Text style={styles.statLbl}>Tổng thời gian học</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>42/45</Text>
              <Text style={styles.statLbl}>Bài tập đúng</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>93%</Text>
              <Text style={styles.statLbl}>Tỷ lệ chính xác</Text>
            </View>
          </View>
        </View>

        <View style={styles.settingSection}>
          <Text style={styles.sectionHeader}>⚙️ Cài đặt quản lý</Text>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.rowIcon}>⏰</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Giới hạn thời gian học</Text>
              <Text style={styles.rowSub}>Tự động tạm khóa sau 60 phút</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.rowIcon}>🔑</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Đổi mã PIN Phụ Huynh</Text>
              <Text style={styles.rowSub}>Mã hiện tại: ****</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => router.replace("/profiles")}
          >
            <Text style={styles.rowIcon}>👶</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Quản lý Hồ sơ Các Bé</Text>
              <Text style={styles.rowSub}>Thêm / sửa thông tin bé</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            signOut();
            router.replace("/");
          }}
        >
          <Text style={styles.logoutBtnText}>🚪 Đăng xuất tài khoản</Text>
        </TouchableOpacity>
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
    marginBottom: 20,
  },
  sectionHeader: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statsContainer: {
    marginBottom: 28,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    flex: 1,
    backgroundColor: "#1F1F1F",
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#262626",
  },
  statVal: {
    color: "#38BDF8",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLbl: {
    color: "#9CA3AF",
    fontSize: 11,
    textAlign: "center",
  },
  settingSection: {
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1F1F1F",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#262626",
  },
  rowIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  rowSub: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: "#6B7280",
    fontSize: 20,
  },
  logoutBtn: {
    backgroundColor: "#331515",
    borderWidth: 1,
    borderColor: "#E50914",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },
  logoutBtnText: {
    color: "#FF6B6B",
    fontWeight: "bold",
    fontSize: 14,
  },
});
