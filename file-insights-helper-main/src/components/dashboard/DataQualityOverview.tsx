import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DataQualityOverviewProps {
  averageScore: number;
  incompleteCount: number;
  noMedicalDataCount: number;
  totalFacilities: number;
}

export function DataQualityOverview({ 
  averageScore, 
  incompleteCount, 
  noMedicalDataCount,
  totalFacilities 
}: DataQualityOverviewProps) {
  const incompletePercent = Math.round((incompleteCount / totalFacilities) * 100);
  const noMedicalPercent = Math.round((noMedicalDataCount / totalFacilities) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality Overview</CardTitle>
        <CardDescription>Dataset completeness metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Average Completeness</span>
            <span className="text-sm text-muted-foreground">{averageScore}%</span>
          </div>
          <Progress value={averageScore} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-destructive">{incompleteCount}</p>
            <p className="text-xs text-muted-foreground">Incomplete Records</p>
            <p className="text-xs text-muted-foreground">({incompletePercent}% of total)</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-2xl font-bold text-destructive">{noMedicalDataCount}</p>
            <p className="text-xs text-muted-foreground">Missing Medical Data</p>
            <p className="text-xs text-muted-foreground">({noMedicalPercent}% of total)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
