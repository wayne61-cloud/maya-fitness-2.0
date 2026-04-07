// Web shim for react-native-webview
import React from "react";
import { View } from "react-native";

export function WebView({ source, style }) {
  const uri = source?.uri || "";
  return (
    <View style={[{ flex: 1, overflow: "hidden" }, style]}>
      <iframe
        src={uri}
        style={{ width: "100%", height: "100%", border: "none" }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="video"
      />
    </View>
  );
}

export default WebView;
