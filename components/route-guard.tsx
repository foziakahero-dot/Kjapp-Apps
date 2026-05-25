import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router, usePathname } from "expo-router";
import { useApp } from "@/lib/app-context";

const PUBLIC_ROUTES = new Set(["/intro", "/login", "/oauth/callback"]);

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn, isOnboarded, isLoading } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!isOnboarded && pathname !== "/intro") {
      router.replace("/intro");
      return;
    }

    if (isOnboarded && !isLoggedIn && !PUBLIC_ROUTES.has(pathname)) {
      router.replace("/login");
      return;
    }

    if (isLoggedIn && user?.role === "driver" && user.driverStatus !== "approved" && pathname !== "/driver") {
      router.replace("/driver");
      return;
    }

    if (isLoggedIn && user?.role === "driver" && user.driverStatus === "approved" && pathname.startsWith("/(tabs)")) {
      router.replace("/driver");
      return;
    }

    if (isLoggedIn && user?.role === "customer" && (pathname === "/login" || pathname === "/intro")) {
      router.replace("/(tabs)");
    }
  }, [isLoading, isLoggedIn, isOnboarded, pathname, user?.driverStatus, user?.role]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#00A3FF" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0E1A",
  },
});
