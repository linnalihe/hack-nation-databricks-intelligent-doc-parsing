import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/context/DataContext";
import { FacilityMap } from "@/components/dashboard/FacilityMap";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Loader2, Map, MapPin, Building2, AlertTriangle } from "lucide-react";

function MapViewContent() {
  const { facilities, regionAnalysis, summary, isLoading } = useData();

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const criticalRegions = regionAnalysis.filter(r => r.riskLevel === 'CRITICAL').length;
  const highRiskRegions = regionAnalysis.filter(r => r.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Facilities"
          value={facilities.length}
          subtitle="On the map"
          icon={Building2}
        />
        <MetricCard
          title="Regions Mapped"
          value={regionAnalysis.length}
          subtitle="Geographic areas"
          icon={MapPin}
        />
        <MetricCard
          title="Critical Risk"
          value={criticalRegions}
          subtitle="Urgent intervention needed"
          icon={AlertTriangle}
          variant="danger"
        />
        <MetricCard
          title="High Risk"
          value={highRiskRegions}
          subtitle="Limited healthcare access"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      {/* Map */}
      <FacilityMap facilities={facilities} regionAnalysis={regionAnalysis} />
    </div>
  );
}

const MapView = () => {
  return (
    <DashboardLayout 
      title="Map View" 
      description="Interactive healthcare facility and medical desert visualization"
    >
      <MapViewContent />
    </DashboardLayout>
  );
};

export default MapView;
