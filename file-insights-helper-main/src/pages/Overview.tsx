import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/context/DataContext";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { FacilityTypeChart } from "@/components/dashboard/FacilityTypeChart";
import { RegionChart } from "@/components/dashboard/RegionChart";
import { SpecialtyChart } from "@/components/dashboard/SpecialtyChart";
import { MedicalDesertCard } from "@/components/dashboard/MedicalDesertCard";
import { DataQualityOverview } from "@/components/dashboard/DataQualityOverview";
import { Loader2, Database, MapPin, Stethoscope, Building2, Users, Bed, Siren } from "lucide-react";

function OverviewContent() {
  const { summary, regionAnalysis, isLoading } = useData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return <p className="text-muted-foreground">No data available</p>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Facilities"
          value={summary.totalFacilities.toLocaleString()}
          subtitle="Healthcare facilities in Ghana"
          icon={Database}
        />
        <MetricCard
          title="Regions Covered"
          value={Object.keys(summary.byRegion).length}
          subtitle="Geographic areas"
          icon={MapPin}
        />
        <MetricCard
          title="Medical Specialties"
          value={Object.keys(summary.bySpecialty).length}
          subtitle="Unique specialties"
          icon={Stethoscope}
        />
        <MetricCard
          title="Hospitals"
          value={summary.byFacilityType.hospital}
          subtitle={`${Math.round((summary.byFacilityType.hospital / summary.totalFacilities) * 100)}% of total`}
          icon={Building2}
        />
      </div>

      {/* Medical Desert Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="With Doctor Count"
          value={summary.facilitiesWithDoctors}
          subtitle={`${Math.round((summary.facilitiesWithDoctors / summary.totalFacilities) * 100)}% reporting`}
          icon={Users}
          variant={summary.facilitiesWithDoctors < summary.totalFacilities * 0.1 ? 'danger' : 'default'}
        />
        <MetricCard
          title="With Bed Capacity"
          value={summary.facilitiesWithBeds}
          subtitle={`${Math.round((summary.facilitiesWithBeds / summary.totalFacilities) * 100)}% reporting`}
          icon={Bed}
          variant={summary.facilitiesWithBeds < summary.totalFacilities * 0.1 ? 'danger' : 'default'}
        />
        <MetricCard
          title="Emergency Capable"
          value={summary.facilitiesWithEmergencyCapability}
          subtitle={`${Math.round((summary.facilitiesWithEmergencyCapability / summary.totalFacilities) * 100)}% of facilities`}
          icon={Siren}
          variant={summary.facilitiesWithEmergencyCapability < summary.totalFacilities * 0.2 ? 'warning' : 'success'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FacilityTypeChart data={summary.byFacilityType} />
        <RegionChart data={summary.byRegion} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SpecialtyChart data={summary.bySpecialty} />
        <MedicalDesertCard regions={regionAnalysis} />
        <DataQualityOverview 
          averageScore={summary.averageCompletenessScore}
          incompleteCount={summary.facilitiesWithIncompleteData}
          noMedicalDataCount={summary.facilitiesWithNoMedicalData}
          totalFacilities={summary.totalFacilities}
        />
      </div>
    </div>
  );
}

const Overview = () => {
  return (
    <DashboardLayout 
      title="Dashboard Overview" 
      description="Virtue Foundation Ghana Healthcare Analytics"
    >
      <OverviewContent />
    </DashboardLayout>
  );
};

export default Overview;
