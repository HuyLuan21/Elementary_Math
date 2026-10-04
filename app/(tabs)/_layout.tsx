import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";

export default function TabLayout() {
  const { activeProfile } = useAuth();
  const isParent = activeProfile?.role === "parent";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isParent
          ? { display: "none" } // Ẩn tab bar khi đang ở hồ sơ Phụ Huynh để hiển thị dashboard chuyên biệt
          : {
              backgroundColor: "#FFFFFF",
              borderTopColor: "rgba(0, 0, 0, 0.05)",
              borderTopWidth: 1,
              height: 72,
              borderTopLeftRadius: 48,
              borderTopRightRadius: 48,
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 8,
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 15,
              elevation: 10,
            },
        tabBarItemStyle: {
          borderRadius: 9999,
          overflow: "hidden",
          marginHorizontal: 6,
          paddingVertical: 6,
        },
        tabBarActiveBackgroundColor: "#FFD167",
        tabBarActiveTintColor: "#3F484F",
        tabBarInactiveTintColor: "#3F484F",
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      {/* 1. Tab Hành Trình (Chỉ hiển thị cho Bé) */}
      <Tabs.Screen
        name="journey"
        options={{
          title: "Hành trình",
          href: isParent ? null : "/(tabs)/journey",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Tab Góc Của Bé (Chỉ hiển thị cho Bé) */}
      <Tabs.Screen
        name="corner"
        options={{
          title: "Góc của bé",
          href: isParent ? null : "/(tabs)/corner",
          tabBarIcon: ({ color }) => (
            <Feather name="award" size={20} color={color} />
          ),
        }}
      />

      {/* 3. Tab Ba Mẹ (Chỉ hiển thị cho Phụ Huynh) */}
      <Tabs.Screen
        name="parent"
        options={{
          title: "Ba Mẹ",
          href: isParent ? "/(tabs)/parent" : null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="family-restroom" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
