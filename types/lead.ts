/**
 * Type definitions for lead form data and API responses
 */

export type InsuranceType =
  | "Auto"
  | "Home"
  | "Renters"
  | "Life"
  | "Health"
  | "Business";

export interface LeadFormData {
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  insuranceType: InsuranceType;
  currentProvider?: string;
  currentPremium?: string;
  coverageNeeds: string;
  notes?: string;
}

export interface InsuranceSummary {
  overview: string;
  recommendedCoverages: string[];
  keyRiskFactors: string[];
  savingsOrConsiderations: string[];
  disclaimer?: string;
}

export interface LeadAPISuccessResponse {
  status: "ok";
  message: string;
  hasSummary: boolean;
  summary?: InsuranceSummary;
  emailError?: string;
}

export interface LeadAPIErrorResponse {
  status: "error";
  error: string;
  details?: Record<string, unknown>;
}

export type LeadAPIResponse = LeadAPISuccessResponse | LeadAPIErrorResponse;

