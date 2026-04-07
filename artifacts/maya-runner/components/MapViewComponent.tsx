/**
 * Cross-platform MapView wrapper.
 * - Native (iOS/Android): uses react-native-maps (full GPS support)
 * - Web: uses a WebView with a Leaflet map via HTML injection
 */
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";

type Coord = { latitude: number; longitude: number };

export interface MapViewRef {
  animateCamera: (opts: { center?: Coord; zoom?: number; heading?: number; pitch?: number }, config?: { duration?: number }) => void;
  fitToCoordinates?: (coords: Coord[], opts?: { edgePadding?: { top: number; right: number; bottom: number; left: number }; animated?: boolean }) => void;
}

export interface MapViewComponentProps {
  style?: any;
  initialRegion?: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
  showsCompass?: boolean;
  showsMyLocationButton?: boolean;
  userInterfaceStyle?: string;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  children?: React.ReactNode;
  onPanDrag?: () => void;
  onPress?: (e: any) => void;
  // Extended props for web
  traceCoords?: Coord[];
  plannedCoords?: Coord[];
  userPosition?: Coord | null;
  heading?: number;
}

// ============================
// WEB IMPLEMENTATION (Leaflet)
// ============================
function LeafletMap({
  style,
  initialRegion,
  traceCoords = [],
  plannedCoords = [],
  userPosition,
  heading = 0,
  scrollEnabled = true,
  zoomEnabled = true,
  onPress,
}: MapViewComponentProps, ref: React.Ref<MapViewRef>) {
  const iframeRef = useRef<any>(null);

  const lat = initialRegion?.latitude ?? userPosition?.latitude ?? 48.8566;
  const lng = initialRegion?.longitude ?? userPosition?.longitude ?? 2.3522;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body, html, #map { width: 100%; height: 100%; background: #1a1a2e; }
  .leaflet-container { background: #1a1a2e; }
  .user-dot {
    width: 18px; height: 18px;
    background: #E8335A;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(232,51,90,0.3);
    transition: all 0.3s ease;
  }
</style>
</head>
<body>
<div id="map"></div>
<script>
  var map = L.map('map', {
    center: [${lat}, ${lng}],
    zoom: 16,
    zoomControl: ${zoomEnabled},
    attributionControl: false,
    dragging: ${scrollEnabled},
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
  }).addTo(map);

  var userMarker = null;
  var tracePolyline = L.polyline([], { color: '#00E676', weight: 5, lineCap: 'round', lineJoin: 'round' }).addTo(map);
  var plannedPolyline = L.polyline([], { color: '#4FC3F7', weight: 3, dashArray: '8, 6' }).addTo(map);

  function updateUserMarker(lat, lng) {
    if (!userMarker) {
      var icon = L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] });
      userMarker = L.marker([lat, lng], { icon: icon }).addTo(map);
    } else {
      userMarker.setLatLng([lat, lng]);
    }
  }

  function updateTrace(coords) {
    tracePolyline.setLatLngs(coords.map(function(c) { return [c.latitude, c.longitude]; }));
  }

  function updatePlanned(coords) {
    plannedPolyline.setLatLngs(coords.map(function(c) { return [c.latitude, c.longitude]; }));
  }

  function flyTo(lat, lng, zoom) {
    map.flyTo([lat, lng], zoom || 17, { duration: 0.6 });
  }

  map.on('click', function(e) {
    window.parent.postMessage(JSON.stringify({ type: 'mapPress', lat: e.latlng.lat, lng: e.latlng.lng }), '*');
  });

  window.addEventListener('message', function(e) {
    try {
      var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg.type === 'updatePosition') updateUserMarker(msg.lat, msg.lng);
      if (msg.type === 'updateTrace') updateTrace(msg.coords);
      if (msg.type === 'updatePlanned') updatePlanned(msg.coords);
      if (msg.type === 'flyTo') flyTo(msg.lat, msg.lng, msg.zoom);
    } catch(err) {}
  });

  // Initial position
  updateUserMarker(${lat}, ${lng});
</script>
</body>
</html>`;

  function postMsg(data: object) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(data), "*");
  }

  useEffect(() => {
    if (userPosition) {
      postMsg({ type: "updatePosition", lat: userPosition.latitude, lng: userPosition.longitude });
    }
  }, [userPosition]);

  useEffect(() => {
    postMsg({ type: "updateTrace", coords: traceCoords });
  }, [traceCoords]);

  useEffect(() => {
    postMsg({ type: "updatePlanned", coords: plannedCoords });
  }, [plannedCoords]);

  useImperativeHandle(ref, () => ({
    animateCamera: ({ center, zoom }) => {
      if (center) postMsg({ type: "flyTo", lat: center.latitude, lng: center.longitude, zoom: zoom ?? 17 });
    },
  }));

  // Handle click from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (msg.type === "mapPress" && onPress) {
          onPress({ nativeEvent: { coordinate: { latitude: msg.lat, longitude: msg.lng } } });
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onPress]);

  const IFrameTag = "iframe" as any;

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <IFrameTag
        ref={iframeRef}
        srcDoc={html}
        style={{ width: "100%", height: "100%", border: "none" }}
        sandbox="allow-scripts allow-same-origin"
        title="map"
      />
    </View>
  );
}

const LeafletMapForward = forwardRef(LeafletMap);

// ================================
// NATIVE IMPLEMENTATION (RN Maps)
// ================================
let NativeMap: React.ForwardRefExoticComponent<MapViewComponentProps & React.RefAttributes<MapViewRef>> | null = null;

if (Platform.OS !== "web") {
  const {
    default: MapView,
    Polyline,
    Marker,
    PROVIDER_DEFAULT,
  } = require("react-native-maps");

  NativeMap = forwardRef<MapViewRef, MapViewComponentProps>(function NativeMapView(
    {
      style,
      initialRegion,
      showsUserLocation,
      followsUserLocation,
      showsCompass,
      showsMyLocationButton,
      userInterfaceStyle,
      scrollEnabled,
      zoomEnabled,
      children,
      onPanDrag,
      onPress,
      traceCoords = [],
      plannedCoords = [],
    },
    ref
  ) {
    const mapRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      animateCamera: (opts, config) => {
        mapRef.current?.animateCamera(opts, config);
      },
      fitToCoordinates: (coords, opts) => {
        mapRef.current?.fitToCoordinates(coords, opts);
      },
    }));

    const smoothed = smoothCoords(traceCoords);

    return (
      <MapView
        ref={mapRef}
        style={style ?? StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        followsUserLocation={followsUserLocation}
        showsCompass={showsCompass ?? false}
        showsMyLocationButton={showsMyLocationButton ?? false}
        userInterfaceStyle={userInterfaceStyle ?? "dark"}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        onPanDrag={onPanDrag}
        onPress={onPress}
      >
        {plannedCoords.length > 1 && (
          <Polyline
            coordinates={plannedCoords}
            strokeColor="#4FC3F7"
            strokeWidth={3}
            lineDashPattern={[8, 6]}
          />
        )}
        {plannedCoords.map((coord: Coord, i: number) => (
          <Marker key={`plan-${i}`} coordinate={coord} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#4FC3F7", borderWidth: 2, borderColor: "#fff" }} />
          </Marker>
        ))}
        {smoothed.length > 1 && (
          <Polyline
            coordinates={smoothed}
            strokeColor="#00E676"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {children}
      </MapView>
    );
  });
}

function smoothCoords(coords: Coord[], windowSize = 3): Coord[] {
  if (coords.length < 3) return coords;
  return coords.map((c, i) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(coords.length - 1, i + Math.floor(windowSize / 2));
    const slice = coords.slice(start, end + 1);
    return {
      latitude: slice.reduce((a, b) => a + b.latitude, 0) / slice.length,
      longitude: slice.reduce((a, b) => a + b.longitude, 0) / slice.length,
    };
  });
}

// Export the right component
export const MapViewComponent = Platform.OS === "web" ? LeafletMapForward : (NativeMap as any);
export default MapViewComponent;
