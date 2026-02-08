import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegionRisk {
  region: string;
  totalFacilities: number;
  hospitals: number;
  withEmergency: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface MedicalDesertCardProps {
  regions: RegionRisk[];
  limit?: number;
}

const riskConfig = {
  LOW: {
    icon: CheckCircle,
    className: "bg-success/10 text-success border-success/20",
    badgeVariant: "outline" as const,
  },
  MEDIUM: {
    icon: AlertCircle,
    className: "bg-warning/10 text-warning border-warning/20",
    badgeVariant: "outline" as const,
  },
  HIGH: {
    icon: AlertTriangle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    badgeVariant: "destructive" as const,
  },
  CRITICAL: {
    icon: XCircle,
    className: "bg-destructive/20 text-destructive border-destructive/30",
    badgeVariant: "destructive" as const,
  },
};

export function MedicalDesertCard({ regions, limit = 8 }: MedicalDesertCardProps) {
  const atRiskRegions = regions
    .filter(r => r.riskLevel !== 'LOW')
    .slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Medical Desert Risk Areas
        </CardTitle>
        <CardDescription>
          Regions with limited healthcare access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {atRiskRegions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No high-risk areas identified</p>
        ) : (
          <div className="space-y-3">
            {atRiskRegions.map((region) => {
              const config = riskConfig[region.riskLevel];
              const Icon = config.icon;
              
              return (
                <div 
                  key={region.region}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    config.className
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-sm">{region.region}</p>
                      <p className="text-xs opacity-70">
                        {region.totalFacilities} facilities • {region.hospitals} hospitals • {region.withEmergency} emergency
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.badgeVariant}>
                    {region.riskLevel}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
