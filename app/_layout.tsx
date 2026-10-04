import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { ParentPinModal } from "../src/components/ParentPinModal";
import { authApi } from "../src/services/authApi";

function AppNavigator() {
  const { currentUser, authToken, isRestoring, updateCurrentUser } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const setupPinRequired = currentUser?.pin_enabled === false;

  // Protected Route Guard: Tự động đá về trang Đăng nhập khi không có authToken
  useEffect(() => {
    if (isRestoring) return;

    const firstSegment = segments[0] as string | undefined;
    const inProtectedArea =
      firstSegment === "(tabs)" ||
      firstSegment === "profiles" ||
      firstSegment === "lesson";

    if (!authToken && inProtectedArea) {
      router.replace("/");
    }
  }, [authToken, isRestoring, segments, router]);

  const handlePinSetupSuccess = () => {
    if (currentUser) {
      updateCurrentUser({ ...currentUser, pin_enabled: true });
    }
  };

  const refreshAfterPinAlreadySet = async () => {
    const user = await authApi.getMe();
    updateCurrentUser(user);
    return user.pin_enabled;
  };

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F4F7FB" },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" options={{ title: "Đăng nhập" }} />
        <Stack.Screen name="profiles" options={{ title: "Chọn hồ sơ" }} />
        <Stack.Screen name="(tabs)" options={{ title: "Trang chủ" }} />
        <Stack.Screen
          name="lesson/[id]"
          options={{
            title: "Làm bài tập",
            animation: "slide_from_bottom",
            contentStyle: { backgroundColor: "#FDF7FF" },
          }}
        />
      </Stack>
      <ParentPinModal
        visible={setupPinRequired}
        mode="setup"
        onClose={() => {}}
        onSuccess={handlePinSetupSuccess}
        onPinAlreadySet={refreshAfterPinAlreadySet}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
