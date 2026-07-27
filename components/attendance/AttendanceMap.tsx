"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";

interface AttendanceMapProps {
    employeeLat?: number | null;
    employeeLng?: number | null;
    officeLat: number;
    officeLng: number;
    radiusMeters: number;
    employeeName: string;
    officeName: string;
}

function MapResizer({ employeeLat, employeeLng, officeLat, officeLng }: { employeeLat?: number | null; employeeLng?: number | null; officeLat: number; officeLng: number; }) {
    const map = useMap();

    useEffect(() => {
        // Defer bounds calculation to next paint cycle to avoid DOM race conditions
        const timer = setTimeout(() => {
            if (employeeLat && employeeLng && officeLat && officeLng) {
                const bounds = L.latLngBounds(
                    [employeeLat, employeeLng],
                    [officeLat, officeLng]
                );
                map.fitBounds(bounds, { padding: [50, 50] });
            } else if (officeLat && officeLng) {
                map.setView([officeLat, officeLng], 15);
            }
        }, 150);

        return () => clearTimeout(timer);
    }, [employeeLat, employeeLng, officeLat, officeLng, map]);

    return null;
}

export default function AttendanceMap({
    employeeLat,
    employeeLng,
    officeLat,
    officeLng,
    radiusMeters,
    employeeName,
    officeName
}: AttendanceMapProps) {
    const defaultCenter: [number, number] = useMemo(() => [officeLat || 20.5937, officeLng || 78.9629], [officeLat, officeLng]);

    // Initialize custom markers lazily inside client side component execution
    const officeMarkerIcon = useMemo(() => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <div class="absolute w-10 h-10 rounded-full bg-blue-500/20 animate-pulse border border-blue-500/30"></div>
                <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border border-white font-bold text-sm">
                    🏢
                </div>
            </div>
        `,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    }), []);

    const employeeMarkerIcon = useMemo(() => L.divIcon({
        html: `
            <div class="relative flex items-center justify-center">
                <div class="absolute w-10 h-10 rounded-full bg-amber-500/20 animate-ping border border-amber-500/30"></div>
                <div class="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg border border-white font-bold text-sm">
                    👤
                </div>
            </div>
        `,
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 20]
    }), []);

    const mapKey = useMemo(() => `${employeeLat || 0}-${employeeLng || 0}-${officeLat}-${officeLng}`, [employeeLat, employeeLng, officeLat, officeLng]);

    return (
        <div className="h-[300px] w-full rounded-3xl overflow-hidden border border-border shadow-inner relative z-0">
            <MapContainer
                key={mapKey}
                center={defaultCenter}
                zoom={14}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Office Marker */}
                {officeLat && officeLng && (
                    <Marker position={[officeLat, officeLng]} icon={officeMarkerIcon} />
                )}

                {/* Geofence Circle */}
                {officeLat && officeLng && radiusMeters && (
                    <Circle
                        center={[officeLat, officeLng]}
                        radius={radiusMeters}
                        pathOptions={{
                            color: "#3b82f6",
                            fillColor: "#3b82f6",
                            fillOpacity: 0.1,
                            weight: 1.5,
                            dashArray: "4 4"
                        }}
                    />
                )}

                {/* Employee Login Marker */}
                {employeeLat && employeeLng && (
                    <Marker position={[employeeLat, employeeLng]} icon={employeeMarkerIcon} />
                )}

                <MapResizer
                    employeeLat={employeeLat}
                    employeeLng={employeeLng}
                    officeLat={officeLat}
                    officeLng={officeLng}
                />
            </MapContainer>
        </div>
    );
}
