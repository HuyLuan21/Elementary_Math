import React from "react";
import { Tabs } from "expo-router";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#FFFFFF",
          borderTopWidth: 0,
          height: 74,
          paddingHorizontal: 12,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarItemStyle: {
          borderRadius: 9999,
          overflow: "hidden",
          marginHorizontal: 4,
        },
        tabBarActiveBackgroundColor: "#FFD167",
        tabBarActiveTintColor: "#3F484F",
        tabBarInactiveTintColor: "#7B838C",
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
          title: "Ba Mẹ",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="family-restroom" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
