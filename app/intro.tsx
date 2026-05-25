import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  FlatList,
  StyleSheet,
  Animated,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useApp } from "@/lib/app-context";
import { KjappLogo } from "@/components/kjapp-logo";
import { NeonButton } from "@/components/neon-button";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: "1",
    icon: "car-sport" as const,
    title: "Din AI-drevne taxi",
    subtitle: "KJAPP bruker kunstig intelligens for å gi deg den smarteste og raskeste taxiopplevelsen i Norge.",
  },
  {
    id: "2",
    icon: "chatbubbles" as const,
    title: "Smart AI bestiller for deg",
    subtitle: "Bare si hvor du skal – vår AI finner beste rute, estimerer pris og bestiller på sekunder.",
  },
  {
    id: "3",
    icon: "shield-checkmark" as const,
    title: "Trygt. Enkelt. Kjapt.",
    subtitle: "Verifiserte sjåfører, sanntidssporing og sikker betaling. Alt du trenger i én app.",
  },
];

export default function IntroScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setIsOnboarded } = useApp();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    router.replace("/login");
  };

  const renderSlide = ({ item }: { item: (typeof slides)[0] }) => (
    <View style={[styles.slide, { width }]}>
      <View style={styles.iconContainer}>
        <View style={styles.iconGlow}>
          <Ionicons name={item.icon} size={64} color="#00A3FF" />
        </View>
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#0A0E1A", "#0F1629", "#0A0E1A"]}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <KjappLogo color="#00A3FF" width={100} height={28} />
        {currentIndex < slides.length - 1 && (
          <Pressable onPress={handleSkip}>
            <Text style={styles.skipText}>Hopp over</Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Bottom CTA */}
      <View style={styles.bottomContainer}>
        <NeonButton
          title={currentIndex === slides.length - 1 ? "Kom i gang" : "Neste"}
          onPress={handleNext}
        />
        <Text style={styles.footerText}>Trygt. Enkelt. Kjapt.</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  skipText: {
    color: "#8BA3C7",
    fontSize: 15,
    fontWeight: "600",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconGlow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0,163,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 10,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 16,
    color: "#8BA3C7",
    textAlign: "center",
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,163,255,0.2)",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: "#00A3FF",
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 50,
  },
  footerText: {
    textAlign: "center",
    color: "#4A6180",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 16,
  },
});
