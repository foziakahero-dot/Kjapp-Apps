import React from "react";
import { View, type ViewProps, StyleSheet } from "react-native";
import { cn } from "@/lib/utils";

interface GlassCardProps extends ViewProps {
  className?: string;
  neonBorder?: boolean;
  children: React.ReactNode;
}

export function GlassCard({
  className,
  neonBorder = true,
  children,
  style,
  ...props
}: GlassCardProps) {
  return (
    <View
      style={[styles.card, neonBorder && styles.neonBorder, style]}
      className={cn("rounded-2xl p-4", className)}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(0,163,255,0.15)",
    shadowColor: "#00A3FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  neonBorder: {
    borderColor: "rgba(0,163,255,0.25)",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
});
