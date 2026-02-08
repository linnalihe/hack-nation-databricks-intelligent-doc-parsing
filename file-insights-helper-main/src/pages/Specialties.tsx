import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpecialtyChart } from "@/components/dashboard/SpecialtyChart";
import { Loader2, Stethoscope, TrendingUp, TrendingDown } from "lucide-react";

function SpecialtiesContent() {
  const { facilities, summary, isLoading } = useData();

  const specialtyDetails = useMemo(() => {
    if (!facilities.length) return [];
    
    const details: Record<string, {
      count: number;
      hospitals: number;
      clinics: number;
      sampleFacilities: string[];
      regions: Set<string>;
    }> = {};

    facilities.forEach(f => {
      f.specialties.forEach(s => {
        if (!details[s]) {
          details[s] = {
            count: 0,
            hospitals: 0,
            clinics: 0,
            sampleFacilities: [],
            regions: new Set(),
          };
        }
        details[s].count++;
        if (f.facilityType === 'hospital') details[s].hospitals++;
        if (f.facilityType === 'clinic') details[s].clinics++;
        if (details[s].sampleFacilities.length < 3) {
          details[s].sampleFacilities.push(f.name);
        }
        if (f.city) details[s].regions.add(f.city);
        if (f.region) details[s].regions.add(f.region);
      });
    });

    return Object.entries(details)
      .map(([name, data]) => ({
        name,
        ...data,
        regionCount: data.regions.size,
      }))
      .sort((a, b) => b.count - a.count);
  }, [facilities]);

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const topSpecialties = specialtyDetails.slice(0, 5);
  const rareSpecialties = specialtyDetails.filter(s => s.count <= 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Total Specialties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Object.keys(summary.bySpecialty).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Most Common
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{topSpecialties[0]?.name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{topSpecialties[0]?.count || 0} facilities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Rare Specialties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{rareSpecialties.length}</p>
            <p className="text-sm text-muted-foreground">5 or fewer facilities</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <SpecialtyChart data={summary.bySpecialty} limit={12} />

      {/* Specialty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialtyDetails.slice(0, 12).map((specialty) => (
          <Card key={specialty.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{specialty.name}</span>
                <Badge variant="secondary">{specialty.count}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hospitals</span>
                  <span>{specialty.hospitals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Clinics</span>
                  <span>{specialty.clinics}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Regions</span>
                  <span>{specialty.regionCount}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Sample facilities:</p>
                  <div className="flex flex-wrap gap-1">
                    {specialty.sampleFacilities.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-xs truncate max-w-[150px]">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rare Specialties */}
      {rareSpecialties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Rare Specialties (Potential Gaps)
            </CardTitle>
            <CardDescription>
              Specialties with limited availability (5 or fewer facilities)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {rareSpecialties.map((s) => (
                <Badge key={s.name} variant="outline" className="bg-destructive/5 text-destructive border-destructive/20">
                  {s.name} ({s.count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const Specialties = () => {
  return (
    <DashboardLayout 
      title="Specialties" 
      description="Medical specialty distribution analysis"
    >
      <SpecialtiesContent />
    </DashboardLayout>
  );
};

export default Specialties;
