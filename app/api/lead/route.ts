import { NextRequest, NextResponse } from "next/server";
import { generateInsuranceSummary } from "@/lib/openai";
import { sendLeadEmail, type InsuranceSummary } from "@/lib/email";
import type {
  LeadFormData,
  LeadAPIResponse,
  InsuranceType,
} from "@/types/lead";

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates the lead form data
 */
function validateLeadData(data: unknown): {
  isValid: boolean;
  data?: LeadFormData;
  errors?: Record<string, string>;
} {
  if (typeof data !== "object" || data === null) {
    return {
      isValid: false,
      errors: { general: "Invalid request body" },
    };
  }

  const formData = data as Record<string, unknown>;
  const errors: Record<string, string> = {};

  // Required fields
  if (!formData.fullName || typeof formData.fullName !== "string") {
    errors.fullName = "Full name is required";
  }

  if (!formData.email || typeof formData.email !== "string") {
    errors.email = "Email is required";
  } else if (!isValidEmail(formData.email)) {
    errors.email = "Invalid email format";
  }

  if (!formData.location || typeof formData.location !== "string") {
    errors.location = "Location is required";
  }

  if (
    !formData.insuranceType ||
    typeof formData.insuranceType !== "string" ||
    !["Auto", "Home", "Renters", "Life", "Health", "Business"].includes(
      formData.insuranceType
    )
  ) {
    errors.insuranceType = "Valid insurance type is required";
  }

  if (!formData.coverageNeeds || typeof formData.coverageNeeds !== "string") {
    errors.coverageNeeds = "Coverage needs description is required";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  // Build validated data object
  const validatedData: LeadFormData = {
    fullName: formData.fullName as string,
    email: formData.email as string,
    location: formData.location as string,
    insuranceType: formData.insuranceType as InsuranceType,
    coverageNeeds: formData.coverageNeeds as string,
    phone: formData.phone as string | undefined,
    currentProvider: formData.currentProvider as string | undefined,
    currentPremium: formData.currentPremium as string | undefined,
    notes: formData.notes as string | undefined,
  };

  return { isValid: true, data: validatedData };
}

/**
 * POST /api/lead
 * Handles lead form submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse<LeadAPIResponse>> {
  try {
    const body = await request.json();
    const validation = validateLeadData(body);

    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          status: "error",
          error: "ValidationError",
          details: validation.errors,
        } as LeadAPIResponse,
        { status: 400 }
      );
    }

    const formData = validation.data;

    // Generate AI summary (non-blocking - continue even if it fails)
    let summary: InsuranceSummary | null = null;
    try {
      summary = await generateInsuranceSummary(formData);
    } catch (error) {
      console.error("[lead] Failed to generate AI summary:", error);
      summary = null;
    }

    // Send email notification (non-blocking - continue even if it fails)
    let emailError: string | null = null;
    try {
      await sendLeadEmail(formData, summary);
    } catch (error) {
      console.error("[lead] Email sending failed:", error);
      emailError = "Failed to send notification email";
    }

    // Return success response
    const response: LeadAPIResponse = {
      status: "ok",
      message: emailError
        ? "Lead received, but we had an issue sending notification email."
        : "Lead received",
      hasSummary: summary !== null,
    };

    if (summary) {
      response.summary = summary;
    }

    if (emailError) {
      response.emailError = emailError;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error processing lead request:", error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid request format",
        } as LeadAPIResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        status: "error",
        error: "An unexpected error occurred. Please try again later.",
      } as LeadAPIResponse,
      { status: 500 }
    );
  }
}

