import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useApp } from "@/lib/app-context";
import { redeemDriverInvite } from "@/lib/supabase/kjapp-api";
import { KjappLogo } from "@/components/kjapp-logo";
import { GlassCard } from "@/components/glass-card";
import { NeonButton } from "@/components/neon-button";
import { Ionicons } from "@expo/vector-icons";

type Step = "phone" | "verify" | "name" | "driver_pending";

export default function LoginScreen() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isDriver, setIsDriver] = useState(false);
  const [driverCode, setDriverCode] = useState("");
  const { sendLoginCode, verifyLoginCode, completeUserProfile, refreshUser } = useApp();
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async () => {
    if (phone.replace(/\D/g, "").length < 8) {
      Alert.alert("Ugyldig nummer", "Vennligst skriv inn et gyldig norsk mobilnummer.");
      return;
    }
    try {
      setSubmitting(true);
      await sendLoginCode(phone);
      setStep("verify");
    } catch (error) {
      Alert.alert("Kunne ikke sende SMS", error instanceof Error ? error.message : "Prøv igjen om litt.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length < 6) {
      Alert.alert("Ugyldig kode", "Vennligst skriv inn den 6-sifrede koden.");
      return;
    }
    try {
      setSubmitting(true);
      await verifyLoginCode(phone, code);
      setStep("name");
    } catch (error) {
      Alert.alert("Feil kode", error instanceof Error ? error.message : "Koden kunne ikke bekreftes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (name.trim().length < 2) {
      Alert.alert("Navn påkrevd", "Vennligst skriv inn ditt fulle navn.");
      return;
    }

    try {
      setSubmitting(true);
      const profile = await completeUserProfile(name.trim(), phone, isDriver ? "driver" : "customer");
      if (profile?.role === "driver") {
        setStep("driver_pending");
        return;
      }
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Kunne ikke fullføre", error instanceof Error ? error.message : "Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDriverAccess = async () => {
    if (driverCode.trim().length < 6) {
      Alert.alert("Kode mangler", "Skriv inn godkjenningskoden fra pilotansvarlig.");
      return;
    }
    try {
      setSubmitting(true);
      await redeemDriverInvite(driverCode);
      const profile = await refreshUser();
      if (profile?.driverStatus === "approved") {
        router.replace("/driver");
        return;
      }
      Alert.alert("Sendt", "Koden ble registrert. Oppdater appen hvis status ikke endres.");
    } catch (error) {
      Alert.alert("Kunne ikke aktivere", error instanceof Error ? error.message : "Kontroller koden og prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0A0E1A", "#0F1629", "#0A0E1A"]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <KjappLogo color="#00A3FF" width={120} height={34} />
            <Text style={styles.headerSubtitle}>
              {step === "driver_pending"
                ? "Sjåfør-tilgang"
                : "Logg inn eller registrer deg"}
            </Text>
          </View>

          {/* Phone Step */}
          {step === "phone" && (
            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Mobilnummer</Text>
              <Text style={styles.cardSubtitle}>
                Vi sender deg en verifiseringskode via SMS
              </Text>

              <View style={styles.phoneInputContainer}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>🇳🇴 +47</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="XXX XX XXX"
                  placeholderTextColor="#4A6180"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={8}
                />
              </View>

              <NeonButton title={submitting ? "Sender..." : "Send kode"} onPress={handleSendCode} disabled={submitting} />

              <Pressable
                style={styles.driverToggle}
                onPress={() => setIsDriver(!isDriver)}
              >
                <Ionicons
                  name={isDriver ? "checkbox" : "square-outline"}
                  size={22}
                  color={isDriver ? "#00A3FF" : "#4A6180"}
                />
                <Text style={styles.driverToggleText}>
                  Jeg er sjåfør
                </Text>
              </Pressable>

              {isDriver && (
                <View style={styles.driverNote}>
                  <Ionicons name="information-circle" size={18} color="#FFB020" />
                  <Text style={styles.driverNoteText}>
                    Sjåfører trenger godkjenning fra flåteeier eller administrator for å få tilgang.
                  </Text>
                </View>
              )}
            </GlassCard>
          )}

          {/* Verify Step */}
          {step === "verify" && (
            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Verifisering</Text>
              <Text style={styles.cardSubtitle}>
                Skriv inn koden sendt til +47 {phone}
              </Text>

              <TextInput
                style={styles.codeInput}
                placeholder="• • • • • •"
                placeholderTextColor="#4A6180"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                maxLength={6}
                textAlign="center"
              />

              <NeonButton title={submitting ? "Bekrefter..." : "Bekreft"} onPress={handleVerifyCode} disabled={submitting} />

              <Pressable style={styles.resendContainer}>
                <Text style={styles.resendText}>
                  Ikke mottatt kode?{" "}
                  <Text style={styles.resendLink}>Send på nytt</Text>
                </Text>
              </Pressable>
            </GlassCard>
          )}

          {/* Name Step */}
          {step === "name" && (
            <GlassCard style={styles.card}>
              <Text style={styles.cardTitle}>Hva heter du?</Text>
              <Text style={styles.cardSubtitle}>
                {isDriver
                  ? "Ditt navn som sjåfør"
                  : "Ditt navn vises for sjåføren"}
              </Text>

              <TextInput
                style={styles.nameInput}
                placeholder="Fullt navn"
                placeholderTextColor="#4A6180"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <NeonButton
                title={isDriver ? "Søk om tilgang" : "Fullfør registrering"}
                onPress={handleComplete}
                disabled={submitting}
              />
            </GlassCard>
          )}

          {/* Driver Pending Step */}
          {step === "driver_pending" && (
            <GlassCard style={styles.card}>
              <View style={styles.pendingIcon}>
                <Ionicons name="time" size={48} color="#FFB020" />
              </View>
              <Text style={styles.cardTitle}>Venter på godkjenning</Text>
              <Text style={styles.cardSubtitle}>
                Din sjåfør-konto må godkjennes av en flåteeier eller administrator.
                Har du mottatt en godkjenningskode?
              </Text>

              <TextInput
                style={styles.codeInput}
                placeholder="Godkjenningskode"
                placeholderTextColor="#4A6180"
                value={driverCode}
                onChangeText={setDriverCode}
                autoCapitalize="characters"
                textAlign="center"
              />

              <NeonButton title={submitting ? "Aktiverer..." : "Aktiver sjåfør-tilgang"} onPress={handleDriverAccess} disabled={submitting} />

              <Pressable
                style={styles.switchRole}
                onPress={() => {
                  setIsDriver(false);
                  setStep("phone");
                }}
              >
                <Text style={styles.switchRoleText}>
                  Registrer som kunde i stedet
                </Text>
              </Pressable>
            </GlassCard>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerSubtitle: {
    color: "#8BA3C7",
    fontSize: 15,
    marginTop: 12,
  },
  card: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#8BA3C7",
    marginBottom: 24,
    lineHeight: 20,
  },
  phoneInputContainer: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 10,
  },
  countryCode: {
    height: 54,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(0,163,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.2)",
    justifyContent: "center",
  },
  countryCodeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.15)",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },
  codeInput: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.15)",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 8,
    marginBottom: 24,
  },
  nameInput: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.15)",
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
  },
  resendContainer: {
    marginTop: 16,
    alignItems: "center",
  },
  resendText: {
    color: "#8BA3C7",
    fontSize: 14,
  },
  resendLink: {
    color: "#00A3FF",
    fontWeight: "700",
  },
  driverToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 10,
  },
  driverToggleText: {
    color: "#8BA3C7",
    fontSize: 14,
    fontWeight: "600",
  },
  driverNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,176,32,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,176,32,0.2)",
    gap: 8,
  },
  driverNoteText: {
    flex: 1,
    color: "#FFB020",
    fontSize: 12,
    lineHeight: 18,
  },
  pendingIcon: {
    alignItems: "center",
    marginBottom: 16,
  },
  switchRole: {
    marginTop: 20,
    alignItems: "center",
  },
  switchRoleText: {
    color: "#00A3FF",
    fontSize: 14,
    fontWeight: "600",
  },
});
