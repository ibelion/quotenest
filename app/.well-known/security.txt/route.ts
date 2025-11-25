import { NextResponse } from "next/server";

/**
 * Security.txt endpoint
 * RFC 9116: https://www.rfc-editor.org/rfc/rfc9116.html
 * Served at /.well-known/security.txt
 */
export async function GET() {
  const securityText = `Contact: mailto:security@quotenest.com
Expires: 2025-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://quotenest.com/.well-known/security.txt
Policy: https://quotenest.com/privacy
Acknowledgments: https://quotenest.com/contact

# Security Policy
# Report security vulnerabilities responsibly
# We appreciate responsible disclosure of security issues
`;

  return new NextResponse(securityText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400", // Cache for 24 hours
    },
  });
}

