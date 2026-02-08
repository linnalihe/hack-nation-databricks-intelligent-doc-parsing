import * as XLSX from 'xlsx';
import { CleanedFacility, DataSummary } from '@/types/facility';

// Convert facility to flat row for Excel
function facilityToRow(facility: CleanedFacility): Record<string, string | number | boolean | null> {
  return {
    'ID': facility.id,
    'Name': facility.name,
    'Organization Type': facility.organizationType,
    'Facility Type': facility.facilityType,
    'Operator Type': facility.operatorType,
    'Affiliations': facility.affiliations.join('; '),
    
    'Full Address': facility.address,
    'City': facility.city,
    'Region': facility.region,
    'Country': facility.country,
    'Country Code': facility.countryCode,
    
    'Phone Numbers': facility.phoneNumbers.join('; '),
    'Email': facility.email || '',
    'Website': facility.website || '',
    
    'Specialties': facility.specialties.join('; '),
    'Procedures': facility.procedures.join('; '),
    'Equipment': facility.equipment.join('; '),
    'Capabilities': facility.capabilities.join('; '),
    
    'Description': facility.description || '',
    'Year Established': facility.yearEstablished || '',
    'Number of Doctors': facility.numberOfDoctors || '',
    'Bed Capacity': facility.bedCapacity || '',
    'Accepts Volunteers': facility.acceptsVolunteers === null ? '' : facility.acceptsVolunteers,
    
    'Has Complete Address': facility.hasCompleteAddress,
    'Has Contact Info': facility.hasContactInfo,
    'Has Medical Data': facility.hasMedicalData,
    'Has Capacity Data': facility.hasCapacityData,
    'Data Completeness Score (%)': facility.dataCompletenessScore,
    
    'Source URL': facility.sourceUrl || '',
  };
}

// Create summary sheet data
function createSummaryData(summary: DataSummary): Record<string, string | number>[] {
  const data: Record<string, string | number>[] = [];
  
  // Overview
  data.push({ 'Metric': 'OVERVIEW', 'Value': '' });
  data.push({ 'Metric': 'Total Facilities', 'Value': summary.totalFacilities });
  data.push({ 'Metric': 'Average Data Completeness', 'Value': `${summary.averageCompletenessScore}%` });
  data.push({ 'Metric': 'Facilities with Incomplete Data (<50%)', 'Value': summary.facilitiesWithIncompleteData });
  data.push({ 'Metric': 'Facilities with No Medical Data', 'Value': summary.facilitiesWithNoMedicalData });
  data.push({ 'Metric': '', 'Value': '' });
  
  // Medical Deserts Analysis
  data.push({ 'Metric': 'MEDICAL DESERTS ANALYSIS', 'Value': '' });
  data.push({ 'Metric': 'Facilities with Doctor Count', 'Value': summary.facilitiesWithDoctors });
  data.push({ 'Metric': 'Facilities with Bed Capacity', 'Value': summary.facilitiesWithBeds });
  data.push({ 'Metric': 'Facilities with Emergency Capability', 'Value': summary.facilitiesWithEmergencyCapability });
  data.push({ 'Metric': '', 'Value': '' });
  
  // By Facility Type
  data.push({ 'Metric': 'BY FACILITY TYPE', 'Value': '' });
  Object.entries(summary.byFacilityType).forEach(([type, count]) => {
    data.push({ 'Metric': `  ${type.charAt(0).toUpperCase() + type.slice(1)}`, 'Value': count });
  });
  data.push({ 'Metric': '', 'Value': '' });
  
  // Top Regions
  data.push({ 'Metric': 'TOP REGIONS', 'Value': '' });
  const topRegions = Object.entries(summary.byRegion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  topRegions.forEach(([region, count]) => {
    data.push({ 'Metric': `  ${region}`, 'Value': count });
  });
  data.push({ 'Metric': '', 'Value': '' });
  
  // Top Specialties
  data.push({ 'Metric': 'TOP SPECIALTIES', 'Value': '' });
  const topSpecialties = Object.entries(summary.bySpecialty)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  topSpecialties.forEach(([specialty, count]) => {
    data.push({ 'Metric': `  ${specialty}`, 'Value': count });
  });
  
  return data;
}

// Create region analysis sheet
function createRegionAnalysis(facilities: CleanedFacility[]): Record<string, string | number>[] {
  const regionData: Record<string, {
    total: number;
    hospitals: number;
    clinics: number;
    withDoctors: number;
    withBeds: number;
    withEmergency: number;
    avgCompleteness: number;
    totalCompleteness: number;
  }> = {};
  
  facilities.forEach(facility => {
    const region = facility.region || facility.city || 'Unknown';
    
    if (!regionData[region]) {
      regionData[region] = {
        total: 0,
        hospitals: 0,
        clinics: 0,
        withDoctors: 0,
        withBeds: 0,
        withEmergency: 0,
        avgCompleteness: 0,
        totalCompleteness: 0,
      };
    }
    
    regionData[region].total++;
    if (facility.facilityType === 'hospital') regionData[region].hospitals++;
    if (facility.facilityType === 'clinic') regionData[region].clinics++;
    if (facility.numberOfDoctors && facility.numberOfDoctors > 0) regionData[region].withDoctors++;
    if (facility.bedCapacity && facility.bedCapacity > 0) regionData[region].withBeds++;
    
    const emergencyKeywords = ['emergency', '24/7', '24 hour', 'trauma'];
    const allText = [...facility.capabilities, ...facility.specialties].join(' ').toLowerCase();
    if (emergencyKeywords.some(k => allText.includes(k))) regionData[region].withEmergency++;
    
    regionData[region].totalCompleteness += facility.dataCompletenessScore;
  });
  
  return Object.entries(regionData)
    .map(([region, data]) => ({
      'Region': region,
      'Total Facilities': data.total,
      'Hospitals': data.hospitals,
      'Clinics': data.clinics,
      'With Doctor Count': data.withDoctors,
      'With Bed Capacity': data.withBeds,
      'With Emergency Services': data.withEmergency,
      'Avg Data Completeness (%)': Math.round(data.totalCompleteness / data.total),
      'Medical Desert Risk': data.withEmergency === 0 ? 'HIGH' : data.hospitals === 0 ? 'MEDIUM' : 'LOW',
    }))
    .sort((a, b) => b['Total Facilities'] - a['Total Facilities']);
}

// Create data quality issues sheet
function createDataQualityIssues(facilities: CleanedFacility[]): Record<string, string | number>[] {
  return facilities
    .filter(f => f.dataCompletenessScore < 50 || !f.hasMedicalData)
    .map(f => ({
      'ID': f.id,
      'Name': f.name,
      'City': f.city,
      'Completeness Score (%)': f.dataCompletenessScore,
      'Has Address': f.hasCompleteAddress ? 'Yes' : 'No',
      'Has Contact': f.hasContactInfo ? 'Yes' : 'No',
      'Has Medical Data': f.hasMedicalData ? 'Yes' : 'No',
      'Has Capacity Data': f.hasCapacityData ? 'Yes' : 'No',
      'Issues': [
        !f.hasCompleteAddress && 'Missing Address',
        !f.hasContactInfo && 'No Contact Info',
        !f.hasMedicalData && 'No Medical Data',
        !f.hasCapacityData && 'No Capacity Data',
      ].filter(Boolean).join('; '),
    }))
    .sort((a, b) => (a['Completeness Score (%)'] as number) - (b['Completeness Score (%)'] as number));
}

// Export to Excel with multiple sheets
export function exportToExcel(facilities: CleanedFacility[], summary: DataSummary): void {
  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Sheet 1: Summary
  const summaryData = createSummaryData(summary);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Sheet 2: All Facilities (Cleaned)
  const facilitiesData = facilities.map(facilityToRow);
  const facilitiesSheet = XLSX.utils.json_to_sheet(facilitiesData);
  XLSX.utils.book_append_sheet(workbook, facilitiesSheet, 'All Facilities');
  
  // Sheet 3: Region Analysis (Medical Deserts)
  const regionData = createRegionAnalysis(facilities);
  const regionSheet = XLSX.utils.json_to_sheet(regionData);
  XLSX.utils.book_append_sheet(workbook, regionSheet, 'Region Analysis');
  
  // Sheet 4: Data Quality Issues
  const issuesData = createDataQualityIssues(facilities);
  const issuesSheet = XLSX.utils.json_to_sheet(issuesData);
  XLSX.utils.book_append_sheet(workbook, issuesSheet, 'Data Quality Issues');
  
  // Sheet 5: Hospitals Only
  const hospitalsData = facilities
    .filter(f => f.facilityType === 'hospital')
    .map(facilityToRow);
  const hospitalsSheet = XLSX.utils.json_to_sheet(hospitalsData);
  XLSX.utils.book_append_sheet(workbook, hospitalsSheet, 'Hospitals');
  
  // Sheet 6: Specialty Distribution
  const specialtyMap: Record<string, { count: number; facilities: string[] }> = {};
  facilities.forEach(f => {
    f.specialties.forEach(s => {
      if (!specialtyMap[s]) specialtyMap[s] = { count: 0, facilities: [] };
      specialtyMap[s].count++;
      if (specialtyMap[s].facilities.length < 5) {
        specialtyMap[s].facilities.push(f.name);
      }
    });
  });
  const specialtyData = Object.entries(specialtyMap)
    .map(([specialty, data]) => ({
      'Specialty': specialty,
      'Facility Count': data.count,
      'Sample Facilities': data.facilities.join('; '),
    }))
    .sort((a, b) => b['Facility Count'] - a['Facility Count']);
  const specialtySheet = XLSX.utils.json_to_sheet(specialtyData);
  XLSX.utils.book_append_sheet(workbook, specialtySheet, 'Specialties');
  
  // Generate and download
  const filename = `Virtue_Foundation_Ghana_Cleaned_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
