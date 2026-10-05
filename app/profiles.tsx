import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyRound, LogOut, Plus, RefreshCw } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { ProfileInput, UserProfile } from "../src/types/auth";
import { ProfileCard } from "../src/components/ProfileCard";
import { EditProfileModal } from "../src/components/EditProfileModal";
import { BrandHeader } from "../src/components/BrandHeader";
import { ParentPinModal } from "../src/components/ParentPinModal";

export default function ProfilesRoute() {
  const router = useRouter();
  const {
    userEmail,
    profiles,
    activeProfile,
    loadingProfiles,
    profilesError,
    selectProfile,
    signOut,
    addProfile,
    editProfile,
    deleteProfile,
    refreshProfiles,
  } = useAuth();

  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [verifyPinVisible, setVerifyPinVisible] = useState(false);
  const [changePinVisible, setChangePinVisible] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<UserProfile | null>(null);
  const childProfiles = profiles.filter((profile) => profile.role === "child");
  const parentProfile = profiles.find((profile) => profile.role === "parent");
  const isMaxProfilesReached = childProfiles.length >= 5;

  const handleProfileClick = (profile: UserProfile) => {
    if (activeProfile?.id === profile.id || !activeProfile) {
      selectProfile(profile);
      if (profile.role === "parent") {
        router.replace("/(tabs)/parent");
      } else {
        router.replace("/(tabs)/journey");
      }
      return;
    }

    setPendingProfile(profile);
    setVerifyPinVisible(true);
  };

  const handleProfileSwitchVerified = () => {
    if (!pendingProfile) return;
    const targetRole = pendingProfile.role;
    selectProfile(pendingProfile);
    setPendingProfile(null);
    setVerifyPinVisible(false);
    if (targetRole === "parent") {
      router.replace("/(tabs)/parent");
    } else {
      router.replace("/(tabs)/journey");
    }
  };

  const handleVerifyPinClose = () => {
    setPendingProfile(null);
    setVerifyPinVisible(false);
  };

  const handleSignOut = () => {
    setPendingProfile(null);
    setVerifyPinVisible(true);
  };

  const handleAccountSwitchVerified = async () => {
    setVerifyPinVisible(false);
    setPendingProfile(null);
    await signOut();
    router.replace("/");
  };

  const handleSaveProfile = async (
    profileId: string | null,
    profileData: ProfileInput
  ) => {
    if (profileId) {
      await editProfile(profileId, profileData);
    } else {
      if (isMaxProfilesReached) throw new Error("Bạn đã có 5 hồ sơ bé.");
      await addProfile(profileData);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    await deleteProfile(profileId);
  };

  const openCreateForm = () => {
    setEditingProfile(null);
    setFormVisible(true);
  };

  const openEditForm = (profile: UserProfile) => {
    setEditingProfile(profile);
    setFormVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <View style={styles.navInner}>
          <BrandHeader />
          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.changePinBtn}
              onPress={() => setChangePinVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Đổi mã PIN phụ huynh"
            >
              <KeyRound size={16} color="#8C6410" />
              <Text style={styles.changePinText}>Đổi PIN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Đăng xuất tài khoản"
            >
              <LogOut size={16} color="#6B7280" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.introRow}>
            <View style={styles.introCopy}>
              <Text style={styles.eyebrow}>KHÔNG GIAN GIA ĐÌNH</Text>
              <Text style={styles.headerTitle}>Chọn bé</Text>
              <Text style={styles.subtitle}>
                Ai sẽ bắt đầu hành trình toán vui hôm nay?
              </Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countNumber}>{childProfiles.length}/5</Text>
              <Text style={styles.countCaption}>hồ sơ bé</Text>
            </View>
          </View>

          {profilesError ? (
            <View style={styles.errorBanner}>
              <View style={styles.errorCopy}>
                <Text style={styles.errorTitle}>Chưa thể tải hồ sơ</Text>
                <Text style={styles.errorMessage}>{profilesError}</Text>
              </View>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => void refreshProfiles()}
                accessibilityRole="button"
                accessibilityLabel="Thử tải lại hồ sơ"
              >
                <RefreshCw size={17} color="#168FC5" />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Hồ sơ học viên</Text>
              <Text style={styles.sectionSubtitle}>
                Chọn một hồ sơ để tiếp tục học
              </Text>
            </View>
            {!isMaxProfilesReached ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={openCreateForm}
                accessibilityRole="button"
              >
                <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.addButtonText}>Thêm bé</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {loadingProfiles ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="small" color="#35A9E0" />
              <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
            </View>
          ) : childProfiles.length > 0 ? (
            <View style={styles.gridContainer}>
              {childProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  isSelected={activeProfile?.id === profile.id}
                  onPress={handleProfileClick}
                  onEdit={openEditForm}
                />
              ))}
              {!isMaxProfilesReached ? (
                <TouchableOpacity
                  style={styles.addCard}
                  onPress={openCreateForm}
                  accessibilityRole="button"
                >
                  <View style={styles.addIconCircle}>
                    <Plus size={25} color="#168FC5" />
                  </View>
                  <Text style={styles.addCardTitle}>Thêm bé</Text>
                  <Text style={styles.addCardSub}>Tạo hồ sơ mới</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIllustration}>
                <Text style={styles.emptyEmoji}>🐣</Text>
              </View>
              <Text style={styles.emptyTitle}>Chưa có hồ sơ bé</Text>
              <Text style={styles.emptyText}>
                Thêm hồ sơ để bắt đầu hành trình học toán
              </Text>
              {!isMaxProfilesReached ? (
                <TouchableOpacity style={styles.emptyButton} onPress={openCreateForm}>
                  <Plus size={18} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.addButtonText}>Thêm bé</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {isMaxProfilesReached ? (
            <View style={styles.maxProfilesNotice}>
              <Text style={styles.maxProfilesText}>Bạn đã có 5 hồ sơ bé</Text>
            </View>
          ) : null}

          {parentProfile ? (
            <TouchableOpacity
              style={styles.parentRow}
              onPress={() => handleProfileClick(parentProfile)}
              accessibilityRole="button"
            >
              <Text style={styles.parentEmoji}>{parentProfile.avatarIcon}</Text>
              <View style={styles.parentCopy}>
                <Text style={styles.parentTitle}>Khu vực phụ huynh</Text>
                <Text style={styles.parentSubtitle}>Quản lý tài khoản gia đình</Text>
              </View>
              <Text style={styles.parentArrow}>›</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.accountText} numberOfLines={1}>
            Đang đăng nhập: {userEmail || "Tài khoản phụ huynh"}
          </Text>
        </View>
      </ScrollView>

      <EditProfileModal
        visible={formVisible}
        profile={editingProfile}
        onClose={() => {
          setFormVisible(false);
          setEditingProfile(null);
        }}
        onSave={handleSaveProfile}
        onDelete={handleDeleteProfile}
      />
      <ParentPinModal
        visible={verifyPinVisible}
        mode="verify"
        onClose={pendingProfile ? handleVerifyPinClose : () => setVerifyPinVisible(false)}
        onSuccess={pendingProfile ? handleProfileSwitchVerified : handleAccountSwitchVerified}
      />
      <ParentPinModal
        visible={changePinVisible}
        mode="change"
        onClose={() => setChangePinVisible(false)}
        onSuccess={() => setChangePinVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  navBar: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EDF2",
  },
  navInner: {
    width: "100%",
    maxWidth: 980,
    minHeight: 62,
    alignSelf: "center",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  changePinBtn: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#FFF2D6",
    borderWidth: 1,
    borderColor: "#FFE08A",
  },
  changePinText: { color: "#8C6410", fontSize: 13, fontWeight: "700" },
  logoutBtn: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: "#F4F7FB",
  },
  logoutText: { color: "#5B6570", fontSize: 13, fontWeight: "600" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 36 },
  content: { width: "100%", maxWidth: 940, alignSelf: "center" },
  introRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 34,
    paddingBottom: 28,
    gap: 14,
  },
  introCopy: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: "#168FC5",
    fontSize: 11,
    letterSpacing: 0.8,
    fontWeight: "800",
    marginBottom: 7,
  },
  headerTitle: { color: "#111827", fontSize: 32, fontWeight: "800" },
  subtitle: { color: "#6B7280", fontSize: 15, lineHeight: 22, marginTop: 5 },
  countBadge: {
    minWidth: 76,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF3C9",
    borderRadius: 12,
    alignItems: "center",
  },
  countNumber: { color: "#574300", fontSize: 17, fontWeight: "800" },
  countCaption: { color: "#7B641A", fontSize: 10, fontWeight: "600", marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 15,
    gap: 12,
  },
  sectionTitle: { color: "#111827", fontSize: 19, fontWeight: "700" },
  sectionSubtitle: { color: "#7B8490", fontSize: 13, marginTop: 4 },
  addButton: {
    minHeight: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "#35A9E0",
  },
  emptyButton: {
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#35A9E0",
    marginTop: 19,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -7 },
  addCard: {
    minHeight: 148,
    flexBasis: 260,
    flexGrow: 1,
    margin: 7,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#B9DFF0",
    borderStyle: "dashed",
    backgroundColor: "#F8FCFE",
    alignItems: "center",
    justifyContent: "center",
  },
  addIconCircle: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#DFF3FC",
    alignItems: "center",
    justifyContent: "center",
  },
  addCardTitle: { color: "#168FC5", fontSize: 15, fontWeight: "700", marginTop: 8 },
  addCardSub: { color: "#7B8490", fontSize: 12, marginTop: 3 },
  emptyState: {
    minHeight: 270,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#DDE5EC",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginBottom: 18,
  },
  emptyIllustration: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#FFF3C9",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyEmoji: { fontSize: 51 },
  emptyTitle: { color: "#111827", fontSize: 19, fontWeight: "700", marginTop: 18 },
  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 6,
  },
  loadingState: {
    minHeight: 178,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  loadingText: { color: "#6B7280", fontSize: 14 },
  errorBanner: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3F2",
    borderWidth: 1,
    borderColor: "#F8C9C6",
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  errorCopy: { flex: 1 },
  errorTitle: { color: "#B43F3A", fontSize: 13, fontWeight: "700" },
  errorMessage: { color: "#8A5552", fontSize: 12, marginTop: 3 },
  retryButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  maxProfilesNotice: {
    backgroundColor: "#FFF3C9",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginTop: 7,
  },
  maxProfilesText: {
    color: "#725B0D",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  parentRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE5EC",
    marginTop: 25,
    paddingHorizontal: 14,
  },
  parentEmoji: { fontSize: 28, marginRight: 12 },
  parentCopy: { flex: 1 },
  parentTitle: { color: "#263445", fontSize: 14, fontWeight: "700" },
  parentSubtitle: { color: "#7B8490", fontSize: 12, marginTop: 3 },
  parentArrow: { color: "#8A96A2", fontSize: 25, marginLeft: 8 },
  accountText: { color: "#89939E", fontSize: 12, textAlign: "center", marginTop: 27 },
});
