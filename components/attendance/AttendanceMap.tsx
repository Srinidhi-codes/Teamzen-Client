"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import { Crosshair, Building2, User, Maximize2, Minimize2, ZoomIn, ZoomOut, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendanceMapProps {
    employeeLat?: number | null;
    employeeLng?: number | null;
    officeLat: number;
    officeLng: number;
    radiusMeters: number;
    employeeName: string;
    officeName: string;
    distanceMeters?: number | null;
    isWithin?: boolean;
}

function MapController({
    employeeLat,
    employeeLng,
    officeLat,
    officeLng,
    triggerCenter,
    mapHeight,
}: {
    employeeLat?: number | null;
    employeeLng?: number | null;
    officeLat: number;
    officeLng: number;
    triggerCenter: "both" | "employee" | "office" | null;
    mapHeight: number;
}) {
    const map = useMap();

    // Invalidate size whenever container height changes
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 120);
        return () => clearTimeout(timer);
    }, [mapHeight, map]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (triggerCenter === "employee" && employeeLat && employeeLng) {
                map.flyTo([employeeLat, employeeLng], 16, { duration: 1 });
            } else if (triggerCenter === "office" && officeLat && officeLng) {
                map.flyTo([officeLat, officeLng], 16, { duration: 1 });
            } else if (employeeLat && employeeLng && officeLat && officeLng) {
                const bounds = L.latLngBounds(
                    [employeeLat, employeeLng],
                    [officeLat, officeLng]
                );
                map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
            } else if (officeLat && officeLng) {
                map.setView([officeLat, officeLng], 15);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [employeeLat, employeeLng, officeLat, officeLng, triggerCenter, map]);

    return null;
}

export default function AttendanceMap({
    employeeLat,
    employeeLng,
    officeLat,
    officeLng,
    radiusMeters,
    employeeName,
    officeName,
    distanceMeters,
    isWithin,
}: AttendanceMapProps) {
    const defaultCenter: [number, number] = useMemo(
        () => [officeLat || 20.5937, officeLng || 78.9629],
        [officeLat, officeLng]
    );

    const [isExpanded, setIsExpanded] = useState(false);
    const [centerTrigger, setCenterTrigger] = useState<"both" | "employee" | "office">("both");
    const [tileMode, setTileMode] = useState<"osm" | "satellite">("osm");

    const mapHeight = isExpanded ? 640 : 500;

    // Custom Office Pin
    const officeMarkerIcon = useMemo(() => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center group cursor-pointer">
                <div class="absolute -inset-2 rounded-full bg-indigo-500/25 animate-ping"></div>
                <div class="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-xl border-2 border-white ring-2 ring-indigo-500/30 transition-transform group-hover:scale-110">
                    <span style="font-size: 20px;">🏢</span>
                </div>
                <div class="absolute -bottom-6 px-2 py-0.5 rounded-full bg-slate-900/90 text-[10px] font-bold text-white shadow-md border border-slate-700/60 whitespace-nowrap">
                    Office Zone
                </div>
            </div>
        `,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 22]
    }), []);

    // Custom Employee Pin
    const employeeMarkerIcon = useMemo(() => {
        const isOk = isWithin ?? false;
        const colorClass = isOk ? "from-emerald-600 to-teal-500" : "from-rose-600 to-amber-500";
        const ringColor = isOk ? "ring-emerald-500/30" : "ring-rose-500/30";
        const pingColor = isOk ? "bg-emerald-500/25" : "bg-rose-500/25";

        return L.divIcon({
            html: `
                <div class="relative flex items-center justify-center group cursor-pointer">
                    <div class="absolute -inset-2.5 rounded-full ${pingColor} animate-ping"></div>
                    <div class="relative w-11 h-11 rounded-2xl bg-gradient-to-tr ${colorClass} text-white flex items-center justify-center shadow-xl border-2 border-white ring-2 ${ringColor} transition-transform group-hover:scale-110">
                        <span style="font-size: 20px;">👤</span>
                    </div>
                    <div class="absolute -bottom-6 px-2 py-0.5 rounded-full ${isOk ? 'bg-emerald-950/90 border-emerald-700/60' : 'bg-rose-950/90 border-rose-700/60'} text-[10px] font-bold text-white shadow-md border whitespace-nowrap">
                        ${isOk ? 'In Range' : 'Outside'}
                    </div>
                </div>
            `,
            className: "",
            iconSize: [44, 44],
            iconAnchor: [22, 22]
        });
    }, [isWithin]);

    const distanceFormatted = distanceMeters != null
        ? distanceMeters >= 1000
            ? `${(distanceMeters / 1000).toFixed(2)} km`
            : `${Math.round(distanceMeters)} m`
        : null;

    const tileUrl = tileMode === "osm"
        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

    const mapKey = useMemo(
        () => `${employeeLat || 0}-${employeeLng || 0}-${officeLat}-${officeLng}-${tileMode}`,
        [employeeLat, employeeLng, officeLat, officeLng, tileMode]
    );

    return (
        <div className="w-full space-y-3">
            {/* Map Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-card/60 backdrop-blur-md p-2 rounded-2xl border border-border/80 shadow-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                        type="button"
                        size="sm"
                        variant={centerTrigger === "both" ? "default" : "outline"}
                        className="h-8 text-xs font-medium rounded-xl gap-1.5 shadow-xs"
                        onClick={() => setCenterTrigger("both")}
                    >
                        <Crosshair className="w-3.5 h-3.5 text-primary" />
                        Fit in View
                    </Button>
                    {employeeLat && employeeLng && (
                        <Button
                            type="button"
                            size="sm"
                            variant={centerTrigger === "employee" ? "default" : "outline"}
                            className="h-8 text-xs font-medium rounded-xl gap-1.5 shadow-xs"
                            onClick={() => setCenterTrigger("employee")}
                        >
                            <User className="w-3.5 h-3.5 text-emerald-500" />
                            My GPS Fix
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        variant={centerTrigger === "office" ? "default" : "outline"}
                        className="h-8 text-xs font-medium rounded-xl gap-1.5 shadow-xs"
                        onClick={() => setCenterTrigger("office")}
                    >
                        <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                        Office Geofence
                    </Button>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-medium rounded-xl gap-1.5 text-muted-foreground hover:text-foreground"
                        onClick={() => setTileMode((m) => (m === "osm" ? "satellite" : "osm"))}
                        title="Toggle satellite/street map"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{tileMode === "osm" ? "Satellite" : "Street"}</span>
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs font-medium rounded-xl gap-1.5 shadow-xs"
                        onClick={() => setIsExpanded((v) => !v)}
                        title={isExpanded ? "Collapse map height" : "Expand map height"}
                    >
                        {isExpanded ? (
                            <>
                                <Minimize2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Standard View</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Expanded View</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Map Container */}
            <div
                style={{ height: `${mapHeight}px` }}
                className="w-full rounded-2xl overflow-hidden border border-border shadow-md relative z-0 transition-[height] duration-300 ease-out bg-muted/20"
            >
                <MapContainer
                    key={mapKey}
                    center={defaultCenter}
                    zoom={15}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url={tileUrl}
                    />

                    {/* Geofence Outer Radius Area */}
                    {officeLat && officeLng && radiusMeters && (
                        <Circle
                            center={[officeLat, officeLng]}
                            radius={radiusMeters}
                            pathOptions={{
                                color: "#4f46e5",
                                fillColor: "#4f46e5",
                                fillOpacity: 0.12,
                                weight: 2,
                                dashArray: "6 6",
                            }}
                        >
                            <Popup>
                                <div className="p-1 space-y-1">
                                    <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
                                        <span>🏢</span> {officeName}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Authorized Geofence Radius: <span className="font-semibold text-primary">{radiusMeters}m</span>
                                    </div>
                                </div>
                            </Popup>
                        </Circle>
                    )}

                    {/* Office Marker */}
                    {officeLat && officeLng && (
                        <Marker position={[officeLat, officeLng]} icon={officeMarkerIcon}>
                            <Popup>
                                <div className="p-1 space-y-1.5 text-xs">
                                    <p className="font-bold text-sm text-foreground">{officeName}</p>
                                    <p className="text-muted-foreground">Authorized check-in location</p>
                                    <p className="font-mono text-[11px] text-muted-foreground">
                                        {officeLat.toFixed(5)}, {officeLng.toFixed(5)}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Line connecting Employee and Office */}
                    {employeeLat && employeeLng && officeLat && officeLng && (
                        <Polyline
                            positions={[
                                [employeeLat, employeeLng],
                                [officeLat, officeLng],
                            ]}
                            pathOptions={{
                                color: isWithin ? "#10b981" : "#f43f5e",
                                weight: 2,
                                dashArray: "4 8",
                                opacity: 0.75,
                            }}
                        />
                    )}

                    {/* Employee Location Marker */}
                    {employeeLat && employeeLng && (
                        <Marker position={[employeeLat, employeeLng]} icon={employeeMarkerIcon}>
                            <Popup>
                                <div className="p-1 space-y-1.5 text-xs">
                                    <p className="font-bold text-sm text-foreground">{employeeName} (You)</p>
                                    <p className="text-muted-foreground">
                                        Status: <span className={isWithin ? "font-bold text-emerald-600" : "font-bold text-rose-500"}>
                                            {isWithin ? "Inside Office Range" : "Outside Office Range"}
                                        </span>
                                    </p>
                                    {distanceFormatted && (
                                        <p className="text-muted-foreground">
                                            Distance to office: <span className="font-bold text-foreground">{distanceFormatted}</span>
                                        </p>
                                    )}
                                    <p className="font-mono text-[11px] text-muted-foreground">
                                        {employeeLat.toFixed(5)}, {employeeLng.toFixed(5)}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    <MapController
                        employeeLat={employeeLat}
                        employeeLng={employeeLng}
                        officeLat={officeLat}
                        officeLng={officeLng}
                        triggerCenter={centerTrigger}
                        mapHeight={mapHeight}
                    />
                </MapContainer>

                {/* Floating Map Legend Overlay */}
                <div className="absolute bottom-3 left-3 z-[1000] pointer-events-auto bg-card/90 backdrop-blur-md px-3 py-2 rounded-xl border border-border/80 shadow-md flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                        <span>Office ({radiusMeters}m geofence)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <span className={`w-2.5 h-2.5 rounded-full inline-block ${isWithin ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>You {distanceFormatted ? `(${distanceFormatted})` : ''}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
