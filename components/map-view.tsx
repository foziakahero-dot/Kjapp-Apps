import React from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MapViewWrapperProps {
  style?: any;
  children?: React.ReactNode;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  customMapStyle?: any[];
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  provider?: any;
}

interface MarkerWrapperProps {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  children?: React.ReactNode;
}

interface PolylineWrapperProps {
  coordinates: { latitude: number; longitude: number }[];
  strokeColor?: string;
  strokeWidth?: number;
}

// Web fallback map component
function WebMapView({ style, initialRegion }: MapViewWrapperProps) {
  return (
    <View style={[style, webStyles.container]}>
      <View style={webStyles.mapPlaceholder}>
        <Ionicons name="map" size={48} color="#00A3FF" />
        <Text style={webStyles.mapText}>Kart</Text>
        <Text style={webStyles.mapSubtext}>
          {initialRegion
            ? `${initialRegion.latitude.toFixed(4)}, ${initialRegion.longitude.toFixed(4)}`
            : "Oslo, Norge"}
        </Text>
        {/* Decorative grid lines */}
        <View style={webStyles.gridOverlay}>
          {[...Array(5)].map((_, i) => (
            <View key={`h${i}`} style={[webStyles.gridLineH, { top: `${(i + 1) * 16.6}%` }]} />
          ))}
          {[...Array(5)].map((_, i) => (
            <View key={`v${i}`} style={[webStyles.gridLineV, { left: `${(i + 1) * 16.6}%` }]} />
          ))}
        </View>
        {/* Decorative road lines */}
        <View style={webStyles.roadH} />
        <View style={webStyles.roadV} />
      </View>
    </View>
  );
}

function WebMarker(_props: MarkerWrapperProps) {
  return null;
}

function WebPolyline(_props: PolylineWrapperProps) {
  return null;
}

const webStyles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#0A0E1A",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  mapText: {
    color: "#00A3FF",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },
  mapSubtext: {
    color: "#4A6180",
    fontSize: 12,
    marginTop: 4,
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,163,255,0.05)",
  },
  gridLineV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(0,163,255,0.05)",
  },
  roadH: {
    position: "absolute",
    left: "10%",
    right: "20%",
    top: "45%",
    height: 3,
    backgroundColor: "rgba(0,163,255,0.12)",
    borderRadius: 2,
  },
  roadV: {
    position: "absolute",
    top: "20%",
    bottom: "30%",
    left: "55%",
    width: 3,
    backgroundColor: "rgba(0,163,255,0.12)",
    borderRadius: 2,
  },
});

// Export the appropriate component based on platform
let MapViewComponent: React.ComponentType<MapViewWrapperProps>;
let MarkerComponent: React.ComponentType<MarkerWrapperProps>;
let PolylineComponent: React.ComponentType<PolylineWrapperProps>;

if (Platform.OS === "web") {
  MapViewComponent = WebMapView;
  MarkerComponent = WebMarker;
  PolylineComponent = WebPolyline;
} else {
  // Native: use react-native-maps
  const Maps = require("react-native-maps");
  MapViewComponent = Maps.default;
  MarkerComponent = Maps.Marker;
  PolylineComponent = Maps.Polyline;
}

export const AppMapView = MapViewComponent;
export const AppMarker = MarkerComponent;
export const AppPolyline = PolylineComponent;
export const APP_MAP_PROVIDER = Platform.OS === "web" ? undefined : (require("react-native-maps").PROVIDER_DEFAULT);
