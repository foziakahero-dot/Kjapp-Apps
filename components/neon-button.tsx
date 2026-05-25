import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends Omit<PressableProps, "children"> {
  title: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
  icon?: React.ReactNode;
}

export function NeonButton({
  title,
  variant = "primary",
  size = "lg",
  className,
  textClassName,
  icon,
  ...props
}: NeonButtonProps) {
  const heightMap = { sm: 42, md: 50, lg: 58 };
  const textSizeMap = { sm: 14, md: 15, lg: 17 };

  if (variant === "primary") {
    return (
      <Pressable {...props}>
        {({ pressed }) => (
          <View
            style={[
              styles.buttonShadow,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
            ]}
          >
            <LinearGradient
              colors={["#00BFFF", "#00A3FF", "#006DFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradient, { height: heightMap[size] }]}
            >
              {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: textSizeMap[size] },
                ]}
              >
                {title}
              </Text>
            </LinearGradient>
          </View>
        )}
      </Pressable>
    );
  }

  if (variant === "secondary") {
    return (
      <Pressable {...props}>
        {({ pressed }) => (
          <View
            style={[
              styles.secondaryButton,
              { height: heightMap[size], opacity: pressed ? 0.8 : 1 },
            ]}
          >
            {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
            <Text
              style={[styles.secondaryText, { fontSize: textSizeMap[size] }]}
            >
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    );
  }

  // Ghost variant
  return (
    <Pressable {...props}>
      {({ pressed }) => (
        <View
          style={[
            styles.ghostButton,
            { height: heightMap[size], opacity: pressed ? 0.7 : 1 },
          ]}
        >
          {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
          <Text style={[styles.ghostText, { fontSize: textSizeMap[size] }]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonShadow: {
    borderRadius: 18,
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  gradient: {
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  secondaryButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.3)",
    backgroundColor: "rgba(0,163,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  secondaryText: {
    color: "#00A3FF",
    fontWeight: "700",
  },
  ghostButton: {
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  ghostText: {
    color: "#8BA3C7",
    fontWeight: "600",
  },
});
