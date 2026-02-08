import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CleanedFacility } from "@/types/facility";
import { getCoordinatesForLocation, jitterCoordinates, ghanaBounds } from "@/data/ghanaCoordinates";
import "leaflet/dist/leaflet.css";

interface FacilityMapProps {
  facilities: CleanedFacility[];
  regionAnalysis: {
    region: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    totalFacilities: number;
    hospitals: number;
    withEmergency: number;
  }[];
}

// Risk level colors
const riskColors = {
  LOW: "#22c55e",
  MEDIUM: "#f59e0b", 
  HIGH: "#ef4444",
  CRITICAL: "#dc2626",
};

const facilityTypeColors = {
  hospital: "#3b82f6",
  clinic: "#22c55e",
  pharmacy: "#8b5cf6",
  doctor: "#06b6d4",
  dentist: "#ec4899",
  unknown: "#6b7280",
};

// Component to fit bounds
function FitBounds() {
  const map = useMap();
  
  useEffect(() => {
    map.fitBounds([
      [ghanaBounds.south, ghanaBounds.west],
      [ghanaBounds.north, ghanaBounds.east],
    ]);
  }, [map]);
  
  return null;
}

interface MappedFacility extends CleanedFacility {
  lat: number;
  lng: number;
}

export function FacilityMap({ facilities, regionAnalysis }: FacilityMapProps) {
  const [showFacilities, setShowFacilities] = useState(true);
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [facilityTypeFilter, setFacilityTypeFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  // Map facilities to coordinates
  const mappedFacilities = useMemo(() => {
    const result: MappedFacility[] = [];
    const locationCounters: Record<string, number> = {};
    
    facilities.forEach((facility) => {
      const location = facility.city || facility.region || "Accra";
      const coords = getCoordinatesForLocation(location);
      
      if (coords) {
        locationCounters[location] = (locationCounters[location] || 0) + 1;
        const jittered = jitterCoordinates(coords.lat, coords.lng, locationCounters[location]);
        
        result.push({
          ...facility,
          lat: jittered.lat,
          lng: jittered.lng,
        });
      }
    });
    
    return result;
  }, [facilities]);

  // Map regions to coordinates for risk zones
  const mappedRegions = useMemo(() => {
    return regionAnalysis
      .map((region) => {
        const coords = getCoordinatesForLocation(region.region);
        if (coords) {
          return { ...region, ...coords };
        }
        return null;
      })
      .filter(Boolean) as (typeof regionAnalysis[0] & { lat: number; lng: number })[];
  }, [regionAnalysis]);

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return mappedFacilities.filter((f) => {
      if (facilityTypeFilter !== "all" && f.facilityType !== facilityTypeFilter) {
        return false;
      }
      return true;
    });
  }, [mappedFacilities, facilityTypeFilter]);

  // Filter risk zones
  const filteredRegions = useMemo(() => {
    return mappedRegions.filter((r) => {
      if (riskFilter !== "all" && r.riskLevel !== riskFilter) {
        return false;
      }
      return true;
    });
  }, [mappedRegions, riskFilter]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Map Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="show-facilities"
                checked={showFacilities}
                onCheckedChange={setShowFacilities}
              />
              <Label htmlFor="show-facilities">Show Facilities</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-risk"
                checked={showRiskZones}
                onCheckedChange={setShowRiskZones}
              />
              <Label htmlFor="show-risk">Show Risk Zones</Label>
            </div>
            <div className="flex items-center gap-2">
              <Label>Facility Type:</Label>
              <Select value={facilityTypeFilter} onValueChange={setFacilityTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="hospital">Hospital</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                  <SelectItem value="pharmacy">Pharmacy</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="dentist">Dentist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label>Risk Level:</Label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            <MapContainer
              center={[ghanaBounds.center.lat, ghanaBounds.center.lng]}
              zoom={7}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds />

              {/* Risk Zones (larger circles in background) */}
              {showRiskZones &&
                filteredRegions.map((region) => (
                  <CircleMarker
                    key={`risk-${region.region}`}
                    center={[region.lat, region.lng]}
                    radius={30 + region.totalFacilities * 0.5}
                    pathOptions={{
                      color: riskColors[region.riskLevel],
                      fillColor: riskColors[region.riskLevel],
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{region.region}</p>
                        <p>Risk Level: <span style={{ color: riskColors[region.riskLevel] }}>{region.riskLevel}</span></p>
                        <p>Facilities: {region.totalFacilities}</p>
                        <p>Hospitals: {region.hospitals}</p>
                        <p>Emergency: {region.withEmergency}</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

              {/* Facility Markers */}
              {showFacilities &&
                filteredFacilities.map((facility) => (
                  <CircleMarker
                    key={facility.id}
                    center={[facility.lat, facility.lng]}
                    radius={facility.facilityType === "hospital" ? 8 : 5}
                    pathOptions={{
                      color: facilityTypeColors[facility.facilityType],
                      fillColor: facilityTypeColors[facility.facilityType],
                      fillOpacity: 0.8,
                      weight: 1,
                    }}
                  >
                    <Popup>
                      <div className="text-sm max-w-xs">
                        <p className="font-bold">{facility.name}</p>
                        <p className="text-muted-foreground capitalize">{facility.facilityType}</p>
                        <p>{facility.address}</p>
                        {facility.specialties.length > 0 && (
                          <p className="mt-1">
                            <strong>Specialties:</strong> {facility.specialties.slice(0, 3).join(", ")}
                            {facility.specialties.length > 3 && ` +${facility.specialties.length - 3} more`}
                          </p>
                        )}
                        {facility.phoneNumbers.length > 0 && (
                          <p><strong>Phone:</strong> {facility.phoneNumbers[0]}</p>
                        )}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Facility Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(facilityTypeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm capitalize">{type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risk Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(riskColors).map(([level, color]) => (
                <div key={level} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm">{level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div>
              <span className="text-muted-foreground">Mapped Facilities:</span>{" "}
              <Badge variant="secondary">{filteredFacilities.length}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Risk Zones:</span>{" "}
              <Badge variant="secondary">{filteredRegions.length}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Critical Areas:</span>{" "}
              <Badge variant="destructive">
                {regionAnalysis.filter((r) => r.riskLevel === "CRITICAL").length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
