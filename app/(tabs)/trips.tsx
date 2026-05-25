import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "@/components/glass-card";
import { getMyRides } from "@/lib/supabase/kjapp-api";
import type { RideRequest } from "@/lib/app-context";

type Trip = RideRequest & { requestedAt?: string };

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadTrips() {
      try {
        setLoading(true);
        const rides = await getMyRides();
        if (active) setTrips(rides);
      } catch (error) {
        console.error("Could not load trips", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadTrips();
    return () => {
      active = false;
    };
  }, []);

  const renderTrip = ({ item }: { item: Trip }) => (
    <GlassCard style={styles.tripCard} neonBorder={false}>
      <View style={styles.tripHeader}>
        <View style={styles.tripTypeContainer}>
          <Ionicons name="car-sport" size={16} color="#00A3FF" />
          <Text style={styles.tripType}>{item.rideType === "premium" ? "KJAPP Premium" : item.rideType === "xl" ? "KJAPP XL" : "KJAPP"}</Text>
        </View>
        <Text
          style={[
            styles.tripStatus,
            item.status === "cancelled" && styles.tripCancelled,
          ]}
        >
          {item.status === "completed" ? "Fullført" : item.status === "cancelled" ? "Kansellert" : "Pågår"}
        </Text>
      </View>

      <View style={styles.tripRoute}>
        <View style={styles.routePoint}>
          <View style={styles.routeDotBlue} />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={styles.routeDotRed} />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.destinationAddress}
          </Text>
        </View>
      </View>

      <View style={styles.tripFooter}>
        <Text style={styles.tripDate}>{item.requestedAt ? new Date(item.requestedAt).toLocaleString("nb-NO") : "Nylig"}</Text>
        <Text style={styles.tripPrice}>{Math.round(item.estimatedPrice)} kr</Text>
      </View>
    </GlassCard>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0E1A", "#0F1629"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mine turer</Text>
        <Text style={styles.headerSubtitle}>Din reisehistorikk</Text>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color="#4A6180" />
            <Text style={styles.emptyText}>{loading ? "Henter turer..." : "Ingen turer ennå"}</Text>
            <Text style={styles.emptySubtext}>
              Dine turer vil vises her etter din første tur
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#4A6180",
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tripCard: {
    padding: 16,
    marginBottom: 12,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  tripTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tripType: {
    fontSize: 13,
    fontWeight: "700",
    color: "#00A3FF",
  },
  tripStatus: {
    fontSize: 12,
    fontWeight: "600",
    color: "#00E68A",
  },
  tripCancelled: {
    color: "#FF4757",
  },
  tripRoute: {
    marginBottom: 14,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeDotBlue: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00A3FF",
  },
  routeDotRed: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF4757",
  },
  routeLine: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(0,163,255,0.2)",
    marginLeft: 4.5,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    flex: 1,
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,163,255,0.08)",
  },
  tripDate: {
    fontSize: 12,
    color: "#4A6180",
  },
  tripPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#4A6180",
    textAlign: "center",
  },
});
