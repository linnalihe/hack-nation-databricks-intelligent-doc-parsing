import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  AlertTriangle, 
  MapPin, 
  Building2, 
  Siren, 
  Users, 
  Bed,
  XCircle,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const riskColors = {
  LOW: { bg: "bg-success/10", text: "text-success", border: "border-success/20", fill: "hsl(var(--success))" },
  MEDIUM: { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20", fill: "hsl(var(--warning))" },
  HIGH: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", fill: "hsl(var(--destructive))" },
  CRITICAL: { bg: "bg-destructive/20", text: "text-destructive", border: "border-destructive/30", fill: "hsl(var(--destructive))" },
};

const riskIcons = {
  LOW: CheckCircle,
  MEDIUM: AlertCircle,
  HIGH: AlertTriangle,
  CRITICAL: XCircle,
};

function MedicalDesertsContent() {
  const { summary, regionAnalysis, facilities, isLoading } = useData();

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const riskDistribution = {
    CRITICAL: regionAnalysis.filter(r => r.riskLevel === 'CRITICAL').length,
    HIGH: regionAnalysis.filter(r => r.riskLevel === 'HIGH').length,
    MEDIUM: regionAnalysis.filter(r => r.riskLevel === 'MEDIUM').length,
    LOW: regionAnalysis.filter(r => r.riskLevel === 'LOW').length,
  };

  const pieData = [
    { name: 'Critical', value: riskDistribution.CRITICAL, color: riskColors.CRITICAL.fill },
    { name: 'High', value: riskDistribution.HIGH, color: riskColors.HIGH.fill },
    { name: 'Medium', value: riskDistribution.MEDIUM, color: riskColors.MEDIUM.fill },
    { name: 'Low', value: riskDistribution.LOW, color: riskColors.LOW.fill },
  ].filter(d => d.value > 0);

  const criticalRegions = regionAnalysis.filter(r => r.riskLevel === 'CRITICAL' || r.riskLevel === 'HIGH');
  const noEmergencyRegions = regionAnalysis.filter(r => r.withEmergency === 0);
  const noHospitalRegions = regionAnalysis.filter(r => r.hospitals === 0);

  // Calculate facilities in at-risk areas
  const facilitiesInRiskAreas = facilities.filter(f => {
    const region = f.region || f.city;
    return criticalRegions.some(r => r.region === region);
  }).length;

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <Card className="bg-destructive/5 border-destructive/20">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <h3 className="font-semibold text-lg">Medical Desert Analysis</h3>
              <p className="text-muted-foreground">
                {criticalRegions.length} regions identified with critical or high risk for healthcare access gaps
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-destructive/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              Critical Risk Regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{riskDistribution.CRITICAL}</p>
            <p className="text-xs text-muted-foreground">No hospitals or emergency care</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              High Risk Regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">{riskDistribution.HIGH}</p>
            <p className="text-xs text-muted-foreground">No emergency services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Siren className="h-4 w-4" />
              No Emergency Access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{noEmergencyRegions.length}</p>
            <p className="text-xs text-muted-foreground">Regions without 24/7 care</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              No Hospital Access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{noHospitalRegions.length}</p>
            <p className="text-xs text-muted-foreground">Clinics only</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>Regions by healthcare access risk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Critical findings from the analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="font-medium">Doctor Availability</span>
              </div>
              <Progress value={(summary.facilitiesWithDoctors / summary.totalFacilities) * 100} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">
                Only {summary.facilitiesWithDoctors} facilities ({Math.round((summary.facilitiesWithDoctors / summary.totalFacilities) * 100)}%) report doctor counts
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Bed className="h-4 w-4 text-primary" />
                <span className="font-medium">Bed Capacity</span>
              </div>
              <Progress value={(summary.facilitiesWithBeds / summary.totalFacilities) * 100} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">
                Only {summary.facilitiesWithBeds} facilities ({Math.round((summary.facilitiesWithBeds / summary.totalFacilities) * 100)}%) report bed capacity
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Siren className="h-4 w-4 text-primary" />
                <span className="font-medium">Emergency Coverage</span>
              </div>
              <Progress value={(summary.facilitiesWithEmergencyCapability / summary.totalFacilities) * 100} className="h-2 mb-1" />
              <p className="text-xs text-muted-foreground">
                {summary.facilitiesWithEmergencyCapability} facilities ({Math.round((summary.facilitiesWithEmergencyCapability / summary.totalFacilities) * 100)}%) have emergency capability
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Regions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            At-Risk Regions Requiring Intervention
          </CardTitle>
          <CardDescription>
            Regions classified as Critical or High risk for medical desert conditions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-center">Risk Level</TableHead>
                  <TableHead className="text-center">Facilities</TableHead>
                  <TableHead className="text-center">Hospitals</TableHead>
                  <TableHead className="text-center">Emergency</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criticalRegions.map((region) => {
                  const RiskIcon = riskIcons[region.riskLevel];
                  const issues = [];
                  if (region.hospitals === 0) issues.push('No hospitals');
                  if (region.withEmergency === 0) issues.push('No emergency');
                  if (region.withDoctors === 0) issues.push('No doctor data');
                  
                  return (
                    <TableRow key={region.region}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{region.region}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${riskColors[region.riskLevel].bg} ${riskColors[region.riskLevel].text} ${riskColors[region.riskLevel].border}`}>
                          <RiskIcon className="h-3 w-3 mr-1" />
                          {region.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{region.totalFacilities}</TableCell>
                      <TableCell className="text-center">
                        <span className={region.hospitals === 0 ? 'text-destructive font-bold' : ''}>
                          {region.hospitals}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={region.withEmergency === 0 ? 'text-destructive font-bold' : ''}>
                          {region.withEmergency}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {issues.map((issue, i) => (
                            <Badge key={i} variant="outline" className="text-xs bg-destructive/5 text-destructive border-destructive/20">
                              {issue}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">Impact Summary</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {criticalRegions.length} regions with {facilitiesInRiskAreas} total facilities are in areas 
              classified as Critical or High risk for medical desert conditions. These areas require 
              priority intervention to improve healthcare access and emergency services coverage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const MedicalDeserts = () => {
  return (
    <DashboardLayout 
      title="Medical Deserts" 
      description="Healthcare access gap analysis"
    >
      <MedicalDesertsContent />
    </DashboardLayout>
  );
};

export default MedicalDeserts;
