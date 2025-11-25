/**
 * reCAPTCHA validation utility
 * Implements Google reCAPTCHA v3 verification
 */

// reCAPTCHA site key (set via environment variable)
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_MIN_SCORE = 0.5; // Minimum score for reCAPTCHA v3 (0.0 to 1.0)

/**
 * Verify reCAPTCHA token on the server side
 * Supports both reCAPTCHA v2 and v3
 * 
 * @param token - reCAPTCHA token from client
 * @param remoteip - Optional: IP address of the user (for better bot detection)
 * @returns Promise<boolean> - true if verification succeeds
 */
export async function verifyRecaptcha(
  token: string | null | undefined,
  remoteip?: string
): Promise<boolean> {
  if (!RECAPTCHA_SECRET_KEY) {
    // In development, allow requests if reCAPTCHA is not configured
    if (process.env.NODE_ENV === "development") {
      console.warn("[recaptcha] reCAPTCHA not configured - allowing in development");
      return true;
    }
    // In production, fail if reCAPTCHA is required but not configured
    console.error("[recaptcha] reCAPTCHA_SECRET_KEY not configured in production");
    return false;
  }

  if (!token || typeof token !== "string" || token.length === 0) {
    console.warn("[recaptcha] No token provided");
    return false;
  }

  try {
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token,
    });

    if (remoteip) {
      params.append("remoteip", remoteip);
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      console.error("[recaptcha] reCAPTCHA API request failed:", response.status);
      return false;
    }

    const data = await response.json();

    if (!data.success) {
      console.warn("[recaptcha] Verification failed:", data["error-codes"]);
      return false;
    }

    // For reCAPTCHA v3, check the score
    if (data.score !== undefined) {
      if (data.score < RECAPTCHA_MIN_SCORE) {
        console.warn(
          `[recaptcha] Score ${data.score} below minimum ${RECAPTCHA_MIN_SCORE}`
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("[recaptcha] Error verifying reCAPTCHA:", error);
    // On error, fail securely (don't allow the request)
    return false;
  }
}

/**
 * Get reCAPTCHA site key for client-side use
 * @returns reCAPTCHA site key or undefined
 */
export function getRecaptchaSiteKey(): string | undefined {
  return RECAPTCHA_SITE_KEY;
}

/**
 * Check if reCAPTCHA is configured
 * @returns true if reCAPTCHA is configured
 */
export function isRecaptchaConfigured(): boolean {
  return !!RECAPTCHA_SITE_KEY && !!RECAPTCHA_SECRET_KEY;
}

