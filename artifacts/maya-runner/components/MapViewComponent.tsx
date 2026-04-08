/**
 * Cross-platform MapView wrapper.
 * - Native (iOS/Android): uses react-native-maps
 * - Web: full Leaflet map with OSRM routing, direction arrows, glow traces
 */
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";

type Coord = { latitude: number; longitude: number };

export type MapLayer = "dark" | "satellite" | "terrain" | "light";

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
  markRunFinished: () => void;
  setMapLayer: (layer: MapLayer) => void;
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
  traceCoords?: Coord[];
  plannedCoords?: Coord[];
  userPosition?: Coord | null;
  heading?: number;
  isPlanningMode?: boolean;
  onPlanUpdate?: (coords: Coord[], distanceKm: number) => void;
}

// ============================================================
// WEB — Leaflet
// ============================================================
function LeafletMap(
  { style, initialRegion, traceCoords = [], userPosition, heading = 0,
    isPlanningMode = false, onPlanUpdate, onPress }: MapViewComponentProps,
  ref: React.Ref<MapViewRef>
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const initializedRef = useRef(false);

  const lat = userPosition?.latitude ?? initialRegion?.latitude ?? 48.8566;
  const lng = userPosition?.longitude ?? initialRegion?.longitude ?? 2.3522;

  const html = buildLeafletHTML(lat, lng);

  function postMsg(data: object) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(data), "*");
  }

  function handleLoad() {
    if (!initializedRef.current) {
      initializedRef.current = true;
      setTimeout(() => postMsg({ type: "init", lat, lng, zoom: 17 }), 250);
    }
  }

  useEffect(() => { postMsg({ type: "updatePosition", lat, lng }); }, [userPosition]);
  useEffect(() => { postMsg({ type: "updateTrace", coords: traceCoords }); }, [traceCoords]);
  useEffect(() => { postMsg({ type: "setHeading", heading }); }, [heading]);
  useEffect(() => { postMsg({ type: "setPlanningMode", active: isPlanningMode }); }, [isPlanningMode]);

  useImperativeHandle(ref, () => ({
    animateCamera: ({ center, zoom }) => {
      if (center) postMsg({ type: "flyTo", lat: center.latitude, lng: center.longitude, zoom: zoom ?? 17 });
    },
    fitToCoordinates: (coords) => {
      if (coords.length > 0) postMsg({ type: "fitBounds", coords });
    },
    setPlanningMode: (active) => postMsg({ type: "setPlanningMode", active }),
    undoLastPlanPoint: () => postMsg({ type: "undoLastPlanPoint" }),
    clearPlan: () => postMsg({ type: "clearPlan" }),
    setHeadingMode: (active) => postMsg({ type: "setHeadingMode", active }),
    markRunFinished: () => postMsg({ type: "markRunFinished" }),
    setMapLayer: (layer) => postMsg({ type: "setMapLayer", layer }),
  }));

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
    { style, initialRegion, showsUserLocation, followsUserLocation, showsCompass,
      showsMyLocationButton, userInterfaceStyle, scrollEnabled, zoomEnabled,
      children, onPanDrag, onPress, traceCoords = [], plannedCoords = [] },
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
      markRunFinished: () => {},
      setMapLayer: () => {},
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
          <Polyline coordinates={plannedCoords} strokeColor="#4FC3F7" strokeWidth={6} />
        )}
        {traceCoords.length > 1 && (
          <Polyline coordinates={traceCoords} strokeColor="#00E676" strokeWidth={6} lineCap="round" lineJoin="round" />
        )}
        {traceCoords.length > 0 && (
          <Marker coordinate={traceCoords[0]} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#00E676", borderWidth: 3, borderColor: "#fff" }} />
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
// Leaflet HTML — Strava-like map with multiple tile layers
// ============================================================
function buildLeafletHTML(initLat: number, initLng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<script src="https://unpkg.com/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body,#map{width:100%;height:100%;background:#0d0d14;overflow:hidden;}
.leaflet-control-attribution,.leaflet-attribution-flag{display:none!important;}
.leaflet-control-zoom{border:none!important;margin:10px!important;}
.leaflet-control-zoom a{
  background:rgba(16,16,24,0.94)!important;color:#fff!important;
  border:1px solid rgba(255,255,255,0.1)!important;
  font-size:16px!important;width:36px!important;height:36px!important;line-height:36px!important;
}
.leaflet-control-zoom a:hover{background:rgba(35,35,50,0.98)!important;}

/* ---- User dot ---- */
.user-wrap{position:relative;width:26px;height:26px;}
.user-ring{
  position:absolute;top:50%;left:50%;
  width:52px;height:52px;border-radius:50%;
  background:rgba(79,195,247,0.15);
  transform:translate(-50%,-50%) scale(0.5);
  animation:ring 2.2s ease-out infinite;
}
.user-core{
  position:absolute;top:50%;left:50%;
  width:18px;height:18px;border-radius:50%;
  background:#4FC3F7;border:3px solid #fff;
  box-shadow:0 0 12px rgba(79,195,247,0.9),0 0 0 0 rgba(79,195,247,0.4);
  transform:translate(-50%,-50%);
}
.user-arrow{
  position:absolute;top:50%;left:50%;
  width:0;height:0;
  border-left:5px solid transparent;
  border-right:5px solid transparent;
  border-bottom:11px solid #4FC3F7;
  transform:translate(-50%,-180%) rotate(0deg);
  transform-origin:center 180%;
  transition:transform 0.3s ease;
  filter:drop-shadow(0 0 3px rgba(79,195,247,0.8));
}
@keyframes ring{
  0%{opacity:.9;transform:translate(-50%,-50%) scale(.35);}
  80%{opacity:0;transform:translate(-50%,-50%) scale(1.4);}
  100%{opacity:0;transform:translate(-50%,-50%) scale(1.4);}
}

/* ---- Start / End markers ---- */
.marker-start{
  width:18px;height:18px;border-radius:50%;
  background:#00E676;border:3px solid #fff;
  box-shadow:0 0 10px rgba(0,230,118,0.9),0 0 20px rgba(0,230,118,0.4);
}
.marker-end{
  width:18px;height:18px;border-radius:50%;
  background:#E8335A;border:3px solid #fff;
  box-shadow:0 0 10px rgba(232,51,90,0.9),0 0 20px rgba(232,51,90,0.4);
}
.marker-label{
  position:absolute;top:-22px;left:50%;transform:translateX(-50%);
  background:rgba(13,13,13,0.88);color:#fff;
  padding:2px 7px;border-radius:8px;
  font:600 10px/1.4 system-ui,sans-serif;
  white-space:nowrap;border:1px solid rgba(255,255,255,0.12);
}

/* ---- Distance badge ---- */
#dist-badge{
  position:fixed;top:12px;left:50%;transform:translateX(-50%);
  background:rgba(13,13,20,0.93);color:#4FC3F7;
  padding:7px 18px;border-radius:22px;
  font:700 14px/1 system-ui,sans-serif;
  border:1px solid rgba(79,195,247,0.3);
  display:none;z-index:9999;
  backdrop-filter:blur(10px);white-space:nowrap;
  letter-spacing:0.3px;
}

/* ---- Plan hint ---- */
#plan-hint{
  position:fixed;bottom:12px;left:50%;transform:translateX(-50%);
  background:rgba(13,13,20,0.88);color:rgba(255,255,255,0.6);
  padding:6px 16px;border-radius:18px;
  font:500 12px/1 system-ui,sans-serif;
  border:1px solid rgba(255,255,255,0.1);
  display:none;z-index:9999;pointer-events:none;white-space:nowrap;
}

/* ---- Routing spinner ---- */
#spinner{
  position:fixed;top:50%;right:16px;
  width:18px;height:18px;transform:translateY(-50%);
  border:2.5px solid rgba(79,195,247,0.2);border-top-color:#4FC3F7;
  border-radius:50%;display:none;z-index:9999;
  animation:spin .7s linear infinite;
}
@keyframes spin{to{transform:translateY(-50%) rotate(360deg);}}

/* ---- Layer switcher ---- */
#layer-switcher{
  position:fixed;bottom:80px;right:12px;
  display:flex;flex-direction:column;gap:6px;
  z-index:9998;
}
.layer-btn{
  width:42px;height:42px;border-radius:21px;
  background:rgba(16,16,24,0.94);border:1px solid rgba(255,255,255,0.12);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:18px;transition:all 0.2s;
  box-shadow:0 2px 8px rgba(0,0,0,0.5);
}
.layer-btn:hover{background:rgba(40,40,60,0.98);border-color:rgba(79,195,247,0.4);}
.layer-btn.active{background:rgba(79,195,247,0.2);border-color:#4FC3F7;}
.layer-btn span{font-size:18px;line-height:1;}

/* ---- Speed legend ---- */
#speed-legend{
  position:fixed;bottom:80px;left:12px;
  background:rgba(13,13,20,0.88);
  padding:8px 12px;border-radius:14px;
  border:1px solid rgba(255,255,255,0.1);
  display:none;z-index:9998;
  backdrop-filter:blur(8px);
}
#speed-legend .leg-title{color:rgba(255,255,255,0.6);font:500 10px/1 system-ui;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;}
#speed-legend .leg-bar{width:80px;height:6px;border-radius:3px;background:linear-gradient(to right,#1565C0,#00E676,#FFCA28,#E8335A);margin-bottom:4px;}
#speed-legend .leg-labels{display:flex;justify-content:space-between;font:400 9px/1 system-ui;color:rgba(255,255,255,0.45);}
</style>
</head>
<body>
<div id="dist-badge"></div>
<div id="plan-hint">👆 Appuie pour ajouter un point de passage</div>
<div id="spinner"></div>
<div id="map"></div>
<div id="layer-switcher">
  <div class="layer-btn active" id="btn-dark" onclick="switchLayer('dark')" title="Nuit"><span>🌑</span></div>
  <div class="layer-btn" id="btn-satellite" onclick="switchLayer('satellite')" title="Satellite"><span>🛰️</span></div>
  <div class="layer-btn" id="btn-terrain" onclick="switchLayer('terrain')" title="Terrain"><span>🏔️</span></div>
  <div class="layer-btn" id="btn-light" onclick="switchLayer('light')" title="Clair"><span>☀️</span></div>
</div>
<div id="speed-legend">
  <div class="leg-title">Allure</div>
  <div class="leg-bar"></div>
  <div class="leg-labels"><span>Rapide</span><span>Lent</span></div>
</div>
<script>
// ============ Tile layer definitions ============
var LAYERS = {
  dark:      { url:'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', sub:'abcd', maxZoom:20 },
  satellite: { url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', sub:'', maxZoom:19 },
  terrain:   { url:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', sub:'abc', maxZoom:17 },
  light:     { url:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', sub:'abcd', maxZoom:20 },
};
var currentLayerId = 'dark';
var currentTileLayer = null;

// ============ Map init ============
var map = L.map('map', {
  center: [${initLat}, ${initLng}],
  zoom: 16,
  zoomControl: true,
  attributionControl: false,
  tap: true,
  tapTolerance: 15,
});

function switchLayer(id) {
  if (currentTileLayer) map.removeLayer(currentTileLayer);
  var def = LAYERS[id];
  var opts = { maxZoom: def.maxZoom };
  if (def.sub) opts.subdomains = def.sub;
  currentTileLayer = L.tileLayer(def.url, opts).addTo(map);
  currentLayerId = id;
  // update button states
  ['dark','satellite','terrain','light'].forEach(function(l){
    var btn = document.getElementById('btn-'+l);
    if(btn) btn.className = 'layer-btn' + (l===id?' active':'');
  });
}
switchLayer('dark');

// ============ State ============
var userMarker = null;
var currentHeading = 0;
var allTraceCoords = [];

// --- PLAN layers ---
var planGlow = L.polyline([],{ color:'#4FC3F7', weight:16, opacity:0.18, lineCap:'round', lineJoin:'round' }).addTo(map);
var planLine = L.polyline([],{ color:'#4FC3F7', weight:6,  opacity:0.95, lineCap:'round', lineJoin:'round' }).addTo(map);
var planDecorator = null;
var cursorLine  = L.polyline([],{ color:'#4FC3F7', weight:2.5, opacity:0.45, dashArray:'5,6' }).addTo(map);
var startMk = null, endMk = null;

// --- TRACE layers (gradient segments) ---
var traceSegments = [];
var traceDecorator = null;
var traceStartMk = null, traceEndMk = null;

// --- Plan state ---
var planWaypoints = [];
var isPlanMode = false;
var isRoutingFlight = false;
var routingQueue = null;
var planSnapped = [];

// ============ Speed gradient ============
// Maps a normalized speed [0..1] to a CSS color string
// 0=slow(red), 0.5=medium(green), 1=fast(blue) — Strava-style
function speedColor(t) {
  // t=0 → slow → red  #E8335A
  // t=0.5 → medium → green #00E676
  // t=1 → fast → blue #1565C0
  var stops = [
    [232,51,90],   // #E8335A (slow)
    [0,230,118],   // #00E676 (medium)
    [21,101,192],  // #1565C0 (fast)
  ];
  t = Math.max(0, Math.min(1, t));
  var idx = t * (stops.length - 1);
  var lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return 'rgb('+stops[lo][0]+','+stops[lo][1]+','+stops[lo][2]+')';
  var f = idx - lo;
  var r = Math.round(stops[lo][0]+(stops[hi][0]-stops[lo][0])*f);
  var g = Math.round(stops[lo][1]+(stops[hi][1]-stops[lo][1])*f);
  var b = Math.round(stops[lo][2]+(stops[hi][2]-stops[lo][2])*f);
  return 'rgb('+r+','+g+','+b+')';
}

function clearTraceSegments() {
  traceSegments.forEach(function(s){map.removeLayer(s);});
  traceSegments = [];
  if(traceDecorator){map.removeLayer(traceDecorator);traceDecorator=null;}
}

function buildGradientTrace(coords) {
  clearTraceSegments();
  if(coords.length < 2) return;

  // Compute per-segment speeds using haversine + index-based time estimation
  var n = coords.length;
  var speeds = [];
  for(var i=0;i<n-1;i++){
    var d = haversine(coords[i][0],coords[i][1],coords[i+1][0],coords[i+1][1]);
    // Assume uniform time steps; use distance as proxy for speed
    speeds.push(d);
  }
  var maxS = Math.max.apply(null,speeds)||1;
  var minS = Math.min.apply(null,speeds)||0;
  var range = maxS - minS || 1;

  // Glow layer (full route)
  var allPts = coords.map(function(c){return [c[0],c[1]];});
  var glowSeg = L.polyline(allPts,{color:'#00E676',weight:18,opacity:0.12,lineCap:'round',lineJoin:'round'}).addTo(map);
  traceSegments.push(glowSeg);

  // Gradient segments
  for(var j=0;j<n-1;j++){
    var t = (speeds[j]-minS)/range; // 0=slow, 1=fast
    var col = speedColor(t);
    var seg = L.polyline([coords[j],coords[j+1]],{
      color:col, weight:7, opacity:0.97, lineCap:'round', lineJoin:'round'
    }).addTo(map);
    traceSegments.push(seg);
  }

  // Direction arrows on last segment group
  if(typeof L.PolylineDecorator !== 'undefined' && allPts.length > 1){
    var tmpLine = L.polyline(allPts);
    traceDecorator = L.polylineDecorator(tmpLine, {
      patterns:[{offset:'8%',repeat:100,symbol:L.Symbol.arrowHead({
        pixelSize:10,headAngle:50,polygon:false,
        pathOptions:{color:'rgba(255,255,255,0.7)',weight:2,opacity:0.7}
      })}]
    }).addTo(map);
  }

  // Show legend
  document.getElementById('speed-legend').style.display = n > 5 ? 'block' : 'none';
}

// ============ User marker ============
function upsertUser(lat, lng) {
  var html = '<div class="user-wrap">'
    + '<div class="user-ring"></div>'
    + '<div class="user-core"></div>'
    + '<div class="user-arrow" id="user-arrow"></div>'
    + '</div>';
  var icon = L.divIcon({ className:'', html:html, iconSize:[26,26], iconAnchor:[13,13] });
  if (!userMarker) {
    userMarker = L.marker([lat,lng],{ icon:icon, zIndexOffset:1500 }).addTo(map);
  } else {
    userMarker.setLatLng([lat,lng]);
  }
  updateArrow();
}

function updateArrow() {
  var el = document.getElementById('user-arrow');
  if (el) el.style.transform = 'translate(-50%,-180%) rotate(' + currentHeading + 'deg)';
}

// ============ Marker helpers ============
function mkIcon(cls, label) {
  return L.divIcon({
    className:'',
    html: '<div style="position:relative"><div class="' + cls + '"></div>'
        + (label ? '<div class="marker-label">' + label + '</div>' : '')
        + '</div>',
    iconSize:[18,18], iconAnchor:[9,9]
  });
}

// ============ Direction arrows (plan) ============
function refreshPlanArrows() {
  if (planDecorator) { map.removeLayer(planDecorator); planDecorator = null; }
  var pts = planLine.getLatLngs();
  if (typeof L.PolylineDecorator !== 'undefined' && pts.length > 1) {
    planDecorator = L.polylineDecorator(planLine, {
      patterns: [{
        offset: '8%', repeat: 110,
        symbol: L.Symbol.arrowHead({
          pixelSize: 11, headAngle: 50, polygon: false,
          pathOptions: { color:'#4FC3F7', weight:2.5, opacity:0.85 }
        })
      }]
    }).addTo(map);
  }
}

// ============ Plan start/end markers ============
function refreshPlanEndpoints() {
  if (startMk) { map.removeLayer(startMk); startMk = null; }
  if (endMk)   { map.removeLayer(endMk);   endMk = null;   }
  if (planWaypoints.length > 0) {
    var first = planWaypoints[0];
    startMk = L.marker([first.lat, first.lng], { icon: mkIcon('marker-start','Départ'), zIndexOffset:600 }).addTo(map);
  }
  if (planWaypoints.length > 1) {
    var last = planWaypoints[planWaypoints.length - 1];
    endMk = L.marker([last.lat, last.lng], { icon: mkIcon('marker-end','Arrivée'), zIndexOffset:700 }).addTo(map);
  }
}

// ============ Haversine ============
function haversine(la1,lo1,la2,lo2) {
  var R=6371, dLa=(la2-la1)*Math.PI/180, dLo=(lo2-lo1)*Math.PI/180;
  var a=Math.sin(dLa/2)*Math.sin(dLa/2)+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLo/2)*Math.sin(dLo/2);
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function straightDist(wps) {
  var d=0;
  for(var i=1;i<wps.length;i++) d+=haversine(wps[i-1].lat,wps[i-1].lng,wps[i].lat,wps[i].lng);
  return d;
}

// ============ OSRM routing ============
async function fetchRoute(wps) {
  if (wps.length === 0) return;
  if (wps.length === 1) {
    planLine.setLatLngs([[wps[0].lat,wps[0].lng]]);
    planGlow.setLatLngs([]);
    planSnapped = [{latitude:wps[0].lat,longitude:wps[0].lng}];
    refreshPlanEndpoints();
    return;
  }
  if (isRoutingFlight) { routingQueue = wps; return; }
  isRoutingFlight = true;
  document.getElementById('spinner').style.display = 'block';
  try {
    var cStr = wps.map(function(w){return w.lng+','+w.lat;}).join(';');
    var url = 'https://router.project-osrm.org/route/v1/foot/'+cStr+'?overview=full&geometries=geojson';
    var resp = await fetch(url);
    var data = await resp.json();
    if (data.routes && data.routes[0]) {
      var pts = data.routes[0].geometry.coordinates;
      var lls = pts.map(function(c){return [c[1],c[0]];});
      planLine.setLatLngs(lls);
      planGlow.setLatLngs(lls);
      planSnapped = pts.map(function(c){return {latitude:c[1],longitude:c[0]};});
      var km = data.routes[0].distance/1000;
      setBadge(km);
      notifyPlan(km);
      refreshPlanArrows();
      refreshPlanEndpoints();
      if (lls.length > 1) {
        map.fitBounds(planLine.getBounds(), { padding:[90,60], maxZoom:17, animate:true });
      }
    }
  } catch(e) {
    var lls2 = wps.map(function(w){return [w.lat,w.lng];});
    planLine.setLatLngs(lls2);
    planGlow.setLatLngs(lls2);
    planSnapped = wps.map(function(w){return {latitude:w.lat,longitude:w.lng};});
    setBadge(straightDist(wps));
    refreshPlanArrows();
    refreshPlanEndpoints();
  }
  isRoutingFlight = false;
  document.getElementById('spinner').style.display = 'none';
  if (routingQueue) { var q=routingQueue; routingQueue=null; fetchRoute(q); }
}

function setBadge(km) {
  var el = document.getElementById('dist-badge');
  if (km > 0.005) {
    el.style.display = 'block';
    el.textContent = km.toFixed(2) + ' km planifiés';
  } else {
    el.style.display = 'none';
  }
}
function notifyPlan(km) {
  window.parent.postMessage(JSON.stringify({ type:'planUpdate', coords:planSnapped, distanceKm:km }), '*');
}

// ============ Map events ============
map.on('click', function(e) {
  if (isPlanMode) {
    planWaypoints.push({ lat:e.latlng.lat, lng:e.latlng.lng });
    cursorLine.setLatLngs([]);
    fetchRoute(planWaypoints);
  }
  window.parent.postMessage(JSON.stringify({ type:'mapPress', lat:e.latlng.lat, lng:e.latlng.lng }), '*');
});

map.on('mousemove', function(e) {
  if (isPlanMode && planWaypoints.length > 0) {
    var last = planWaypoints[planWaypoints.length-1];
    cursorLine.setLatLngs([[last.lat,last.lng],[e.latlng.lat,e.latlng.lng]]);
  }
});

map.on('drag', function() {
  window.parent.postMessage(JSON.stringify({ type:'userDragged' }), '*');
});

// ============ Message handler ============
window.addEventListener('message', function(e) {
  try {
    var msg = typeof e.data==='string' ? JSON.parse(e.data) : e.data;

    if (msg.type === 'init') {
      map.setView([msg.lat,msg.lng], msg.zoom||17);
      upsertUser(msg.lat, msg.lng);
    }

    if (msg.type === 'updatePosition') {
      upsertUser(msg.lat, msg.lng);
    }

    if (msg.type === 'setHeading') {
      currentHeading = msg.heading||0;
      updateArrow();
    }

    if (msg.type === 'updateTrace') {
      allTraceCoords = msg.coords.map(function(c){return [c.latitude,c.longitude];});
      buildGradientTrace(allTraceCoords);
      if (allTraceCoords.length > 0 && !traceStartMk) {
        traceStartMk = L.marker(allTraceCoords[0], { icon:mkIcon('marker-start','Départ'), zIndexOffset:500 }).addTo(map);
      }
    }

    if (msg.type === 'clearTrace') {
      clearTraceSegments();
      allTraceCoords = [];
      if (traceStartMk){ map.removeLayer(traceStartMk); traceStartMk=null; }
      if (traceEndMk)  { map.removeLayer(traceEndMk); traceEndMk=null; }
      document.getElementById('speed-legend').style.display = 'none';
    }

    if (msg.type === 'markRunFinished') {
      if (allTraceCoords.length > 0 && !traceEndMk) {
        var lastC = allTraceCoords[allTraceCoords.length-1];
        traceEndMk = L.marker(lastC, { icon:mkIcon('marker-end','Arrivée'), zIndexOffset:800 }).addTo(map);
      }
      if (allTraceCoords.length > 1) {
        var bounds = L.latLngBounds(allTraceCoords);
        map.fitBounds(bounds, { padding:[100,70], animate:true });
      }
    }

    if (msg.type === 'flyTo') {
      map.flyTo([msg.lat,msg.lng], msg.zoom||17, { duration:0.5, animate:true });
    }

    if (msg.type === 'fitBounds') {
      var bds = msg.coords.map(function(c){return [c.latitude,c.longitude];});
      if (bds.length > 0) map.fitBounds(bds, { padding:[60,60] });
    }

    if (msg.type === 'setPlanningMode') {
      isPlanMode = msg.active;
      var hint = document.getElementById('plan-hint');
      hint.style.display = isPlanMode ? 'block' : 'none';
      map.getContainer().style.cursor = isPlanMode ? 'crosshair' : '';
      if (!isPlanMode) cursorLine.setLatLngs([]);
    }

    if (msg.type === 'clearPlan') {
      planWaypoints = []; planSnapped = [];
      planLine.setLatLngs([]); planGlow.setLatLngs([]); cursorLine.setLatLngs([]);
      if (planDecorator){ map.removeLayer(planDecorator); planDecorator=null; }
      if (startMk){ map.removeLayer(startMk); startMk=null; }
      if (endMk)  { map.removeLayer(endMk); endMk=null; }
      setBadge(0);
    }

    if (msg.type === 'undoLastPlanPoint') {
      if (planWaypoints.length > 0) {
        planWaypoints.pop();
        if (planWaypoints.length < 2) {
          planLine.setLatLngs(planWaypoints.map(function(w){return [w.lat,w.lng];}));
          planGlow.setLatLngs([]);
          if (planDecorator){ map.removeLayer(planDecorator); planDecorator=null; }
          setBadge(0);
          refreshPlanEndpoints();
        } else {
          fetchRoute(planWaypoints);
        }
      }
    }

    if (msg.type === 'setMapLayer') {
      switchLayer(msg.layer);
    }

    if (msg.type === 'setHeadingMode') { /* heading mode reserved for native */ }
  } catch(err) {}
});
<\/script>
</body>
</html>`;
}
