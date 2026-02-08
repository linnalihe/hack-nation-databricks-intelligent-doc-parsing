// Facility Types based on Virtue Foundation Schema Documentation

export type FacilityType = 'hospital' | 'pharmacy' | 'doctor' | 'clinic' | 'dentist' | 'unknown';
export type OperatorType = 'public' | 'private' | 'unknown';
export type AffiliationType = 'faith-tradition' | 'philanthropy-legacy' | 'community' | 'academic' | 'government';

export interface CleanedFacility {
  // Identity
  id: string;
  name: string;
  organizationType: string;
  facilityType: FacilityType;
  operatorType: OperatorType;
  affiliations: AffiliationType[];
  
  // Location
  address: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  
  // Contact
  phoneNumbers: string[];
  email: string | null;
  website: string | null;
  
  // Medical Capabilities (Extracted & Cleaned)
  specialties: string[];
  procedures: string[];
  equipment: string[];
  capabilities: string[];
  
  // Metadata
  description: string | null;
  yearEstablished: number | null;
  numberOfDoctors: number | null;
  bedCapacity: number | null;
  acceptsVolunteers: boolean | null;
  
  // Data Quality Flags
  hasCompleteAddress: boolean;
  hasContactInfo: boolean;
  hasMedicalData: boolean;
  hasCapacityData: boolean;
  dataCompletenessScore: number; // 0-100
  
  // Source
  sourceUrl: string | null;
}

export interface DataSummary {
  totalFacilities: number;
  byFacilityType: Record<FacilityType, number>;
  byRegion: Record<string, number>;
  bySpecialty: Record<string, number>;
  
  // Medical Deserts Analysis
  facilitiesWithDoctors: number;
  facilitiesWithBeds: number;
  facilitiesWithEmergencyCapability: number;
  
  // Data Quality
  averageCompletenessScore: number;
  facilitiesWithIncompleteData: number;
  facilitiesWithNoMedicalData: number;
}
