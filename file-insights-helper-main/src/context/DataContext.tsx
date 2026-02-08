import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CleanedFacility, DataSummary } from '@/types/facility';
import { processDataset, generateSummary } from '@/utils/dataProcessor';
import rawDataUrl from '@/data/raw-facilities.csv?raw';

interface RegionAnalysis {
  region: string;
  totalFacilities: number;
  hospitals: number;
  clinics: number;
  withDoctors: number;
  withBeds: number;
  withEmergency: number;
  avgCompleteness: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface DataContextType {
  facilities: CleanedFacility[];
  summary: DataSummary | null;
  regionAnalysis: RegionAnalysis[];
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [facilities, setFacilities] = useState<CleanedFacility[]>([]);
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [regionAnalysis, setRegionAnalysis] = useState<RegionAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processData = async () => {
      try {
        const processed = processDataset(rawDataUrl);
        const summaryData = generateSummary(processed);
        
        // Generate region analysis
        const regionData: Record<string, {
          total: number;
          hospitals: number;
          clinics: number;
          withDoctors: number;
          withBeds: number;
          withEmergency: number;
          totalCompleteness: number;
        }> = {};

        processed.forEach(facility => {
          const region = facility.region || facility.city || 'Unknown';
          
          if (!regionData[region]) {
            regionData[region] = {
              total: 0,
              hospitals: 0,
              clinics: 0,
              withDoctors: 0,
              withBeds: 0,
              withEmergency: 0,
              totalCompleteness: 0,
            };
          }
          
          regionData[region].total++;
          if (facility.facilityType === 'hospital') regionData[region].hospitals++;
          if (facility.facilityType === 'clinic') regionData[region].clinics++;
          if (facility.numberOfDoctors && facility.numberOfDoctors > 0) regionData[region].withDoctors++;
          if (facility.bedCapacity && facility.bedCapacity > 0) regionData[region].withBeds++;
          
          const emergencyKeywords = ['emergency', '24/7', '24 hour', 'trauma', 'urgent'];
          const allText = [...facility.capabilities, ...facility.specialties].join(' ').toLowerCase();
          if (emergencyKeywords.some(k => allText.includes(k))) regionData[region].withEmergency++;
          
          regionData[region].totalCompleteness += facility.dataCompletenessScore;
        });

        const analysis: RegionAnalysis[] = Object.entries(regionData)
          .map(([region, data]) => {
            const avgCompleteness = Math.round(data.totalCompleteness / data.total);
            let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
            
            if (data.withEmergency === 0 && data.hospitals === 0) {
              riskLevel = 'CRITICAL';
            } else if (data.withEmergency === 0) {
              riskLevel = 'HIGH';
            } else if (data.hospitals < 2) {
              riskLevel = 'MEDIUM';
            }
            
            return {
              region,
              totalFacilities: data.total,
              hospitals: data.hospitals,
              clinics: data.clinics,
              withDoctors: data.withDoctors,
              withBeds: data.withBeds,
              withEmergency: data.withEmergency,
              avgCompleteness,
              riskLevel,
            };
          })
          .sort((a, b) => b.totalFacilities - a.totalFacilities);

        setFacilities(processed);
        setSummary(summaryData);
        setRegionAnalysis(analysis);
      } catch (error) {
        console.error('Error processing dataset:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    processData();
  }, []);

  return (
    <DataContext.Provider value={{ facilities, summary, regionAnalysis, isLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
