import { CleanedFacility, DataSummary, FacilityType, OperatorType, AffiliationType } from '@/types/facility';

// Parse JSON-like string arrays from CSV
function parseJsonArray(value: string | null | undefined): string[] {
  if (!value || value === 'null' || value === '[]') return [];
  try {
    // Handle both JSON format and plain strings
    if (value.startsWith('[')) {
      const parsed = JSON.parse(value.replace(/'/g, '"'));
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    }
    return [value].filter(Boolean);
  } catch {
    // If parsing fails, try to extract quoted strings
    const matches = value.match(/"([^"]+)"/g);
    if (matches) {
      return matches.map(m => m.replace(/"/g, ''));
    }
    return value ? [value] : [];
  }
}

// Normalize facility type
function normalizeFacilityType(value: string | null | undefined): FacilityType {
  if (!value) return 'unknown';
  const lower = value.toLowerCase();
  if (lower.includes('hospital')) return 'hospital';
  if (lower.includes('clinic')) return 'clinic';
  if (lower.includes('pharmacy')) return 'pharmacy';
  if (lower.includes('dentist')) return 'dentist';
  if (lower.includes('doctor')) return 'doctor';
  return 'unknown';
}

// Normalize operator type
function normalizeOperatorType(value: string | null | undefined): OperatorType {
  if (!value) return 'unknown';
  const lower = value.toLowerCase();
  if (lower.includes('public') || lower.includes('government')) return 'public';
  if (lower.includes('private')) return 'private';
  return 'unknown';
}

// Parse affiliations
function parseAffiliations(value: string | null | undefined): AffiliationType[] {
  const arr = parseJsonArray(value);
  const validTypes: AffiliationType[] = ['faith-tradition', 'philanthropy-legacy', 'community', 'academic', 'government'];
  return arr.filter(a => validTypes.includes(a as AffiliationType)) as AffiliationType[];
}

// Clean and format specialty names
function cleanSpecialty(specialty: string): string {
  // Convert camelCase to readable format
  return specialty
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Build complete address string
function buildAddress(row: Record<string, string>): string {
  const parts = [
    row['address_line1'],
    row['address_line2'],
    row['address_line3'],
    row['address_city'],
    row['address_stateOrRegion']
  ].filter(Boolean);
  return parts.join(', ') || 'Unknown';
}

// Calculate data completeness score
function calculateCompletenessScore(facility: Partial<CleanedFacility>): number {
  let score = 0;
  const weights = {
    name: 10,
    address: 10,
    city: 5,
    region: 5,
    phoneNumbers: 10,
    email: 5,
    website: 5,
    specialties: 15,
    procedures: 10,
    equipment: 10,
    capabilities: 10,
    numberOfDoctors: 5,
    bedCapacity: 5,
  };
  
  if (facility.name && facility.name !== 'Unknown') score += weights.name;
  if (facility.address && facility.address !== 'Unknown') score += weights.address;
  if (facility.city && facility.city !== 'Unknown') score += weights.city;
  if (facility.region) score += weights.region;
  if (facility.phoneNumbers && facility.phoneNumbers.length > 0) score += weights.phoneNumbers;
  if (facility.email) score += weights.email;
  if (facility.website) score += weights.website;
  if (facility.specialties && facility.specialties.length > 0) score += weights.specialties;
  if (facility.procedures && facility.procedures.length > 0) score += weights.procedures;
  if (facility.equipment && facility.equipment.length > 0) score += weights.equipment;
  if (facility.capabilities && facility.capabilities.length > 0) score += weights.capabilities;
  if (facility.numberOfDoctors !== null) score += weights.numberOfDoctors;
  if (facility.bedCapacity !== null) score += weights.bedCapacity;
  
  return score;
}

// Check for emergency capabilities
function hasEmergencyCapability(capabilities: string[], specialties: string[]): boolean {
  const emergencyKeywords = ['emergency', '24/7', '24 hour', 'trauma', 'ambulance', 'urgent'];
  const allText = [...capabilities, ...specialties].join(' ').toLowerCase();
  return emergencyKeywords.some(keyword => allText.includes(keyword));
}

// Process a single row into a cleaned facility
export function processRow(row: Record<string, string>, index: number): CleanedFacility {
  const specialties = parseJsonArray(row['specialties']).map(cleanSpecialty);
  const procedures = parseJsonArray(row['procedure']);
  const equipment = parseJsonArray(row['equipment']);
  const capabilities = parseJsonArray(row['capability']);
  const phoneNumbers = parseJsonArray(row['phone_numbers']);
  
  const facility: CleanedFacility = {
    id: row['unique_id'] || row['pk_unique_id'] || `facility-${index}`,
    name: row['name'] || 'Unknown Facility',
    organizationType: row['organization_type'] || 'facility',
    facilityType: normalizeFacilityType(row['facilityTypeId']),
    operatorType: normalizeOperatorType(row['operatorTypeId']),
    affiliations: parseAffiliations(row['affiliationTypeIds']),
    
    address: buildAddress(row),
    city: row['address_city'] || 'Unknown',
    region: row['address_stateOrRegion'] || '',
    country: row['address_country'] || 'Ghana',
    countryCode: row['address_countryCode'] || 'GH',
    
    phoneNumbers,
    email: row['email'] || null,
    website: row['officialWebsite'] || row['websites']?.replace(/[\[\]"]/g, '').split(',')[0] || null,
    
    specialties,
    procedures,
    equipment,
    capabilities,
    
    description: row['description'] || null,
    yearEstablished: row['yearEstablished'] ? parseInt(row['yearEstablished']) : null,
    numberOfDoctors: row['numberDoctors'] ? parseInt(row['numberDoctors']) : null,
    bedCapacity: row['capacity'] ? parseInt(row['capacity']) : null,
    acceptsVolunteers: row['acceptsVolunteers'] === 'true' ? true : row['acceptsVolunteers'] === 'false' ? false : null,
    
    hasCompleteAddress: Boolean(row['address_city'] && row['address_line1']),
    hasContactInfo: phoneNumbers.length > 0 || Boolean(row['email']),
    hasMedicalData: specialties.length > 0 || procedures.length > 0 || equipment.length > 0 || capabilities.length > 0,
    hasCapacityData: Boolean(row['numberDoctors'] || row['capacity']),
    dataCompletenessScore: 0,
    
    sourceUrl: row['source_url'] || null,
  };
  
  facility.dataCompletenessScore = calculateCompletenessScore(facility);
  
  return facility;
}

// Parse CSV string to array of objects
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  
  // Parse rows
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

// Parse a single CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

// Process entire dataset
export function processDataset(csvText: string): CleanedFacility[] {
  const rows = parseCSV(csvText);
  return rows.map((row, index) => processRow(row, index));
}

// Generate summary statistics
export function generateSummary(facilities: CleanedFacility[]): DataSummary {
  const byFacilityType: Record<FacilityType, number> = {
    hospital: 0,
    clinic: 0,
    pharmacy: 0,
    doctor: 0,
    dentist: 0,
    unknown: 0,
  };
  
  const byRegion: Record<string, number> = {};
  const bySpecialty: Record<string, number> = {};
  
  let totalScore = 0;
  let facilitiesWithDoctors = 0;
  let facilitiesWithBeds = 0;
  let facilitiesWithEmergencyCapability = 0;
  let facilitiesWithIncompleteData = 0;
  let facilitiesWithNoMedicalData = 0;
  
  facilities.forEach(facility => {
    // Count by type
    byFacilityType[facility.facilityType]++;
    
    // Count by region
    const region = facility.region || facility.city || 'Unknown';
    byRegion[region] = (byRegion[region] || 0) + 1;
    
    // Count specialties
    facility.specialties.forEach(specialty => {
      bySpecialty[specialty] = (bySpecialty[specialty] || 0) + 1;
    });
    
    // Data quality metrics
    totalScore += facility.dataCompletenessScore;
    if (facility.numberOfDoctors && facility.numberOfDoctors > 0) facilitiesWithDoctors++;
    if (facility.bedCapacity && facility.bedCapacity > 0) facilitiesWithBeds++;
    if (hasEmergencyCapability(facility.capabilities, facility.specialties)) facilitiesWithEmergencyCapability++;
    if (facility.dataCompletenessScore < 50) facilitiesWithIncompleteData++;
    if (!facility.hasMedicalData) facilitiesWithNoMedicalData++;
  });
  
  return {
    totalFacilities: facilities.length,
    byFacilityType,
    byRegion,
    bySpecialty,
    facilitiesWithDoctors,
    facilitiesWithBeds,
    facilitiesWithEmergencyCapability,
    averageCompletenessScore: facilities.length > 0 ? Math.round(totalScore / facilities.length) : 0,
    facilitiesWithIncompleteData,
    facilitiesWithNoMedicalData,
  };
}
