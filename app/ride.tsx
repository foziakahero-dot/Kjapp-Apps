import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useApp } from "@/lib/app-context";
import { getRideById, subscribeRide, updateRideStatus } from "@/lib/supabase/kjapp-api";
import { GlassCard } from "@/components/glass-card";
import { NeonButton } from "@/components/neon-button";
import { AppMapView as MapView, AppMarker as Marker, AppPolyline as Polyline, APP_MAP_PROVIDER } from "@/components/map-view";

const { width, height } = Dimensions.get("window");

type RideStep = "select" | "searching" | "matched" | "arriving" | "in_progress" | "completed";

interface RideType {
  id: string;
  name: string;
  price: number;
  eta: string;
  icon: string;
  description: string;
}

const RIDE_TYPES: RideType[] = [
  { id: "standard", name: "KJAPP", price: 129, eta: "3-5 min", icon: "car-sport", description: "Standard komfort" },
  { id: "xl", name: "KJAPP XL", price: 169, eta: "5-7 min", icon: "car", description: "Mer plass, 6 seter" },
  { id: "premium", name: "KJAPP Premium", price: 249, eta: "4-6 min", icon: "diamond", description: "Luksus opplevelse" },
];

// Mock route coordinates (Oslo center)
const ROUTE_COORDS = [
  { latitude: 59.9139, longitude: 10.7522 },
  { latitude: 59.9135, longitude: 10.7480 },
  { latitude: 59.9128, longitude: 10.7440 },
  { latitude: 59.9120, longitude: 10.7400 },
  { latitude: 59.9115, longitude: 10.7360 },
  { latitude: 59.9107, longitude: 10.7320 },
  { latitude: 59.9107, longitude: 10.7278 },
];

const DRIVER_INFO = {
  name: "Anders K.",
  rating: 4.9,
  car: "Tesla Model 3",
  plate: "EL 12345",
  eta: 3,
};

export default function RideScreen() {
  const params = useLocalSearchParams<{ pickup: string; destination: string }>();
  const { createRide, currentRide, setCurrentRide } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<RideStep>("select");
  const [selectedRide, setSelectedRide] = useState<string>("standard");
  const [driverEta, setDriverEta] = useState(DRIVER_INFO.eta);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0A0E1A" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0A0E1A" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#4A6180" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2340" }] },
    { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0f1a30" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#061225" }] },
  ];

  useEffect(() => {
    if (!currentRide?.id || step === "select" || step === "completed") return;

    const applyRide = (ride: typeof currentRide | null) => {
      if (!ride) return;
      setCurrentRide(ride);
      if (ride.status === "searching") setStep("searching");
      if (ride.status === "matched") setStep("matched");
      if (ride.status === "arriving") setStep("arriving");
      if (ride.status === "in_progress") setStep("in_progress");
      if (ride.status === "completed") setStep("completed");
      if (ride.status === "cancelled") router.replace("/(tabs)");
    };

    const unsubscribe = subscribeRide(currentRide.id, applyRide);
    const interval = setInterval(async () => {
      const latest = await getRideById(currentRide.id);
      applyRide(latest);
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [currentRide?.id, step]);

  // Pulse animation for searching
  useEffect(() => {
    if (step === "searching") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [step]);

  const handleConfirmRide = async () => {
    try {
      setSubmitting(true);
      const ride = await createRide({
        pickupAddress: params.pickup || "Min posisjon",
        destinationAddress: params.destination || "Destinasjon",
        pickupLat: ROUTE_COORDS[0].latitude,
        pickupLng: ROUTE_COORDS[0].longitude,
        destLat: ROUTE_COORDS[ROUTE_COORDS.length - 1].latitude,
        destLng: ROUTE_COORDS[ROUTE_COORDS.length - 1].longitude,
        estimatedPrice: selectedRideType.price,
        durationMinutes: 12,
        distanceKm: 3.2,
      });
      setCurrentRide(ride);
      setStep("searching");
    } catch (error) {
      Alert.alert("Kunne ikke bestille tur", error instanceof Error ? error.message : "Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Avbryt tur", "Er du sikker på at du vil avbryte?", [
      { text: "Nei", style: "cancel" },
      {
        text: "Ja, avbryt",
        style: "destructive",
        onPress: async () => {
          if (currentRide?.id) {
            try {
              await updateRideStatus(currentRide.id, "cancelled");
            } catch {}
          }
          setCurrentRide(null);
          router.back();
        },
      },
    ]);
  };

  const handleComplete = async () => {
    if (currentRide?.id) {
      try {
        await updateRideStatus(currentRide.id, "completed");
      } catch {}
    }
    setCurrentRide(null);
    router.replace("/(tabs)");
  };

  const selectedRideType = RIDE_TYPES.find((r) => r.id === selectedRide)!;

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 59.9123,
          longitude: 10.7400,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        provider={APP_MAP_PROVIDER}
        customMapStyle={darkMapStyle}
        showsUserLocation={true}
      >
        {/* Route line */}
        <Polyline
          coordinates={ROUTE_COORDS}
          strokeColor="#00A3FF"
          strokeWidth={4}
        />
        {/* Pickup marker */}
        <Marker coordinate={ROUTE_COORDS[0]} title="Hentested">
          <View style={styles.markerBlue}>
            <View style={styles.markerDot} />
          </View>
        </Marker>
        {/* Destination marker */}
        <Marker coordinate={ROUTE_COORDS[ROUTE_COORDS.length - 1]} title="Destinasjon">
          <View style={styles.markerRed}>
            <View style={styles.markerDotRed} />
          </View>
        </Marker>
        {/* Driver marker (when matched) */}
        {(step === "arriving" || step === "matched") && (
          <Marker
            coordinate={{ latitude: 59.9150, longitude: 10.7550 }}
            title="Sjåfør"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={16} color="#FFFFFF" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Overlay gradient */}
      <LinearGradient
        colors={["rgba(10,14,26,0.6)", "transparent", "rgba(10,14,26,0.95)"]}
        style={styles.mapOverlay}
        pointerEvents="none"
      />

      {/* Back button */}
      {step === "select" && (
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* STEP: Select ride type */}
        {step === "select" && (
          <>
            <Text style={styles.sheetTitle}>Velg din tur</Text>
            <View style={styles.routeSummary}>
              <View style={styles.routeSummaryRow}>
                <View style={styles.routeDotBlue} />
                <Text style={styles.routeSummaryText} numberOfLines={1}>
                  {params.pickup || "Min posisjon"}
                </Text>
              </View>
              <View style={styles.routeSummaryRow}>
                <View style={styles.routeDotRed} />
                <Text style={styles.routeSummaryText} numberOfLines={1}>
                  {params.destination || "Destinasjon"}
                </Text>
              </View>
            </View>

            {RIDE_TYPES.map((ride) => (
              <Pressable
                key={ride.id}
                onPress={() => setSelectedRide(ride.id)}
              >
                <GlassCard
                  style={[
                    styles.rideCard,
                    selectedRide === ride.id && styles.rideCardSelected,
                  ]}
                  neonBorder={selectedRide === ride.id}
                >
                  <View style={styles.rideCardLeft}>
                    <Ionicons
                      name={ride.icon as any}
                      size={24}
                      color={selectedRide === ride.id ? "#00A3FF" : "#4A6180"}
                    />
                    <View>
                      <Text style={styles.rideName}>{ride.name}</Text>
                      <Text style={styles.rideDesc}>{ride.description}</Text>
                    </View>
                  </View>
                  <View style={styles.rideCardRight}>
                    <Text style={styles.ridePrice}>{ride.price} kr</Text>
                    <Text style={styles.rideEta}>{ride.eta}</Text>
                  </View>
                </GlassCard>
              </Pressable>
            ))}

            <View style={styles.paymentRow}>
              <Ionicons name="card" size={18} color="#00A3FF" />
              <Text style={styles.paymentText}>Betaling aktiveres i pilot via Stripe/Vipps</Text>
              <Pressable>
                <Text style={styles.paymentChange}>Endre</Text>
              </Pressable>
            </View>

            <NeonButton title={submitting ? "Bestiller..." : "Bekreft tur"} onPress={handleConfirmRide} disabled={submitting} />
          </>
        )}

        {/* STEP: Searching */}
        {step === "searching" && (
          <View style={styles.searchingContainer}>
            <Animated.View
              style={[styles.searchingPulse, { transform: [{ scale: pulseAnim }] }]}
            >
              <Ionicons name="search" size={32} color="#00A3FF" />
            </Animated.View>
            <Text style={styles.searchingTitle}>Venter på sjåfør...</Text>
            <Text style={styles.searchingSubtitle}>
              Turen er sendt til godkjente sjåfører i Supabase
            </Text>
            <Pressable style={styles.cancelLink} onPress={handleCancel}>
              <Text style={styles.cancelLinkText}>Avbryt</Text>
            </Pressable>
          </View>
        )}

        {/* STEP: Matched / Arriving */}
        {(step === "matched" || step === "arriving") && (
          <>
            <View style={styles.driverHeader}>
              <Text style={styles.sheetTitle}>
                {step === "matched" ? "Sjåfør funnet!" : "Sjåføren er på vei"}
              </Text>
              <View style={styles.etaBadge}>
                <Text style={styles.etaBadgeText}>
                  {driverEta} min
                </Text>
              </View>
            </View>

            <GlassCard style={styles.driverCard}>
              <View style={styles.driverInfo}>
                <LinearGradient
                  colors={["#00A3FF", "#006DFF"]}
                  style={styles.driverAvatar}
                >
                  <Text style={styles.driverAvatarText}>
                    {DRIVER_INFO.name.charAt(0)}
                  </Text>
                </LinearGradient>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{DRIVER_INFO.name}</Text>
                  <View style={styles.driverRating}>
                    <Ionicons name="star" size={14} color="#FFB020" />
                    <Text style={styles.driverRatingText}>{DRIVER_INFO.rating}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.carInfo}>
                <Text style={styles.carName}>{DRIVER_INFO.car}</Text>
                <Text style={styles.carPlate}>{DRIVER_INFO.plate}</Text>
              </View>
            </GlassCard>

            <View style={styles.actionButtons}>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="chatbubble" size={20} color="#00A3FF" />
                <Text style={styles.actionBtnText}>Melding</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="call" size={20} color="#00A3FF" />
                <Text style={styles.actionBtnText}>Ring</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="share-social" size={20} color="#00A3FF" />
                <Text style={styles.actionBtnText}>Del tur</Text>
              </Pressable>
            </View>

            <Pressable style={styles.cancelLink} onPress={handleCancel}>
              <Text style={styles.cancelLinkText}>Avbryt tur</Text>
            </Pressable>
          </>
        )}

        {/* STEP: In Progress */}
        {step === "in_progress" && (
          <>
            <Text style={styles.sheetTitle}>Tur pågår</Text>
            <GlassCard style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Ionicons name="navigate" size={20} color="#00A3FF" />
                <Text style={styles.progressText}>
                  På vei til {params.destination || "destinasjon"}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressEta}>Ankomst om ca. 8 min</Text>
            </GlassCard>

            <GlassCard style={styles.safetyCard} neonBorder={false}>
              <Ionicons name="shield-checkmark" size={20} color="#00E68A" />
              <View style={styles.safetyContent}>
                <Text style={styles.safetyTitle}>Din trygghet er viktig</Text>
                <Text style={styles.safetyText}>
                  Turen overvåkes. Del reisen med noen du stoler på.
                </Text>
              </View>
            </GlassCard>

            <View style={styles.actionButtons}>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="chatbubble" size={20} color="#00A3FF" />
                <Text style={styles.actionBtnText}>Melding</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="call" size={20} color="#00A3FF" />
                <Text style={styles.actionBtnText}>Ring</Text>
              </Pressable>
              <Pressable style={styles.actionBtn}>
                <Ionicons name="share-social" size={20} color="#00A3FF" />
                <Text style={styles.actionBtnText}>Del tur</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* STEP: Completed */}
        {step === "completed" && (
          <View style={styles.completedContainer}>
            <View style={styles.completedIcon}>
              <Ionicons name="checkmark-circle" size={56} color="#00E68A" />
            </View>
            <Text style={styles.completedTitle}>Tur fullført!</Text>
            <Text style={styles.completedSubtitle}>
              Takk for at du kjørte med KJAPP
            </Text>

            <GlassCard style={styles.receiptCard}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Rute</Text>
                <Text style={styles.receiptValue}>
                  {params.pickup || "Min posisjon"} → {params.destination}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Type</Text>
                <Text style={styles.receiptValue}>{selectedRideType.name}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Sjåfør</Text>
                <Text style={styles.receiptValue}>{DRIVER_INFO.name}</Text>
              </View>
              <View style={[styles.receiptRow, styles.receiptTotal]}>
                <Text style={styles.receiptTotalLabel}>Total</Text>
                <Text style={styles.receiptTotalValue}>
                  {selectedRideType.price} kr
                </Text>
              </View>
            </GlassCard>

            {/* Rating */}
            <Text style={styles.rateLabel}>Vurder turen</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star}>
                  <Ionicons name="star" size={32} color="#FFB020" />
                </Pressable>
              ))}
            </View>

            <NeonButton title="Ferdig" onPress={handleComplete} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  backButton: {
    position: "absolute",
    top: 56,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(10,14,26,0.8)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  markerBlue: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,163,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00A3FF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  markerRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,71,87,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerDotRed: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF4757",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#00A3FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0A0E1A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: "rgba(0,163,255,0.15)",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  routeSummary: {
    marginBottom: 16,
    gap: 8,
  },
  routeSummaryRow: {
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
  routeSummaryText: {
    fontSize: 14,
    color: "#8BA3C7",
    fontWeight: "600",
  },
  rideCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 8,
  },
  rideCardSelected: {
    borderColor: "rgba(0,163,255,0.4)",
  },
  rideCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  rideName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  rideDesc: {
    fontSize: 12,
    color: "#4A6180",
    marginTop: 2,
  },
  rideCardRight: {
    alignItems: "flex-end",
  },
  ridePrice: {
    fontSize: 17,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  rideEta: {
    fontSize: 12,
    color: "#4A6180",
    marginTop: 2,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  paymentText: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  paymentChange: {
    fontSize: 13,
    color: "#00A3FF",
    fontWeight: "700",
  },
  searchingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  searchingPulse: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,163,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(0,163,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  searchingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  searchingSubtitle: {
    fontSize: 14,
    color: "#4A6180",
    marginBottom: 20,
  },
  cancelLink: {
    alignItems: "center",
    paddingVertical: 12,
  },
  cancelLinkText: {
    fontSize: 14,
    color: "#FF4757",
    fontWeight: "600",
  },
  driverHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  etaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0,163,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.3)",
  },
  etaBadgeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#00A3FF",
  },
  driverCard: {
    padding: 16,
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  driverAvatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  driverRatingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFB020",
  },
  carInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,163,255,0.08)",
  },
  carName: {
    fontSize: 14,
    color: "#8BA3C7",
    fontWeight: "600",
  },
  carPlate: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 1,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginVertical: 16,
  },
  actionBtn: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "rgba(0,163,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.15)",
  },
  actionBtnText: {
    fontSize: 11,
    color: "#8BA3C7",
    fontWeight: "600",
  },
  progressCard: {
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  progressText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,163,255,0.15)",
    marginBottom: 8,
  },
  progressFill: {
    width: "60%",
    height: "100%",
    borderRadius: 2,
    backgroundColor: "#00A3FF",
  },
  progressEta: {
    fontSize: 13,
    color: "#4A6180",
  },
  safetyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00E68A",
    marginBottom: 2,
  },
  safetyText: {
    fontSize: 12,
    color: "#4A6180",
    lineHeight: 18,
  },
  completedContainer: {
    alignItems: "center",
  },
  completedIcon: {
    marginBottom: 12,
    shadowColor: "#00E68A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  completedSubtitle: {
    fontSize: 14,
    color: "#4A6180",
    marginBottom: 20,
  },
  receiptCard: {
    width: "100%",
    padding: 16,
    marginBottom: 20,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  receiptLabel: {
    fontSize: 13,
    color: "#4A6180",
  },
  receiptValue: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  receiptTotal: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,163,255,0.1)",
    marginTop: 8,
    paddingTop: 12,
  },
  receiptTotalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  receiptTotalValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#00E68A",
  },
  rateLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  stars: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
});
