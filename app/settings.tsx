import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useApp } from "@/lib/app-context";
import { GlassCard } from "@/components/glass-card";
import { NeonButton } from "@/components/neon-button";

type SettingsTab = "payment" | "addresses" | "preferences";

export default function SettingsScreen() {
  const { paymentMethods, setPaymentMethods, savedAddresses } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>("payment");
  const [showAddCard, setShowAddCard] = useState(false);

  const handleRemoveCard = (id: string) => {
    Alert.alert("Fjern kort", "Er du sikker på at du vil fjerne dette kortet?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Fjern",
        style: "destructive",
        onPress: () => {
          setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0A0E1A", "#0F1629"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Innstillinger</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: "payment" as const, label: "Betaling", icon: "card" as const },
          { key: "addresses" as const, label: "Adresser", icon: "location" as const },
          { key: "preferences" as const, label: "Preferanser", icon: "options" as const },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? "#00A3FF" : "#4A6180"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Tab */}
        {activeTab === "payment" && (
          <>
            <Text style={styles.sectionTitle}>Betalingsmetoder</Text>
            <Text style={styles.sectionSubtitle}>
              Administrer dine betalingskort og metoder
            </Text>

            {/* Existing Cards */}
            {paymentMethods.map((method) => (
              <GlassCard key={method.id} style={styles.cardItem}>
                <View style={styles.cardItemLeft}>
                  <View style={styles.cardIcon}>
                    <Ionicons
                      name={method.type === "card" ? "card" : "phone-portrait"}
                      size={20}
                      color="#00A3FF"
                    />
                  </View>
                  <View>
                    <Text style={styles.cardBrand}>
                      {method.brand || "Vipps"} •••• {method.last4}
                    </Text>
                    {method.isDefault && (
                      <Text style={styles.cardDefault}>Standard</Text>
                    )}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {!method.isDefault && (
                    <Pressable
                      style={styles.cardActionBtn}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={20} color="#00A3FF" />
                    </Pressable>
                  )}
                  <Pressable
                    style={styles.cardActionBtn}
                    onPress={() => handleRemoveCard(method.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF4757" />
                  </Pressable>
                </View>
              </GlassCard>
            ))}

            {/* Vipps Option */}
            <GlassCard style={styles.cardItem} neonBorder={false}>
              <View style={styles.cardItemLeft}>
                <View style={[styles.cardIcon, { backgroundColor: "rgba(255,90,0,0.1)" }]}>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: "#FF5A00" }}>V</Text>
                </View>
                <View>
                  <Text style={styles.cardBrand}>Vipps</Text>
                  <Text style={styles.cardSubtext}>Koble til Vipps-konto</Text>
                </View>
              </View>
              <Pressable style={styles.connectBtn}>
                <Text style={styles.connectBtnText}>Koble til</Text>
              </Pressable>
            </GlassCard>

            {/* Add Card Form */}
            {showAddCard ? (
              <GlassCard style={styles.addCardForm}>
                <Text style={styles.formTitle}>Betaling er sikret for pilot</Text>
                <Text style={styles.formSubtitle}>
                  KJAPP skal bruke Stripe PaymentSheet/Vipps. Rå kortnummer skal aldri skrives inn eller lagres direkte i appen.
                </Text>
                <View style={styles.stripeNote}>
                  <Ionicons name="lock-closed" size={14} color="#00E68A" />
                  <Text style={styles.stripeNoteText}>Klar for Stripe backend-integrasjon</Text>
                </View>
                <NeonButton title="OK" onPress={() => setShowAddCard(false)} size="md" />
              </GlassCard>
            ) : (
              <NeonButton
                title="Sett opp betaling"
                variant="secondary"
                onPress={() => setShowAddCard(true)}
                icon={<Ionicons name="add" size={20} color="#00A3FF" />}
              />
            )}
          </>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <>
            <Text style={styles.sectionTitle}>Lagrede adresser</Text>
            <Text style={styles.sectionSubtitle}>
              Dine favorittadresser for rask bestilling
            </Text>

            {savedAddresses.map((addr) => (
              <GlassCard key={addr.id} style={styles.addressItem}>
                <View style={styles.addressIcon}>
                  <Ionicons
                    name={addr.label === "Hjem" ? "home" : "briefcase"}
                    size={20}
                    color="#00A3FF"
                  />
                </View>
                <View style={styles.addressContent}>
                  <Text style={styles.addressLabel}>{addr.label}</Text>
                  <Text style={styles.addressText}>{addr.address}</Text>
                </View>
                <Pressable>
                  <Ionicons name="pencil" size={18} color="#4A6180" />
                </Pressable>
              </GlassCard>
            ))}

            <NeonButton
              title="Legg til adresse"
              variant="secondary"
              onPress={() => {}}
              icon={<Ionicons name="add" size={20} color="#00A3FF" />}
            />
          </>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <>
            <Text style={styles.sectionTitle}>Preferanser</Text>
            <Text style={styles.sectionSubtitle}>
              Tilpass din KJAPP-opplevelse
            </Text>

            <GlassCard style={styles.prefItem} neonBorder={false}>
              <Ionicons name="language" size={20} color="#00A3FF" />
              <View style={styles.prefContent}>
                <Text style={styles.prefTitle}>Språk</Text>
                <Text style={styles.prefValue}>Norsk (Bokmål)</Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.prefItem} neonBorder={false}>
              <Ionicons name="car" size={20} color="#00A3FF" />
              <View style={styles.prefContent}>
                <Text style={styles.prefTitle}>Foretrukket biltype</Text>
                <Text style={styles.prefValue}>KJAPP Standard</Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.prefItem} neonBorder={false}>
              <Ionicons name="notifications" size={20} color="#00A3FF" />
              <View style={styles.prefContent}>
                <Text style={styles.prefTitle}>Push-varsler</Text>
                <Text style={styles.prefValue}>Aktivert</Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.prefItem} neonBorder={false}>
              <Ionicons name="moon" size={20} color="#00A3FF" />
              <View style={styles.prefContent}>
                <Text style={styles.prefTitle}>Mørkt tema</Text>
                <Text style={styles.prefValue}>Alltid på</Text>
              </View>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabActive: {
    backgroundColor: "rgba(0,163,255,0.08)",
    borderColor: "rgba(0,163,255,0.2)",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A6180",
  },
  tabTextActive: {
    color: "#00A3FF",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#4A6180",
    marginBottom: 20,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 10,
  },
  cardItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,163,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBrand: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cardSubtext: {
    fontSize: 12,
    color: "#4A6180",
    marginTop: 2,
  },
  cardDefault: {
    fontSize: 11,
    color: "#00E68A",
    fontWeight: "600",
    marginTop: 2,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  cardActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  connectBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "rgba(255,90,0,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,90,0,0.3)",
  },
  connectBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF5A00",
  },
  addCardForm: {
    padding: 20,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: "#4A6180",
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8BA3C7",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldInput: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.15)",
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 15,
  },
  stripeNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
    paddingVertical: 8,
  },
  stripeNoteText: {
    fontSize: 12,
    color: "#00E68A",
    fontWeight: "600",
  },
  cancelBtn: {
    alignItems: "center",
    marginTop: 12,
  },
  cancelBtnText: {
    fontSize: 14,
    color: "#4A6180",
    fontWeight: "600",
  },
  addressItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,163,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  addressContent: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addressText: {
    fontSize: 13,
    color: "#4A6180",
    marginTop: 2,
  },
  prefItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  prefContent: {
    flex: 1,
  },
  prefTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  prefValue: {
    fontSize: 13,
    color: "#4A6180",
    marginTop: 2,
  },
});
