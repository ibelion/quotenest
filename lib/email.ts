// lib/email.ts

import nodemailer from "nodemailer";

export type InsuranceSummary = {
  overview: string;
  recommendedCoverages: string[];
  keyRiskFactors: string[];
  savingsOrConsiderations: string[];
  disclaimer?: string;
};

export type LeadFormData = {
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  insuranceType: string;
  currentProvider?: string;
  currentPremium?: string;
  coverageNeeds: string;
  notes?: string;
};

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL;
const leadTargetEmail = process.env.LEAD_TARGET_EMAIL;

const emailConfigured =
  !!smtpHost &&
  !!smtpPort &&
  !!smtpUser &&
  !!smtpPass &&
  !!fromEmail &&
  !!leadTargetEmail;

// secure: true for port 465, false otherwise
const transporter = emailConfigured
  ? nodemailer.createTransport({
      host: smtpHost!,
      port: smtpPort!,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser!,
        pass: smtpPass!,
      },
    })
  : null;

export async function verifyEmailTransporter() {
  if (!emailConfigured || !transporter) {
    console.warn("[email] SMTP not configured. Skipping verification.");
    return;
  }
  try {
    await transporter.verify();
    console.log("[email] SMTP transporter verified successfully.");
  } catch (err) {
    console.error("[email] Failed to verify SMTP transporter:", err);
  }
}

export async function sendLeadEmail(
  formData: LeadFormData,
  summary: InsuranceSummary | null
): Promise<void> {
  if (!emailConfigured || !transporter) {
    console.warn("[email] SMTP not configured. Skipping email send.");
    return;
  }

  const {
    fullName,
    email,
    phone,
    location,
    insuranceType,
    currentProvider,
    currentPremium,
    coverageNeeds,
    notes,
  } = formData;

  const plainSummary = summary
    ? [
        "AI Insurance Summary:",
        "",
        `Overview:`,
        summary.overview || "N/A",
        "",
        `Recommended Coverages:`,
        ...(summary.recommendedCoverages?.length
          ? summary.recommendedCoverages.map((c) => `- ${c}`)
          : ["- N/A"]),
        "",
        `Key Risk Factors:`,
        ...(summary.keyRiskFactors?.length
          ? summary.keyRiskFactors.map((r) => `- ${r}`)
          : ["- N/A"]),
        "",
        `Savings / Considerations:`,
        ...(summary.savingsOrConsiderations?.length
          ? summary.savingsOrConsiderations.map((s) => `- ${s}`)
          : ["- N/A"]),
        "",
        `Disclaimer:`,
        summary.disclaimer ??
          "This is an AI-generated, non-binding summary for informational purposes only. It is not legal, financial, or coverage advice.",
      ].join("\n")
    : "AI summary not available (generation failed or was skipped).";

  const textBody = [
    "New QuoteNest Lead",
    "===================",
    "",
    `Full Name: ${fullName}`,
    `Email: ${email}`,
    `Phone: ${phone || "N/A"}`,
    `Location: ${location}`,
    `Insurance Type: ${insuranceType}`,
    `Current Provider: ${currentProvider || "N/A"}`,
    `Current Premium: ${currentPremium || "N/A"}`,
    "",
    "Coverage Needs:",
    coverageNeeds,
    "",
    "Additional Notes:",
    notes || "N/A",
    "",
    "----------------------------------",
    "",
    plainSummary,
  ].join("\n");

  const htmlSummary = summary
    ? `
      <h2>AI Insurance Summary</h2>
      <p><strong>Overview:</strong> ${summary.overview || "N/A"}</p>
      <h3>Recommended Coverages</h3>
      <ul>
        ${
          summary.recommendedCoverages?.length
            ? summary.recommendedCoverages.map((c) => `<li>${c}</li>`).join("")
            : "<li>N/A</li>"
        }
      </ul>
      <h3>Key Risk Factors</h3>
      <ul>
        ${
          summary.keyRiskFactors?.length
            ? summary.keyRiskFactors.map((r) => `<li>${r}</li>`).join("")
            : "<li>N/A</li>"
        }
      </ul>
      <h3>Savings / Considerations</h3>
      <ul>
        ${
          summary.savingsOrConsiderations?.length
            ? summary.savingsOrConsiderations.map((s) => `<li>${s}</li>`).join("")
            : "<li>N/A</li>"
        }
      </ul>
      <p><strong>Disclaimer:</strong> ${
        summary.disclaimer ??
        "This is an AI-generated, non-binding summary for informational purposes only. It is not legal, financial, or coverage advice."
      }</p>
    `
    : `
      <h2>AI Insurance Summary</h2>
      <p>AI summary is not available (generation failed or was skipped).</p>
    `;

  const htmlBody = `
    <h1>New QuoteNest Lead</h1>
    <p><strong>Full Name:</strong> ${fullName}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Insurance Type:</strong> ${insuranceType}</p>
    <p><strong>Current Provider:</strong> ${currentProvider || "N/A"}</p>
    <p><strong>Current Premium:</strong> ${currentPremium || "N/A"}</p>
    <p><strong>Coverage Needs:</strong><br/>${coverageNeeds}</p>
    <p><strong>Additional Notes:</strong><br/>${notes || "N/A"}</p>
    <hr/>
    ${htmlSummary}
  `;

  try {
    const info = await transporter.sendMail({
      from: fromEmail!,
      to: leadTargetEmail!,
      subject: `New QuoteNest Lead – ${fullName} – ${insuranceType}`,
      text: textBody,
      html: htmlBody,
    });

    console.log("[email] Lead notification email sent successfully:", info.messageId);
  } catch (err) {
    console.error("[email] Failed to send lead notification email (nodemailer error):", err);
    // Re-throw a clean error that the API route can catch
    throw new Error("Failed to send lead notification email");
  }
}
