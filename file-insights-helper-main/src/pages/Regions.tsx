import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RegionChart } from "@/components/dashboard/RegionChart";
import { Loader2, MapPin, Building2, Siren, AlertTriangle } from "lucide-react";

const riskColors = {
  LOW: "bg-success/10 text-success border-success/20",
  MEDIUM: "bg-warning/10 text-warning border-warning/20",
  HIGH: "bg-destructive/10 text-destructive border-destructive/20",
  CRITICAL: "bg-destructive/20 text-destructive border-destructive/30",
};

function RegionsContent() {
  const { summary, regionAnalysis, isLoading } = useData();

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const criticalCount = regionAnalysis.filter(r => r.riskLevel === 'CRITICAL').length;
  const highCount = regionAnalysis.filter(r => r.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Total Regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{regionAnalysis.length}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Critical Risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{criticalCount}</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              High Risk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{highCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Siren className="h-4 w-4" />
              With Emergency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {regionAnalysis.filter(r => r.withEmergency > 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <RegionChart data={summary.byRegion} limit={15} />

      {/* Region Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Region Analysis
          </CardTitle>
          <CardDescription>
            Healthcare coverage by geographic area with medical desert risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[500px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-center">Facilities</TableHead>
                  <TableHead className="text-center">Hospitals</TableHead>
                  <TableHead className="text-center">Clinics</TableHead>
                  <TableHead className="text-center">Emergency</TableHead>
                  <TableHead className="text-center">Quality</TableHead>
                  <TableHead className="text-center">Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {regionAnalysis.map((region) => (
                  <TableRow key={region.region}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{region.region}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{region.totalFacilities}</TableCell>
                    <TableCell className="text-center">{region.hospitals}</TableCell>
                    <TableCell className="text-center">{region.clinics}</TableCell>
                    <TableCell className="text-center">
                      {region.withEmergency > 0 ? (
                        <Badge variant="outline" className="bg-success/10 text-success">
                          {region.withEmergency}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive">
                          0
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={region.avgCompleteness >= 50 ? 'text-primary' : 'text-destructive'}>
                        {region.avgCompleteness}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={riskColors[region.riskLevel]}>
                        {region.riskLevel}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const Regions = () => {
  return (
    <DashboardLayout 
      title="Regions" 
      description="Geographic distribution and analysis"
    >
      <RegionsContent />
    </DashboardLayout>
  );
};

export default Regions;
