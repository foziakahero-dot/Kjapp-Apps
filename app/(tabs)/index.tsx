import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "@/lib/app-context";
import { KjappLogo } from "@/components/kjapp-logo";
import { GlassCard } from "@/components/glass-card";
import { NeonButton } from "@/components/neon-button";
import { AppMapView as MapView, AppMarker as Marker, APP_MAP_PROVIDER } from "@/components/map-view";

const { width } = Dimensions.get("window");

// Oslo center coordinates
const OSLO_REGION = {
  latitude: 59.9139,
  longitude: 10.7522,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function HomeScreen() {
  const { user, savedAddresses } = useApp();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const handleBooking = () => {
    if (destination.trim()) {
      router.push({
        pathname: "/ride",
        params: {
          pickup: pickup || "Min posisjon",
          destination: destination,
        },
      });
    }
  };

  const handleSettingsPress = () => {
    router.push("/settings");
  };

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0A0E1A" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0A0E1A" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#4A6180" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2340" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f1a30" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#061225" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#0f1629" }] },
  ];

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={OSLO_REGION}
          provider={APP_MAP_PROVIDER}
          customMapStyle={darkMapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={{ latitude: 59.9139, longitude: 10.7522 }}
            title="Din posisjon"
          />
        </MapView>
        {/* Map overlay gradient */}
        <LinearGradient
          colors={["rgba(10,14,26,0.9)", "rgba(10,14,26,0.3)", "rgba(10,14,26,0.8)"]}
          style={styles.mapOverlay}
          pointerEvents="none"
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <KjappLogo color="#00A3FF" width={90} height={26} />
          <Pressable style={styles.settingsButton} onPress={handleSettingsPress}>
            <Ionicons name="settings-outline" size={22} color="#00A3FF" />
          </Pressable>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>
          Hei, {user?.name?.split(" ")[0] || "der"} 👋
        </Text>
        <Text style={styles.title}>Hvor skal du?</Text>

        {/* Booking Card */}
        <GlassCard style={styles.bookingCard}>
          {/* Pickup */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, styles.pickupDot]} />
            <View style={styles.locationInput}>
              <Text style={styles.locationLabel}>Hentested</Text>
              <TextInput
                style={styles.locationText}
                placeholder="Min posisjon"
                placeholderTextColor="#4A6180"
                value={pickup}
                onChangeText={setPickup}
              />
            </View>
            <Pressable style={styles.locationAction}>
              <Ionicons name="locate" size={18} color="#00A3FF" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Destination */}
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, styles.destDot]} />
            <View style={styles.locationInput}>
              <Text style={styles.locationLabel}>Destinasjon</Text>
              <TextInput
                style={styles.locationText}
                placeholder="Hvor skal du?"
                placeholderTextColor="#4A6180"
                value={destination}
                onChangeText={setDestination}
              />
            </View>
            <Pressable style={styles.locationAction}>
              <Ionicons name="search" size={18} color="#00A3FF" />
            </Pressable>
          </View>
        </GlassCard>

        {/* Quick Destinations */}
        <Text style={styles.sectionTitle}>Favoritter</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickDestinations}
        >
          {savedAddresses.map((addr) => (
            <Pressable
              key={addr.id}
              onPress={() => setDestination(addr.address)}
            >
              <GlassCard style={styles.quickCard} neonBorder={false}>
                <Ionicons
                  name={addr.label === "Hjem" ? "home" : "briefcase"}
                  size={20}
                  color="#00A3FF"
                />
                <Text style={styles.quickLabel}>{addr.label}</Text>
                <Text style={styles.quickAddress} numberOfLines={1}>
                  {addr.address}
                </Text>
              </GlassCard>
            </Pressable>
          ))}
          <Pressable onPress={() => router.push("/settings")}>
            <GlassCard style={styles.quickCard} neonBorder={false}>
              <Ionicons name="add-circle" size={20} color="#4A6180" />
              <Text style={styles.quickLabel}>Legg til</Text>
              <Text style={styles.quickAddress}>Ny adresse</Text>
            </GlassCard>
          </Pressable>
        </ScrollView>

        {/* AI Suggestion Card */}
        <Pressable onPress={() => router.push("/(tabs)/ai")}>
          <GlassCard style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <View style={styles.aiIconBadge}>
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.aiCardTitle}>KJAPP AI</Text>
            </View>
            <Text style={styles.aiCardText}>
              "Hei! Jeg kan hjelpe deg med å finne beste rute, estimere pris, eller bestille direkte. Trykk for å chatte!"
            </Text>
          </GlassCard>
        </Pressable>

        {/* Book Button */}
        <View style={styles.bookButtonContainer}>
          <NeonButton
            title="Bestill KJAPP"
            onPress={handleBooking}
            icon={<Ionicons name="car-sport" size={20} color="#FFFFFF" />}
          />
          <Text style={styles.footerText}>Trygt. Enkelt. Kjapt.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Dimensions.get("window").height * 0.45,
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  settingsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,163,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  greeting: {
    fontSize: 15,
    color: "#8BA3C7",
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 20,
  },
  bookingCard: {
    padding: 16,
    marginBottom: 24,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupDot: {
    backgroundColor: "#00A3FF",
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  destDot: {
    backgroundColor: "#FF4757",
    shadowColor: "#FF4757",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  locationInput: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    color: "#4A6180",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  locationAction: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(0,163,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,163,255,0.1)",
    marginLeft: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  quickDestinations: {
    marginBottom: 20,
  },
  quickCard: {
    width: 130,
    padding: 14,
    marginRight: 10,
    gap: 6,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  quickAddress: {
    fontSize: 11,
    color: "#4A6180",
  },
  aiCard: {
    padding: 16,
    marginBottom: 24,
    borderColor: "rgba(0,163,255,0.3)",
  },
  aiCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  aiIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00A3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  aiCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#00A3FF",
  },
  aiCardText: {
    fontSize: 14,
    color: "#8BA3C7",
    lineHeight: 20,
    fontStyle: "italic",
  },
  bookButtonContainer: {
    marginTop: 4,
  },
  footerText: {
    textAlign: "center",
    color: "#4A6180",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },
});
