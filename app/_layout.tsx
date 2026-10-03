import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { StatusBar } from "expo-status-bar";
import { ParentPinModal } from "../src/components/ParentPinModal";
import { useAuth } from "../src/context/AuthContext";
import { authApi } from "../src/services/authApi";

function AppNavigator() {
  const { currentUser, updateCurrentUser } = useAuth();
  const setupPinRequired = currentUser?.pin_enabled === false;

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
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#141414" },
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
