import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { verifyRecaptcha } from "@/lib/recaptcha";
import type {
  LeadFormData,
  LeadAPIResponse,
  InsuranceType,
  InsuranceSummary,
} from "@/types/lead";

export const runtime = "edge";

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
 * Generates an AI-powered insurance summary using OpenAI API (Edge-compatible)
 * Returns null if the OpenAI call fails
 */
async function generateInsuranceSummary(
  formData: LeadFormData
): Promise<InsuranceSummary | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[lead] OPENAI_API_KEY not configured");
      return null;
    }

    const prompt = `You are an experienced insurance agent helping to generate a preliminary, non-binding insurance summary for a potential client. 

IMPORTANT DISCLAIMER: This summary is for informational purposes only and does not constitute legal advice, guaranteed coverage, or a binding insurance quote. All coverage decisions must be made through a licensed insurance agent after proper underwriting.

Client Information:
- Name: ${formData.fullName}
- Location: ${formData.location}
- Insurance Type: ${formData.insuranceType}
${formData.currentProvider ? `- Current Provider: ${formData.currentProvider}` : ""}
${formData.currentPremium ? `- Current Premium: ${formData.currentPremium}` : ""}
${formData.phone ? `- Phone: ${formData.phone}` : ""}

Coverage Needs:
${formData.coverageNeeds}

${formData.notes ? `Additional Notes:\n${formData.notes}` : ""}

Please generate a structured insurance summary in JSON format with the following structure:
{
  "overview": "A 2-3 sentence overview of the client's insurance situation and needs",
  "recommendedCoverages": ["List of 3-5 recommended coverage types or features that might be relevant"],
  "keyRiskFactors": ["List of 2-4 key risk factors or considerations for this client"],
  "savingsOrConsiderations": ["List of 2-4 potential savings opportunities or important considerations"]
}

Remember to include a brief disclaimer in the overview that this is non-binding and for informational purposes only.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional insurance agent assistant. Generate clear, helpful, and accurate insurance summaries. Always include appropriate disclaimers about non-binding nature of information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("[lead] OpenAI API request failed:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("[lead] OpenAI returned empty response");
      return null;
    }

    const parsed = JSON.parse(content) as InsuranceSummary;

    // Validate the structure
    if (
      typeof parsed.overview === "string" &&
      Array.isArray(parsed.recommendedCoverages) &&
      Array.isArray(parsed.keyRiskFactors) &&
      Array.isArray(parsed.savingsOrConsiderations)
    ) {
      return parsed;
    }

    console.error("[lead] OpenAI returned invalid structure:", parsed);
    return null;
  } catch (error) {
    console.error("[lead] Error generating insurance summary:", error);
    return null;
  }
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

    // Log lead information (email sending disabled in Edge runtime)
    console.log("[lead] New lead received:", {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      insuranceType: formData.insuranceType,
      currentProvider: formData.currentProvider,
      currentPremium: formData.currentPremium,
      coverageNeeds: formData.coverageNeeds,
      notes: formData.notes,
      hasSummary: summary !== null,
      summaryGenerated: summary !== null,
    });

    // Return success response
    const response: LeadAPIResponse = {
      status: "ok",
      message: "Lead received. Note: Email notifications are currently disabled in this deployment.",
      hasSummary: summary !== null,
    };

    if (summary) {
      response.summary = summary;
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

