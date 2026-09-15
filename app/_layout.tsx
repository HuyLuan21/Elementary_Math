import React from 'react';
import  { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#141414' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Đăng nhập' }} />
        <Stack.Screen name="profiles" options={{ title: 'Chọn hồ sơ' }} />
        <Stack.Screen name="home" options={{ title: 'Trang chủ' }} />
      </Stack>
    </AuthProvider>
  );
}
