/**
 * Cross-platform MapView wrapper.
 * - Native (iOS/Android): uses react-native-maps
 * - Web: full Leaflet map with OSRM snap-to-road, heading mode, planning UX
 */
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";

type Coord = { latitude: number; longitude: number };

export interface MapViewRef {
  animateCamera: (
    opts: { center?: Coord; zoom?: number; heading?: number; pitch?: number },
    config?: { duration?: number }
  ) => void;
  fitToCoordinates?: (
    coords: Coord[],
    opts?: { edgePadding?: { top: number; right: number; bottom: number; left: number }; animated?: boolean }
  ) => void;
  setPlanningMode: (active: boolean) => void;
  undoLastPlanPoint: () => void;
  clearPlan: () => void;
  setHeadingMode: (active: boolean) => void;
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
  // Extended
  traceCoords?: Coord[];
  plannedCoords?: Coord[];
  userPosition?: Coord | null;
  heading?: number;
  isPlanningMode?: boolean;
  onPlanUpdate?: (coords: Coord[], distanceKm: number) => void;
}

// ============================================================
// WEB — Leaflet with OSRM routing + full UX
// ============================================================
function LeafletMap(
  {
    style,
    initialRegion,
    traceCoords = [],
    userPosition,
    heading = 0,
    isPlanningMode = false,
    onPlanUpdate,
    onPress,
  }: MapViewComponentProps,
  ref: React.Ref<MapViewRef>
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initializedRef = useRef(false);

  const lat = userPosition?.latitude ?? initialRegion?.latitude ?? 48.8566;
  const lng = userPosition?.longitude ?? initialRegion?.longitude ?? 2.3522;

  // Build HTML once
  const html = buildLeafletHTML(lat, lng);

  function postMsg(data: object) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(data), "*");
  }

  // Init map once iframe loads
  function handleLoad() {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setTimeout(() => postMsg({ type: "init", lat, lng, zoom: 17 }), 200);
    }
  }

  useEffect(() => {
    postMsg({ type: "updatePosition", lat, lng });
  }, [userPosition]);

  useEffect(() => {
    postMsg({ type: "updateTrace", coords: traceCoords });
  }, [traceCoords]);

  useEffect(() => {
    postMsg({ type: "setHeading", heading });
  }, [heading]);

  useEffect(() => {
    postMsg({ type: "setPlanningMode", active: isPlanningMode });
  }, [isPlanningMode]);

  useImperativeHandle(ref, () => ({
    animateCamera: ({ center, zoom, heading: h }) => {
      if (center) postMsg({ type: "flyTo", lat: center.latitude, lng: center.longitude, zoom: zoom ?? 17, heading: h });
    },
    fitToCoordinates: (coords) => {
      if (coords.length > 0) {
        postMsg({ type: "fitBounds", coords });
      }
    },
    setPlanningMode: (active) => postMsg({ type: "setPlanningMode", active }),
    undoLastPlanPoint: () => postMsg({ type: "undoLastPlanPoint" }),
    clearPlan: () => postMsg({ type: "clearPlan" }),
    setHeadingMode: (active) => postMsg({ type: "setHeadingMode", active }),
  }));

  // Listen to messages from Leaflet iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      try {
        const msg = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (msg.type === "mapPress" && onPress) {
          onPress({ nativeEvent: { coordinate: { latitude: msg.lat, longitude: msg.lng } } });
        }
        if (msg.type === "planUpdate" && onPlanUpdate) {
          onPlanUpdate(msg.coords, msg.distanceKm);
        }
      } catch {}
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onPress, onPlanUpdate]);

  const IFrameTag = "iframe" as any;

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      <IFrameTag
        ref={iframeRef}
        srcDoc={html}
        style={{ width: "100%", height: "100%", border: "none" }}
        sandbox="allow-scripts allow-same-origin"
        title="map"
        onLoad={handleLoad}
      />
    </View>
  );
}

const LeafletMapForward = forwardRef(LeafletMap);

// ============================================================
// NATIVE — react-native-maps
// ============================================================
let NativeMap: React.ForwardRefExoticComponent<MapViewComponentProps & React.RefAttributes<MapViewRef>> | null = null;

if (Platform.OS !== "web") {
  const RNMaps = require("react-native-maps");
  const MapView = RNMaps.default;
  const { Polyline, Marker } = RNMaps;

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
      isPlanningMode,
      onPlanUpdate,
    },
    ref
  ) {
    const mapRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      animateCamera: (opts, config) => mapRef.current?.animateCamera(opts, config),
      fitToCoordinates: (coords, opts) => mapRef.current?.fitToCoordinates(coords, opts),
      setPlanningMode: () => {},
      undoLastPlanPoint: () => {},
      clearPlan: () => {},
      setHeadingMode: () => {},
    }));

    return (
      <MapView
        ref={mapRef}
        style={style ?? StyleSheet.absoluteFill}
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
        {(plannedCoords ?? []).length > 1 && (
          <Polyline coordinates={plannedCoords} strokeColor="#4FC3F7" strokeWidth={4} lineDashPattern={[8, 6]} />
        )}
        {traceCoords.length > 1 && (
          <Polyline coordinates={traceCoords} strokeColor="#00E676" strokeWidth={5} lineCap="round" lineJoin="round" />
        )}
        {traceCoords.length > 0 && (
          <Marker coordinate={traceCoords[0]} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#00E676", borderWidth: 2, borderColor: "#fff" }} />
          </Marker>
        )}
        {children}
      </MapView>
    );
  });
}

export const MapViewComponent = Platform.OS === "web" ? LeafletMapForward : (NativeMap as any);
export default MapViewComponent;

// ============================================================
// Leaflet HTML — full featured map
// ============================================================
function buildLeafletHTML(initLat: number, initLng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body,#map{width:100%;height:100%;background:#1a1a2e;overflow:hidden;}
.leaflet-control-attribution,.leaflet-attribution-flag{display:none!important;}
.leaflet-control-zoom{border:none!important;}
.leaflet-control-zoom a{background:rgba(20,20,30,0.92)!important;color:#fff!important;border:1px solid rgba(255,255,255,0.12)!important;font-size:18px!important;width:34px!important;height:34px!important;line-height:34px!important;}
.leaflet-control-zoom a:hover{background:rgba(40,40,50,0.95)!important;}

/* Pulsing user dot */
.user-dot-wrap{position:relative;width:22px;height:22px;}
.user-dot-ring{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;border-radius:50%;background:rgba(79,195,247,0.18);animation:ring-pulse 2s ease-out infinite;}
.user-dot{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:#4FC3F7;border:3px solid #fff;box-shadow:0 0 8px rgba(79,195,247,0.8);}
.user-accuracy{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;background:rgba(79,195,247,0.12);border:1px solid rgba(79,195,247,0.3);}
@keyframes ring-pulse{0%{opacity:0.8;transform:translate(-50%,-50%) scale(0.4);}100%{opacity:0;transform:translate(-50%,-50%) scale(2);}}

/* Plan waypoints */
.wp-dot{width:12px;height:12px;border-radius:50%;background:#4FC3F7;border:2px solid #fff;box-shadow:0 0 6px rgba(79,195,247,0.6);}
.wp-dot.wp-first{background:#00E676;width:14px;height:14px;box-shadow:0 0 8px rgba(0,230,118,0.7);}
.wp-dot.wp-last{background:#FF6B35;width:14px;height:14px;box-shadow:0 0 8px rgba(255,107,53,0.7);}

/* Trace start dot */
.start-dot{width:14px;height:14px;border-radius:50%;background:#00E676;border:3px solid #fff;box-shadow:0 0 8px rgba(0,230,118,0.8);}

/* Distance badge */
#dist-badge{
  position:fixed;top:14px;left:50%;transform:translateX(-50%);
  background:rgba(13,13,13,0.92);color:#4FC3F7;
  padding:7px 18px;border-radius:22px;
  font:700 14px/1 system-ui,sans-serif;
  border:1px solid rgba(79,195,247,0.35);
  display:none;z-index:9999;
  backdrop-filter:blur(8px);
  white-space:nowrap;
}

/* Plan hint */
#plan-hint{
  position:fixed;bottom:14px;left:50%;transform:translateX(-50%);
  background:rgba(13,13,13,0.88);color:rgba(255,255,255,0.65);
  padding:6px 16px;border-radius:18px;
  font:500 12px/1 system-ui,sans-serif;
  border:1px solid rgba(255,255,255,0.1);
  display:none;z-index:9999;
  backdrop-filter:blur(6px);
  pointer-events:none;
  white-space:nowrap;
}

/* OSRM loading spinner */
#routing-spinner{
  position:fixed;top:50%;right:14px;transform:translateY(-50%);
  width:20px;height:20px;
  border:3px solid rgba(79,195,247,0.25);
  border-top-color:#4FC3F7;
  border-radius:50%;
  display:none;z-index:9999;
  animation:spin 0.7s linear infinite;
}
@keyframes spin{to{transform:translateY(-50%) rotate(360deg);}}
</style>
</head>
<body>
<div id="dist-badge"></div>
<div id="plan-hint">👆 Appuie pour ajouter un point de passage</div>
<div id="routing-spinner"></div>
<div id="map"></div>
<script>
// ---- Init Map ----
var map = L.map('map', {
  center: [${initLat}, ${initLng}],
  zoom: 16,
  zoomControl: true,
  attributionControl: false,
  tap: true,
  tapTolerance: 15,
});

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  subdomains: 'abcd',
}).addTo(map);

// ---- State ----
var userMarker = null;
var tracePolyline = L.polyline([], {
  color: '#00E676', weight: 6, lineCap: 'round', lineJoin: 'round', opacity: 0.95
}).addTo(map);
var planPolyline = L.polyline([], {
  color: '#4FC3F7', weight: 4, dashArray: '10,7', lineCap: 'round', opacity: 0.9
}).addTo(map);
var cursorLine = L.polyline([], {
  color: '#4FC3F7', weight: 2, dashArray: '4,5', opacity: 0.5
}).addTo(map);
var startDotMarker = null;
var planWaypoints = [];
var planMarkers = [];
var planSnapped = [];
var isPlanMode = false;
var followUser = true;
var currentHeading = 0;
var headingMode = false;
var isRoutingInFlight = false;
var routingQueue = null;

// ---- User Marker ----
function upsertUserMarker(lat, lng) {
  var icon = L.divIcon({
    className: '',
    html: '<div class="user-dot-wrap"><div class="user-dot-ring"></div><div class="user-dot"></div></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
  if (!userMarker) {
    userMarker = L.marker([lat, lng], { icon: icon, zIndexOffset: 1200 }).addTo(map);
  } else {
    userMarker.setLatLng([lat, lng]);
  }
}

// ---- Haversine ----
function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371;
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLng = (lng2 - lng1) * Math.PI / 180;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2)
        + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)
          *Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcStraightDist(wps) {
  var d = 0;
  for (var i = 1; i < wps.length; i++) d += haversine(wps[i-1].lat, wps[i-1].lng, wps[i].lat, wps[i].lng);
  return d;
}

// ---- OSRM Routing ----
async function fetchRoute(wps) {
  if (wps.length < 2) {
    planPolyline.setLatLngs(wps.map(function(w){ return [w.lat, w.lng]; }));
    planSnapped = wps.map(function(w){ return {latitude:w.lat,longitude:w.lng}; });
    updateBadge(calcStraightDist(wps));
    notifyPlan();
    return;
  }
  if (isRoutingInFlight) {
    routingQueue = wps;
    return;
  }
  isRoutingInFlight = true;
  document.getElementById('routing-spinner').style.display = 'block';
  try {
    var coords = wps.map(function(w){ return w.lng + ',' + w.lat; }).join(';');
    var url = 'https://router.project-osrm.org/route/v1/foot/' + coords + '?overview=full&geometries=geojson';
    var resp = await fetch(url);
    var data = await resp.json();
    if (data.routes && data.routes[0]) {
      var pts = data.routes[0].geometry.coordinates;
      planPolyline.setLatLngs(pts.map(function(c){ return [c[1],c[0]]; }));
      planSnapped = pts.map(function(c){ return {latitude:c[1],longitude:c[0]}; });
      updateBadge(data.routes[0].distance / 1000);
      notifyPlan(data.routes[0].distance / 1000);
    }
  } catch(e) {
    // fallback: straight lines
    planPolyline.setLatLngs(wps.map(function(w){ return [w.lat, w.lng]; }));
    planSnapped = wps.map(function(w){ return {latitude:w.lat,longitude:w.lng}; });
    var d = calcStraightDist(wps);
    updateBadge(d);
    notifyPlan(d);
  }
  isRoutingInFlight = false;
  document.getElementById('routing-spinner').style.display = 'none';
  if (routingQueue) {
    var q = routingQueue;
    routingQueue = null;
    fetchRoute(q);
  }
}

function updateBadge(km) {
  var badge = document.getElementById('dist-badge');
  if (km > 0.005) {
    badge.style.display = 'block';
    badge.textContent = km.toFixed(2) + ' km planifiés';
  } else {
    badge.style.display = 'none';
  }
}

function notifyPlan(km) {
  window.parent.postMessage(JSON.stringify({
    type: 'planUpdate',
    coords: planSnapped,
    distanceKm: km || calcStraightDist(planWaypoints),
  }), '*');
}

// ---- Plan Markers ----
function rebuildPlanMarkers() {
  planMarkers.forEach(function(m){ map.removeLayer(m); });
  planMarkers = [];
  planWaypoints.forEach(function(wp, i) {
    var isFirst = i === 0;
    var isLast = i === planWaypoints.length - 1 && planWaypoints.length > 1;
    var cls = 'wp-dot' + (isFirst ? ' wp-first' : '') + (isLast ? ' wp-last' : '');
    var icon = L.divIcon({
      className: '',
      html: '<div class="' + cls + '"></div>',
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    planMarkers.push(L.marker([wp.lat, wp.lng], { icon: icon }).addTo(map));
  });
}

// ---- Map Events ----
map.on('click', function(e) {
  if (isPlanMode) {
    planWaypoints.push({ lat: e.latlng.lat, lng: e.latlng.lng });
    rebuildPlanMarkers();
    cursorLine.setLatLngs([]);
    fetchRoute(planWaypoints);
  }
  window.parent.postMessage(JSON.stringify({ type: 'mapPress', lat: e.latlng.lat, lng: e.latlng.lng }), '*');
});

// Cursor follow line on mouse move
map.on('mousemove', function(e) {
  if (isPlanMode && planWaypoints.length > 0) {
    var last = planWaypoints[planWaypoints.length - 1];
    cursorLine.setLatLngs([[last.lat, last.lng], [e.latlng.lat, e.latlng.lng]]);
  }
});

// Touch follow (mobile web)
map.on('touchmove', function(e) {
  if (isPlanMode && planWaypoints.length > 0 && e.latlng) {
    var last = planWaypoints[planWaypoints.length - 1];
    cursorLine.setLatLngs([[last.lat, last.lng], [e.latlng.lat, e.latlng.lng]]);
  }
});

map.on('drag', function() {
  followUser = false;
  window.parent.postMessage(JSON.stringify({ type: 'userDragged' }), '*');
});

// ---- Message Handler ----
window.addEventListener('message', function(e) {
  try {
    var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

    if (msg.type === 'init') {
      map.setView([msg.lat, msg.lng], msg.zoom || 17);
      upsertUserMarker(msg.lat, msg.lng);
      followUser = true;
    }

    if (msg.type === 'updatePosition') {
      upsertUserMarker(msg.lat, msg.lng);
      if (followUser) map.panTo([msg.lat, msg.lng], { animate: true, duration: 0.4 });
    }

    if (msg.type === 'updateTrace') {
      var lls = msg.coords.map(function(c){ return [c.latitude, c.longitude]; });
      tracePolyline.setLatLngs(lls);
      if (lls.length > 0) {
        if (!startDotMarker) {
          var icon = L.divIcon({ className: '', html: '<div class="start-dot"></div>', iconSize: [14,14], iconAnchor: [7,7] });
          startDotMarker = L.marker(lls[0], { icon: icon, zIndexOffset: 900 }).addTo(map);
        }
      }
    }

    if (msg.type === 'clearTrace') {
      tracePolyline.setLatLngs([]);
      if (startDotMarker) { map.removeLayer(startDotMarker); startDotMarker = null; }
    }

    if (msg.type === 'flyTo') {
      followUser = true;
      map.flyTo([msg.lat, msg.lng], msg.zoom || 17, { duration: 0.5, animate: true });
    }

    if (msg.type === 'fitBounds') {
      var bounds = msg.coords.map(function(c){ return [c.latitude, c.longitude]; });
      if (bounds.length > 0) map.fitBounds(bounds, { padding: [60, 60] });
    }

    if (msg.type === 'setHeading') {
      currentHeading = msg.heading || 0;
    }

    if (msg.type === 'setPlanningMode') {
      isPlanMode = msg.active;
      var hint = document.getElementById('plan-hint');
      if (isPlanMode) {
        hint.style.display = 'block';
        map.getContainer().style.cursor = 'crosshair';
      } else {
        hint.style.display = 'none';
        cursorLine.setLatLngs([]);
        map.getContainer().style.cursor = '';
      }
    }

    if (msg.type === 'clearPlan') {
      planWaypoints = [];
      planSnapped = [];
      planMarkers.forEach(function(m){ map.removeLayer(m); });
      planMarkers = [];
      planPolyline.setLatLngs([]);
      cursorLine.setLatLngs([]);
      updateBadge(0);
    }

    if (msg.type === 'undoLastPlanPoint') {
      if (planWaypoints.length > 0) {
        planWaypoints.pop();
        rebuildPlanMarkers();
        if (planWaypoints.length >= 2) fetchRoute(planWaypoints);
        else {
          planPolyline.setLatLngs(planWaypoints.map(function(w){ return [w.lat,w.lng]; }));
          planSnapped = planWaypoints.map(function(w){ return {latitude:w.lat,longitude:w.lng}; });
          updateBadge(0);
        }
      }
    }

    if (msg.type === 'setHeadingMode') {
      headingMode = msg.active;
    }
  } catch(err) { /* noop */ }
});
<\/script>
</body>
</html>`;
}
