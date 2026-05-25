import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "@/lib/app-context";
import { GlassCard } from "@/components/glass-card";

export default function ProfileScreen() {
  const { user, logout } = useApp();

  const handleLogout = () => {
    Alert.alert("Logg ut", "Er du sikker på at du vil logge ut?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Logg ut",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: "card" as const,
      title: "Betalingsmetoder",
      subtitle: "Legg til eller administrer kort",
      onPress: () => router.push("/settings"),
    },
    {
      icon: "location" as const,
      title: "Favorittadresser",
      subtitle: "Hjem, jobb og lagrede steder",
      onPress: () => router.push("/settings"),
    },
    {
      icon: "time" as const,
      title: "Reisehistorikk",
      subtitle: "Se alle dine tidligere turer",
      onPress: () => router.push("/(tabs)/trips"),
    },
    {
      icon: "shield-checkmark" as const,
      title: "Sikkerhet",
      subtitle: "Nødkontakter og deling",
      onPress: () => {},
    },
    {
      icon: "notifications" as const,
      title: "Varsler",
      subtitle: "Administrer varslingsinnstillinger",
      onPress: () => {},
    },
    {
      icon: "help-circle" as const,
      title: "Hjelp & Support",
      subtitle: "FAQ og kundeservice",
      onPress: () => {},
    },
    {
      icon: "information-circle" as const,
      title: "Om KJAPP",
      subtitle: "Versjon 1.0.0",
      onPress: () => {},
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0E1A", "#0F1629"]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil</Text>
        </View>

        {/* Profile Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={["#00A3FF", "#006DFF"]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || "K"}
              </Text>
            </LinearGradient>
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.profileName}>{user?.name || "Kunde"}</Text>
          <Text style={styles.profilePhone}>{user?.phone || "+47 XXX XX XXX"}</Text>
          <Pressable style={styles.editButton}>
            <Ionicons name="pencil" size={14} color="#00A3FF" />
            <Text style={styles.editButtonText}>Rediger profil</Text>
          </Pressable>
        </GlassCard>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Pressable key={index} onPress={item.onPress}>
              <GlassCard style={styles.menuItem} neonBorder={false}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={20} color="#00A3FF" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#4A6180" />
              </GlassCard>
            </Pressable>
          ))}
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FF4757" />
          <Text style={styles.logoutText}>Logg ut</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  profileCard: {
    alignItems: "center",
    padding: 24,
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#00E68A",
    borderWidth: 3,
    borderColor: "#0A0E1A",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: "#4A6180",
    marginBottom: 14,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,163,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.2)",
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#00A3FF",
  },
  menuContainer: {
    gap: 8,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,163,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#4A6180",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,71,87,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,71,87,0.2)",
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF4757",
  },
});
