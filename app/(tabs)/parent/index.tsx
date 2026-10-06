import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft, KeyRound, LogOut, RefreshCw, Users } from "lucide-react-native";
import { useAuth } from "../../../src/context/AuthContext";
import { parentApi } from "../../../src/services/parentApi";
import { ParentOverviewProfile } from "../../../src/types/parentReport";
import { ParentPinModal } from "../../../src/components/ParentPinModal";
import { ProfileOverviewCard } from "../../../src/components/parent/ProfileOverviewCard";

type OverviewState = {
  status: "loading" | "success" | "error";
  profiles: ParentOverviewProfile[];
};

export default function ParentOverviewRoute() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [changePinVisible, setChangePinVisible] = useState(false);
  const [overviewState, setOverviewState] = useState<OverviewState>({
    status: "loading",
    profiles: [],
  });

  useEffect(() => {
    let isCurrentRequest = true;
    setOverviewState((current) => ({
      status: "loading",
      profiles: current.profiles,
    }));

    parentApi
      .getParentOverview()
      .then((profiles) => {
        if (isCurrentRequest) {
          setOverviewState({
            status: "success",
            profiles,
          });
        }
      })
      .catch((error: unknown) => {
        console.error("Không thể tải tổng quan phụ huynh:", error);
        if (isCurrentRequest) {
          setOverviewState((current) => ({
            status: "error",
            profiles: current.profiles,
          }));
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [retryCount]);

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  const openChildReport = (profileId: string) => {
    router.push({
      pathname: "/(tabs)/parent/report/[profileId]",
      params: { profileId },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <View style={styles.headerIcon}>
              <Users size={23} color="#8C6410" />
            </View>
            <View>
              <Text style={styles.eyebrow}>KHU VỰC GIA ĐÌNH</Text>
              <Text style={styles.title}>Góc Ba Mẹ</Text>
            </View>
          </View>
          <View style={styles.headerRightActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đổi mã PIN"
              onPress={() => setChangePinVisible(true)}
              style={styles.changePinButton}
            >
              <KeyRound size={15} color="#8C6410" />
              <Text style={styles.changePinText}>Đổi PIN</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đổi hồ sơ"
              onPress={() => router.replace("/profiles")}
              style={styles.switchProfileButton}
            >
              <ArrowLeft size={16} color="#8C6410" />
              <Text style={styles.switchProfileText}>Đổi hồ sơ</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đăng xuất"
              onPress={handleSignOut}
              style={styles.logoutButton}
            >
              <LogOut size={18} color="#687480" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.intro}>
          Cùng xem hành trình học tập của các bé nhé!
        </Text>

        {overviewState.status === "loading" ? (
          <View style={styles.stateCard}>
            <ActivityIndicator size="large" color="#E9A900" />
            <Text style={styles.stateTitle}>Đang tải hồ sơ các bé...</Text>
          </View>
        ) : overviewState.status === "error" ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🧸</Text>
            <Text style={styles.stateTitle}>Chưa tải được thông tin</Text>
            <Text style={styles.stateDescription}>
              Vui lòng kiểm tra kết nối rồi thử lại.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRetryCount((count) => count + 1)}
              style={styles.retryButton}
            >
              <RefreshCw size={17} color="#3F484F" />
              <Text style={styles.retryText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : overviewState.profiles.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.stateEmoji}>🧸</Text>
            <Text style={styles.stateTitle}>Chưa có hồ sơ bé</Text>
            <Text style={styles.stateDescription}>
              Hãy thêm hồ sơ bé để xem báo cáo học tập.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Hồ sơ các bé</Text>
              <Text style={styles.profileCount}>
                {overviewState.profiles.length} bé
              </Text>
            </View>
            {overviewState.profiles.map((profile) => (
              <ProfileOverviewCard
                key={profile.id}
                profile={profile}
                onPress={() => openChildReport(profile.id)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Modal Đổi mã PIN */}
      <ParentPinModal
        visible={changePinVisible}
        mode="change"
        onClose={() => setChangePinVisible(false)}
        onSuccess={() => setChangePinVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 90,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: "#FFF3C9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  eyebrow: {
    color: "#A47A19",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    color: "#27313B",
    fontSize: 25,
    fontWeight: "800",
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changePinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#FFF2D6",
    borderWidth: 1,
    borderColor: "#FFE08A",
  },
  changePinText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8C6410",
  },
  switchProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "#FFF2D6",
    borderWidth: 1,
    borderColor: "#FFE08A",
  },
  switchProfileText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8C6410",
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  intro: {
    color: "#69737E",
    fontSize: 14,
    marginTop: 15,
    marginBottom: 22,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#303942",
    fontSize: 18,
    fontWeight: "800",
  },
  profileCount: {
    color: "#8B6C24",
    backgroundColor: "#FFEFC1",
    borderRadius: 14,
    overflow: "hidden",
    paddingHorizontal: 11,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: "700",
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
});
