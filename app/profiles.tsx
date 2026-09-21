import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { UserProfile } from "../src/types/auth";
import { ProfileCard } from "../src/components/ProfileCard";
import { ParentPinModal } from "../src/components/ParentPinModal";
import { BrandHeader } from "../src/components/BrandHeader";

export default function ProfilesRoute() {
  const router = useRouter();
  const { userEmail, profiles, selectProfile, signOut, addProfile } = useAuth();

  const [selectedParentProfile, setSelectedParentProfile] =
    useState<UserProfile | null>(null);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleProfileClick = (profile: UserProfile) => {
    if (isEditMode) {
      Alert.alert(
        "Chỉnh sửa Hồ sơ",
        `Chỉnh sửa thông tin của: ${profile.name}`,
      );
      return;
    }

    if (profile.role === "parent") {
      setSelectedParentProfile(profile);
      setPinModalVisible(true);
    } else {
      selectProfile(profile);
      router.replace("/(tabs)");
    }
  };

  const handlePinSuccess = (parentProfile: UserProfile) => {
    setPinModalVisible(false);
    selectProfile(parentProfile);
    router.replace("/(tabs)");
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  const handleAddProfile = () => {
    addProfile("", "");
    Alert.alert("Thành công", "Đã thêm hồ sơ học viên mới!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.navBar}>
        <BrandHeader />

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setIsEditMode(!isEditMode)}
        >
          <Text style={styles.editBtnText}>
            {isEditMode ? "Xong" : "Quản lý hồ sơ"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Ai đang học?</Text>
        <Text style={styles.accountSubText}>
          Tài khoản: {userEmail || "phuhuynh@mathkids.edu.vn"}
        </Text>

        <View style={styles.gridContainer}>
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isEditMode={isEditMode}
              onPress={handleProfileClick}
            />
          ))}

          <TouchableOpacity
            style={styles.addCard}
            onPress={handleAddProfile}
            activeOpacity={0.7}
          >
            <View style={styles.addAvatarBox}>
              <Text style={styles.plusIcon}>+</Text>
            </View>
            <Text style={styles.addProfileName}>Thêm hồ sơ</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>

      <ParentPinModal
        visible={pinModalVisible}
        profile={selectedParentProfile}
        onClose={() => setPinModalVisible(false)}
        onSuccess={handlePinSuccess}
      />
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
    paddingVertical: 16,
  },
  editBtn: {
    borderWidth: 1,
    borderColor: "#737373",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  editBtnText: {
    color: "#E5E5E5",
    fontSize: 13,
    fontWeight: "500",
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 6,
  },
  accountSubText: {
    color: "#8C8C8C",
    fontSize: 14,
    marginBottom: 36,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    maxWidth: 500,
  },
  addCard: {
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 28,
    width: 110,
  },
  addAvatarBox: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#404040",
    borderStyle: "dashed",
  },
  plusIcon: {
    color: "#737373",
    fontSize: 42,
    fontWeight: "300",
  },
  addProfileName: {
    color: "#8C8C8C",
    fontSize: 14,
    marginTop: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  signOutBtn: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  signOutText: {
    color: "#737373",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
