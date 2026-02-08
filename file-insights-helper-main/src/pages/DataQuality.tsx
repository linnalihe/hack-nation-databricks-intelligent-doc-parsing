import { useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  FileSpreadsheet, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  Stethoscope
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function DataQualityContent() {
  const { facilities, summary, isLoading } = useData();

  const qualityBreakdown = useMemo(() => {
    if (!facilities.length) return [];
    
    const ranges = [
      { label: '0-20%', min: 0, max: 20, count: 0 },
      { label: '21-40%', min: 21, max: 40, count: 0 },
      { label: '41-60%', min: 41, max: 60, count: 0 },
      { label: '61-80%', min: 61, max: 80, count: 0 },
      { label: '81-100%', min: 81, max: 100, count: 0 },
    ];

    facilities.forEach(f => {
      const range = ranges.find(r => f.dataCompletenessScore >= r.min && f.dataCompletenessScore <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [facilities]);

  const issueStats = useMemo(() => {
    const stats = {
      missingAddress: 0,
      missingContact: 0,
      missingMedicalData: 0,
      missingCapacity: 0,
    };

    facilities.forEach(f => {
      if (!f.hasCompleteAddress) stats.missingAddress++;
      if (!f.hasContactInfo) stats.missingContact++;
      if (!f.hasMedicalData) stats.missingMedicalData++;
      if (!f.hasCapacityData) stats.missingCapacity++;
    });

    return stats;
  }, [facilities]);

  const worstFacilities = useMemo(() => {
    return [...facilities]
      .sort((a, b) => a.dataCompletenessScore - b.dataCompletenessScore)
      .slice(0, 20);
  }, [facilities]);

  if (isLoading || !summary) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Average Quality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summary.averageCompletenessScore}%</p>
            <Progress value={summary.averageCompletenessScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Incomplete (&lt;50%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{summary.facilitiesWithIncompleteData}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round((summary.facilitiesWithIncompleteData / summary.totalFacilities) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              No Medical Data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">{summary.facilitiesWithNoMedicalData}</p>
            <p className="text-xs text-muted-foreground">
              {Math.round((summary.facilitiesWithNoMedicalData / summary.totalFacilities) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="border-success/20 bg-success/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-success">
              <CheckCircle className="h-4 w-4" />
              Complete (&gt;50%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              {summary.totalFacilities - summary.facilitiesWithIncompleteData}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Completeness Distribution</CardTitle>
            <CardDescription>Facilities by data quality score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="label" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--chart-1))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Issue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Missing Data Types</CardTitle>
            <CardDescription>Common data gaps across facilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Missing Address
                </span>
                <span className="text-sm text-muted-foreground">{issueStats.missingAddress}</span>
              </div>
              <Progress value={(issueStats.missingAddress / summary.totalFacilities) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Missing Contact
                </span>
                <span className="text-sm text-muted-foreground">{issueStats.missingContact}</span>
              </div>
              <Progress value={(issueStats.missingContact / summary.totalFacilities) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Missing Medical Data
                </span>
                <span className="text-sm text-muted-foreground">{issueStats.missingMedicalData}</span>
              </div>
              <Progress value={(issueStats.missingMedicalData / summary.totalFacilities) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Missing Capacity
                </span>
                <span className="text-sm text-muted-foreground">{issueStats.missingCapacity}</span>
              </div>
              <Progress value={(issueStats.missingCapacity / summary.totalFacilities) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Worst Quality Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Facilities Requiring Data Improvement
          </CardTitle>
          <CardDescription>
            Lowest quality records that need attention
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[400px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {worstFacilities.map((facility) => {
                  const issues = [];
                  if (!facility.hasCompleteAddress) issues.push('Address');
                  if (!facility.hasContactInfo) issues.push('Contact');
                  if (!facility.hasMedicalData) issues.push('Medical');
                  if (!facility.hasCapacityData) issues.push('Capacity');
                  
                  return (
                    <TableRow key={facility.id}>
                      <TableCell>
                        <p className="font-medium">{facility.name}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {facility.facilityType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{facility.city}</p>
                        {facility.region && (
                          <p className="text-xs text-muted-foreground">{facility.region}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-destructive font-bold">
                          {facility.dataCompletenessScore}%
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
    </div>
  );
}

const DataQuality = () => {
  return (
    <DashboardLayout 
      title="Data Quality" 
      description="Dataset completeness and integrity analysis"
    >
      <DataQualityContent />
    </DashboardLayout>
  );
};

export default DataQuality;
