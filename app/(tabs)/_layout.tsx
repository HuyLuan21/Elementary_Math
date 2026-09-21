import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          borderTopColor: "#262626",
          borderTopWidth: 1,
          height: 68,
          paddingHorizontal: 16,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          borderRadius: 9999,
          overflow: "hidden",
        },
        tabBarActiveBackgroundColor: "#FFD167",
        tabBarActiveTintColor: "#3F484F",
        tabBarInactiveTintColor: "#8C8C8C",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="journey"
        options={{
          title: "Hành trình",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "map" : "map-outline"}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "Góc của bé",
          tabBarIcon: ({ color }) => (
            <Feather name="award" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="parent"
        options={{
          title: "Ba mẹ",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="family-restroom" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
