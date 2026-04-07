// Web shim for react-native-maps
// Maps are not supported on web, this provides no-op replacements
import React from "react";
import { View } from "react-native";

export function MapView({ children, style, ...rest }) {
  return (
    <View
      style={[
        { backgroundColor: "#1a1a2e", alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export const Marker = ({ children }) => children || null;
export const Polyline = () => null;
export const Circle = () => null;
export const Polygon = () => null;
export const Callout = ({ children }) => children || null;
export const PROVIDER_DEFAULT = null;
export const PROVIDER_GOOGLE = "google";

export default MapView;
