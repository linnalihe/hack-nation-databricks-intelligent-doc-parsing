import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, Building2, Phone, Mail, Globe } from "lucide-react";

function FacilitiesContent() {
  const { facilities, isLoading } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const regions = useMemo(() => {
    const uniqueRegions = new Set(facilities.map(f => f.city || f.region).filter(Boolean));
    return Array.from(uniqueRegions).sort();
  }, [facilities]);

  const filteredFacilities = useMemo(() => {
    return facilities.filter(facility => {
      const matchesSearch = search === "" || 
        facility.name.toLowerCase().includes(search.toLowerCase()) ||
        facility.city.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === "all" || facility.facilityType === typeFilter;
      const matchesRegion = regionFilter === "all" || 
        facility.city === regionFilter || 
        facility.region === regionFilter;
      
      return matchesSearch && matchesType && matchesRegion;
    });
  }, [facilities, search, typeFilter, regionFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search facilities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Facility Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="clinic">Clinic</SelectItem>
                <SelectItem value="pharmacy">Pharmacy</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="dentist">Dentist</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Region/City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.slice(0, 50).map(region => (
                  <SelectItem key={region} value={region}>{region}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Showing {filteredFacilities.length} of {facilities.length} facilities
          </p>
        </CardContent>
      </Card>

      {/* Facilities Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-card">
                <TableRow>
                  <TableHead className="w-[250px]">Facility</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Quality</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFacilities.slice(0, 100).map((facility) => (
                  <TableRow key={facility.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{facility.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {facility.address}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {facility.facilityType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{facility.city}</p>
                      {facility.region && (
                        <p className="text-xs text-muted-foreground">{facility.region}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {facility.specialties.slice(0, 2).map((s, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                        {facility.specialties.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{facility.specialties.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {facility.phoneNumbers.length > 0 && (
                          <Phone className="h-3 w-3" />
                        )}
                        {facility.email && <Mail className="h-3 w-3" />}
                        {facility.website && <Globe className="h-3 w-3" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-medium ${
                        facility.dataCompletenessScore >= 50 ? 'text-primary' : 'text-destructive'
                      }`}>
                        {facility.dataCompletenessScore}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredFacilities.length > 100 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Showing first 100 results. Use filters to narrow down.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const Facilities = () => {
  return (
    <DashboardLayout 
      title="Facilities" 
      description="Browse all healthcare facilities"
    >
      <FacilitiesContent />
    </DashboardLayout>
  );
};

export default Facilities;
