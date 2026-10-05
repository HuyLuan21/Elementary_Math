import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Tabs, usePathname, useRouter } from "expo-router";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/context/AuthContext";

function CustomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  const { activeProfile } = useAuth();
  const isParent = activeProfile?.role === "parent";

  // Parent không sử dụng bottom navigation
  if (isParent) {
    return null;
  }

  const tabs = [
    {
      name: "journey",
      label: "Hành trình",
      path: "/journey",

      icon: (color: string, focused: boolean) => (
        <Ionicons
          name={focused ? "map" : "map-outline"}
          size={20}
          color={color}
        />
      ),
    },

    {
      name: "corner",
      label: "Góc của bé",
      path: "/corner",

      icon: (color: string) => <Feather name="award" size={20} color={color} />,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;

          return (
            <Pressable
              key={tab.name}
              onPress={() => router.navigate(tab.path)}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              {tab.icon("#3F484F", isActive)}

              <Text style={styles.label}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  const { activeProfile } = useAuth();

  const isParent = activeProfile?.role === "parent";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Ẩn tab bar mặc định của Expo Router.
        // Mình render CustomTabBar bên dưới.
        tabBarStyle: {
          display: "none",
        },
      }}
      tabBar={() => <CustomTabBar />}
    >
      {/* ================================
          HÀNH TRÌNH
          ================================ */}
      <Tabs.Screen
        name="journey"
        options={{
          title: "Hành trình",

          // Parent không được hiển thị tab này
          href: isParent ? null : "/journey",
        }}
      />

      {/* ================================
          GÓC CỦA BÉ
          ================================ */}
      <Tabs.Screen
        name="corner"
        options={{
          title: "Góc của bé",

          // Parent không được hiển thị tab này
          href: isParent ? null : "/corner",
        }}
      />

      {/* ================================
          BA MẸ
          ================================ */}
      <Tabs.Screen
        name="parent"
        options={{
          title: "Ba Mẹ",

          // Chỉ parent mới có route/tab này
          href: isParent ? "/parent" : null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  /**
   * Toàn bộ navigation bar
   */
  container: {
    position: "absolute",

    left: 0,
    right: 0,
    bottom: 0,

    height: 72,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",

    // Shadow trên Android
    elevation: 10,

    // Shadow trên iOS / Web
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },

  /**
   * Các tab nằm ngang
   */
  tabBar: {
    flex: 1,

    flexDirection: "row",

    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,

    gap: 8,
  },

  /**
   * Tab bình thường
   */
  tab: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    borderRadius: 9999,

    backgroundColor: "transparent",
  },

  /**
   * Tab đang active
   */
  activeTab: {
    backgroundColor: "#FFD167",
  },

  /**
   * Text của tab
   */
  label: {
    marginTop: 2,

    color: "#3F484F",

    fontSize: 13,
    fontWeight: "700",
  },
});
