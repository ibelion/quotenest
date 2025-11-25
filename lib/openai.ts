import OpenAI from "openai";
import { env } from "./env";
import type { LeadFormData, InsuranceSummary } from "@/types/lead";

function getOpenAIClient() {
  return new OpenAI({
    apiKey: env.openai.apiKey,
  });
}

/**
 * Generates an AI-powered insurance summary based on form data
 * Returns null if the OpenAI call fails
 */
export async function generateInsuranceSummary(
  formData: LeadFormData
): Promise<InsuranceSummary | null> {
  try {
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

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
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
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("OpenAI returned empty response");
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

    console.error("OpenAI returned invalid structure:", parsed);
    return null;
  } catch (error) {
    console.error("Error generating insurance summary:", error);
    return null;
  }
}

