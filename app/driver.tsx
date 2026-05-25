import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { type RideRequest, useApp } from "@/lib/app-context";
import { KjappLogo } from "@/components/kjapp-logo";
import { GlassCard } from "@/components/glass-card";
import { NeonButton } from "@/components/neon-button";
import { getDriverAIResponse } from "@/lib/ai-service";
import { acceptRide, getOpenRideRequests, updateRideStatus } from "@/lib/supabase/kjapp-api";
import { AppMapView as MapView, AppMarker as Marker, APP_MAP_PROVIDER } from "@/components/map-view";

const { width } = Dimensions.get("window");

const OSLO_REGION = {
  latitude: 59.9139,
  longitude: 10.7522,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export default function DriverScreen() {
  const { user, driverOnline, setDriverOnline, logout } = useApp();
  const [aiTip, setAiTip] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showRequests, setShowRequests] = useState(true);
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);

  useEffect(() => {
    if (!driverOnline) return;
    let active = true;
    async function loadRequests() {
      try {
        setRequestsLoading(true);
        const requests = await getOpenRideRequests();
        if (active) setRideRequests(requests);
      } catch (error) {
        console.error("Could not fetch ride requests", error);
      } finally {
        if (active) setRequestsLoading(false);
      }
    }
    loadRequests();
    const interval = setInterval(loadRequests, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [driverOnline]);

  // Check if driver is approved
  if (user?.driverStatus === "pending") {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#0A0E1A", "#0F1629"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.pendingContainer}>
          <View style={styles.pendingIcon}>
            <Ionicons name="time" size={64} color="#FFB020" />
          </View>
          <Text style={styles.pendingTitle}>Venter på godkjenning</Text>
          <Text style={styles.pendingText}>
            Din sjåfør-konto er under behandling. Du vil motta en
            godkjenningskode fra din flåteeier eller administrator når kontoen
            din er aktivert.
          </Text>
          <GlassCard style={styles.pendingInfoCard}>
            <Ionicons name="information-circle" size={20} color="#00A3FF" />
            <Text style={styles.pendingInfoText}>
              Kontakt din flåteeier for å få godkjenningskoden. Denne er
              nødvendig for å aktivere sjåfør-tilgangen.
            </Text>
          </GlassCard>
          <NeonButton
            title="Tilbake til innlogging"
            variant="secondary"
            onPress={() => {
              logout();
              router.replace("/login");
            }}
          />
        </View>
      </View>
    );
  }

  const handleGetAITip = async () => {
    setAiLoading(true);
    try {
      const response = await getDriverAIResponse(
        "Gi meg tips for å tjene mer akkurat nå. Hva er trafikksituasjonen?"
      );
      setAiTip(response);
    } catch {
      setAiTip("Kunne ikke hente AI-tips akkurat nå. Prøv igjen.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleDriverOnlineChange = async (online: boolean) => {
    try {
      await setDriverOnline(online);
    } catch (error) {
      Alert.alert("Kan ikke endre status", error instanceof Error ? error.message : "Prøv igjen.");
    }
  };

  const handleAcceptRide = async (requestId: string) => {
    try {
      await acceptRide(requestId);
      setActiveRideId(requestId);
      setRideRequests((requests) => requests.filter((request) => request.id !== requestId));
      Alert.alert("Tur akseptert! 🚗", "Turen er koblet til deg i Supabase. Oppdater status under Aktiv tur.", [
        { text: "OK" },
      ]);
    } catch (error) {
      Alert.alert("Kunne ikke akseptere", error instanceof Error ? error.message : "Prøv igjen.");
    }
  };

  const handleDeclineRide = (requestId: string) => {
    setRideRequests((requests) => requests.filter((request) => request.id !== requestId));
    setShowRequests(false);
    setTimeout(() => setShowRequests(true), 1000);
  };

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#0A0E1A" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#0A0E1A" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#4A6180" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2340" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#061225" }] },
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
          <View style={styles.headerLeft}>
            <KjappLogo color="#00A3FF" width={80} height={22} />
            <View style={styles.driverBadge}>
              <Text style={styles.driverBadgeText}>SJÅFØR</Text>
            </View>
          </View>
          <Pressable
            style={styles.profileBtn}
            onPress={() => {
              logout();
              router.replace("/login");
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4757" />
          </Pressable>
        </View>

        {/* Online Toggle */}
        <GlassCard style={styles.onlineCard}>
          <View style={styles.onlineRow}>
            <View>
              <Text style={styles.onlineTitle}>
                {driverOnline ? "Du er online" : "Du er offline"}
              </Text>
              <Text style={styles.onlineSubtitle}>
                {driverOnline
                  ? "Mottar turforespørsler"
                  : "Slå på for å motta turer"}
              </Text>
            </View>
            <Switch
              value={driverOnline}
              onValueChange={handleDriverOnlineChange}
              trackColor={{ false: "#1a2340", true: "rgba(0,163,255,0.3)" }}
              thumbColor={driverOnline ? "#00A3FF" : "#4A6180"}
            />
          </View>
          {driverOnline && (
            <View style={styles.statusDot}>
              <View style={styles.statusDotInner} />
            </View>
          )}
        </GlassCard>

        {/* Map */}
        <GlassCard style={styles.mapCard} neonBorder={false}>
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
        </GlassCard>

        {/* Earnings */}
        <GlassCard style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Dagens inntekt</Text>
          <Text style={styles.earningsAmount}>1 247 kr</Text>
          <View style={styles.earningsStats}>
            <View style={styles.earningsStat}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>Turer</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsStat}>
              <Text style={styles.statValue}>4.2t</Text>
              <Text style={styles.statLabel}>Online</Text>
            </View>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsStat}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </GlassCard>


        {activeRideId && (
          <GlassCard style={styles.activeRideCard}>
            <Text style={styles.activeRideTitle}>Aktiv tur</Text>
            <Text style={styles.activeRideText}>Oppdater turstatus så kunden ser ekte fremdrift i appen.</Text>
            <View style={styles.activeRideActions}>
              <Pressable style={styles.statusActionBtn} onPress={() => updateRideStatus(activeRideId, "driver_arriving")}>
                <Text style={styles.statusActionText}>På vei</Text>
              </Pressable>
              <Pressable style={styles.statusActionBtn} onPress={() => updateRideStatus(activeRideId, "arrived")}>
                <Text style={styles.statusActionText}>Ankommet</Text>
              </Pressable>
              <Pressable style={styles.statusActionBtn} onPress={() => updateRideStatus(activeRideId, "in_progress")}>
                <Text style={styles.statusActionText}>Start</Text>
              </Pressable>
              <Pressable
                style={[styles.statusActionBtn, styles.completeActionBtn]}
                onPress={async () => {
                  await updateRideStatus(activeRideId, "completed");
                  setActiveRideId(null);
                  await setDriverOnline(true);
                }}
              >
                <Text style={styles.statusActionText}>Fullfør</Text>
              </Pressable>
            </View>
          </GlassCard>
        )}
        {/* Ride Requests */}
        {driverOnline && showRequests && (
          <>
            <Text style={styles.sectionTitle}>{requestsLoading ? "Henter turforespørsler..." : "Turforespørsler"}</Text>
            {rideRequests.length === 0 && !requestsLoading && (
              <GlassCard style={styles.requestCard}>
                <Text style={styles.routeText}>Ingen åpne turer akkurat nå. Appen sjekker Supabase fortløpende.</Text>
              </GlassCard>
            )}
            {rideRequests.map((req) => (
              <GlassCard key={req.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestCustomer}>
                    <View style={styles.customerAvatar}>
                      <Text style={styles.customerAvatarText}>
                        K
                      </Text>
                    </View>
                    <Text style={styles.customerName}>KJAPP-kunde</Text>
                  </View>
                  <Text style={styles.requestEarning}>{Math.round(req.estimatedPrice * 0.85)} kr</Text>
                </View>

                <View style={styles.requestRoute}>
                  <View style={styles.routePoint}>
                    <View style={styles.routeDotBlue} />
                    <Text style={styles.routeText}>{req.pickupAddress}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoint}>
                    <View style={styles.routeDotRed} />
                    <Text style={styles.routeText}>{req.destinationAddress}</Text>
                  </View>
                </View>

                <View style={styles.requestMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="navigate" size={14} color="#4A6180" />
                    <Text style={styles.metaText}>ca. 3.2 km</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time" size={14} color="#4A6180" />
                    <Text style={styles.metaText}>ny forespørsel</Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <Pressable
                    style={styles.declineBtn}
                    onPress={() => handleDeclineRide(req.id)}
                  >
                    <Ionicons name="close" size={20} color="#FF4757" />
                    <Text style={styles.declineBtnText}>Avslå</Text>
                  </Pressable>
                  <Pressable
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptRide(req.id)}
                  >
                    <LinearGradient
                      colors={["#00BFFF", "#006DFF"]}
                      style={styles.acceptBtnGradient}
                    >
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      <Text style={styles.acceptBtnText}>Aksepter</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </GlassCard>
            ))}
          </>
        )}

        {/* AI Assistant */}
        <Text style={styles.sectionTitle}>AI-assistent</Text>
        <GlassCard style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.aiTitle}>KJAPP AI for sjåfører</Text>
          </View>

          {aiTip && (
            <View style={styles.aiResponse}>
              <Text style={styles.aiResponseText}>{aiTip}</Text>
            </View>
          )}

          <NeonButton
            title={aiLoading ? "Henter tips..." : "Få AI-tips nå"}
            variant="secondary"
            size="md"
            onPress={handleGetAITip}
            disabled={aiLoading}
            icon={<Ionicons name="sparkles" size={16} color="#00A3FF" />}
          />
        </GlassCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  activeRideCard: {
    padding: 16,
    marginBottom: 16,
  },
  activeRideTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  activeRideText: {
    color: "#8BA3C7",
    fontSize: 13,
    marginBottom: 14,
  },
  activeRideActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,163,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.22)",
  },
  completeActionBtn: {
    backgroundColor: "rgba(0,230,138,0.12)",
    borderColor: "rgba(0,230,138,0.28)",
  },
  statusActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  driverBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,230,138,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,230,138,0.3)",
  },
  driverBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#00E68A",
    letterSpacing: 1,
  },
  profileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,71,87,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  pendingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  pendingIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,176,32,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,176,32,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  pendingTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  pendingText: {
    fontSize: 15,
    color: "#8BA3C7",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  pendingInfoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 10,
    marginBottom: 24,
  },
  pendingInfoText: {
    flex: 1,
    fontSize: 13,
    color: "#8BA3C7",
    lineHeight: 20,
  },
  onlineCard: {
    padding: 18,
    marginBottom: 16,
  },
  onlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  onlineTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  onlineSubtitle: {
    fontSize: 13,
    color: "#4A6180",
    marginTop: 2,
  },
  statusDot: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  statusDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00E68A",
    shadowColor: "#00E68A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  mapCard: {
    overflow: "hidden",
    padding: 0,
    marginBottom: 16,
    height: 180,
    borderRadius: 20,
  },
  map: {
    flex: 1,
    borderRadius: 20,
  },
  earningsCard: {
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  earningsLabel: {
    fontSize: 13,
    color: "#4A6180",
    fontWeight: "600",
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: "#00E68A",
    letterSpacing: -1,
    marginBottom: 16,
    shadowColor: "#00E68A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  earningsStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  earningsStat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 11,
    color: "#4A6180",
    marginTop: 2,
  },
  earningsDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(0,163,255,0.1)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  requestCard: {
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  requestCustomer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  customerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,163,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  customerAvatarText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#00A3FF",
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  requestEarning: {
    fontSize: 18,
    fontWeight: "900",
    color: "#00E68A",
  },
  requestRoute: {
    marginBottom: 12,
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
    height: 14,
    backgroundColor: "rgba(0,163,255,0.2)",
    marginLeft: 4.5,
    marginVertical: 2,
  },
  routeText: {
    fontSize: 14,
    color: "#E0E8F0",
    fontWeight: "600",
  },
  requestMeta: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,163,255,0.08)",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#4A6180",
    fontWeight: "600",
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,71,87,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,71,87,0.2)",
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF4757",
  },
  acceptBtn: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  acceptBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 44,
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  aiCard: {
    padding: 18,
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  aiIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#00A3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#00A3FF",
  },
  aiResponse: {
    backgroundColor: "rgba(0,163,255,0.06)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.1)",
  },
  aiResponseText: {
    fontSize: 14,
    color: "#E0E8F0",
    lineHeight: 20,
  },
});
