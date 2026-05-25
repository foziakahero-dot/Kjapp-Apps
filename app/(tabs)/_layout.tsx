import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#00A3FF",
        tabBarInactiveTintColor: "#4A6180",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Hjem",
          tabBarIcon: ({ color, size }) => (
            <View style={color === "#00A3FF" ? styles.activeIcon : undefined}>
              <Ionicons name="home" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: "Turer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "AI",
          tabBarIcon: ({ color, size }) => (
            <View style={color === "#00A3FF" ? styles.aiIconActive : styles.aiIcon}>
              <Ionicons name="sparkles" size={22} color={color === "#00A3FF" ? "#FFFFFF" : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#0A0E1A",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,163,255,0.1)",
    height: 85,
    paddingTop: 8,
    paddingBottom: 28,
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  activeIcon: {
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,163,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  aiIconActive: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#00A3FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
});
