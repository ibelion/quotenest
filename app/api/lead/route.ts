import { NextRequest, NextResponse } from "next/server";
import { generateInsuranceSummary } from "@/lib/openai";
import { sendLeadEmail, type InsuranceSummary } from "@/lib/email";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { verifyRecaptcha } from "@/lib/recaptcha";
import type {
  LeadFormData,
  LeadAPIResponse,
  InsuranceType,
} from "@/types/lead";

// Maximum request body size (1MB)
const MAX_REQUEST_SIZE = 1024 * 1024;

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

    // Build validated data object and sanitize inputs
    const validatedData: LeadFormData = {
      fullName: sanitizeString(formData.fullName as string),
      email: sanitizeString(formData.email as string),
      location: sanitizeString(formData.location as string),
      insuranceType: formData.insuranceType as InsuranceType,
      coverageNeeds: sanitizeString(formData.coverageNeeds as string),
      phone: formData.phone ? sanitizeString(formData.phone as string) : undefined,
      currentProvider: formData.currentProvider
        ? sanitizeString(formData.currentProvider as string)
        : undefined,
      currentPremium: formData.currentPremium
        ? sanitizeString(formData.currentPremium as string)
        : undefined,
      notes: formData.notes ? sanitizeString(formData.notes as string) : undefined,
    };

  return { isValid: true, data: validatedData };
}

/**
 * CSRF protection: Check Origin header
 */
function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  
  // In production, verify origin matches site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quotenest.com";
  
  if (process.env.NODE_ENV === "production") {
    // Check origin header
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const siteUrlObj = new URL(siteUrl);
        if (originUrl.origin !== siteUrlObj.origin) {
          return false;
        }
      } catch {
        return false;
      }
    } else if (referer) {
      // Fallback to referer if origin is missing
      try {
        const refererUrl = new URL(referer);
        const siteUrlObj = new URL(siteUrl);
        if (refererUrl.origin !== siteUrlObj.origin) {
          return false;
        }
      } catch {
        return false;
      }
    } else {
      // No origin or referer in production is suspicious
      return false;
    }
  }
  
  return true;
}

/**
 * POST /api/lead
 * Handles lead form submissions
 */
export async function POST(request: NextRequest): Promise<NextResponse<LeadAPIResponse>> {
  try {
    // CSRF protection: Verify Origin header
    if (!verifyOrigin(request)) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid request origin",
        } as LeadAPIResponse,
        { status: 403 }
      );
    }

    // Rate limiting: 10 requests per 15 minutes per IP
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          status: "error",
          error: "Too many requests. Please try again later.",
        } as LeadAPIResponse,
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const rateLimitHeaders = {
      "X-RateLimit-Limit": "10",
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString(),
    };

    // Verify Content-Type header
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid content type",
        } as LeadAPIResponse,
        { status: 400 }
      );
    }

    // Check Content-Length for request size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > MAX_REQUEST_SIZE) {
        return NextResponse.json(
          {
            status: "error",
            error: "Request too large",
          } as LeadAPIResponse,
          { status: 413 }
        );
      }
    }

    // Read and parse request body with size limit
    let bodyText: string;
    try {
      bodyText = await request.text();
      
      // Check actual body size
      if (bodyText.length > MAX_REQUEST_SIZE) {
        return NextResponse.json(
          {
            status: "error",
            error: "Request too large",
          } as LeadAPIResponse,
          { status: 413 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          status: "error",
          error: "Failed to read request body",
        } as LeadAPIResponse,
        { status: 400 }
      );
    }

    let body: unknown;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      return NextResponse.json(
        {
          status: "error",
          error: "Invalid JSON format",
        } as LeadAPIResponse,
        { status: 400 }
      );
    }

    // Verify reCAPTCHA token
    const recaptchaToken = (body as Record<string, unknown>)?.recaptchaToken;
    if (process.env.NODE_ENV === "production" || process.env.ENABLE_RECAPTCHA === "true") {
      const clientIp = getClientIdentifier(request);
      const isRecaptchaValid = await verifyRecaptcha(
        typeof recaptchaToken === "string" ? recaptchaToken : null,
        clientIp !== "unknown" ? clientIp : undefined
      );
      
      if (!isRecaptchaValid) {
        return NextResponse.json(
          {
            status: "error",
            error: "reCAPTCHA verification failed",
          } as LeadAPIResponse,
          { status: 400 }
        );
      }
    }

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

    return NextResponse.json(response, {
      status: 200,
      headers: rateLimitHeaders,
    });
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

