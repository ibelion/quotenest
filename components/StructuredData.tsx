/**
 * Structured Data (JSON-LD) Component
 * Adds schema.org markup for better SEO
 */

interface StructuredDataProps {
  type: "Organization" | "WebSite" | "Service" | "ContactPage";
  data?: Record<string, unknown>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quotenest.com";

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
    };

    switch (type) {
      case "Organization":
        return {
          ...baseData,
          "@type": "Organization",
          name: "QuoteNest",
          url: siteUrl,
          logo: `${siteUrl}/logo.png`,
          description: "Compare insurance options and get AI-generated coverage summaries.",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-XXX-XXX-XXXX",
            contactType: "customer service",
            email: "support@quotenest.com",
            availableLanguage: ["English"],
          },
          sameAs: [
            // Add social media URLs when available
            // "https://twitter.com/quotenest",
            // "https://facebook.com/quotenest",
          ],
        };

      case "WebSite":
        return {
          ...baseData,
          "@type": "WebSite",
          name: "QuoteNest",
          url: siteUrl,
          description: "Compare insurance options and get AI-generated coverage summaries.",
          publisher: {
            "@type": "Organization",
            name: "QuoteNest",
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${siteUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        };

      case "Service":
        return {
          ...baseData,
          "@type": "Service",
          serviceType: "Insurance Quote Comparison Service",
          name: "QuoteNest Insurance Quotes",
          description: "Compare insurance options and get AI-generated coverage summaries.",
          provider: {
            "@type": "Organization",
            name: "QuoteNest",
            url: siteUrl,
          },
          areaServed: {
            "@type": "Country",
            name: "United States",
          },
          availableChannel: {
            "@type": "ServiceChannel",
            serviceUrl: siteUrl,
            serviceType: "Online",
          },
        };

      case "ContactPage":
        return {
          ...baseData,
          "@type": "ContactPage",
          name: "Contact Us – QuoteNest",
          description: "Get in touch with QuoteNest. Contact us for questions, support, or feedback about our insurance quote services.",
          mainEntity: {
            "@type": "Organization",
            name: "QuoteNest",
            email: "support@quotenest.com",
            contactPoint: {
              "@type": "ContactPoint",
              email: "support@quotenest.com",
              contactType: "customer service",
              availableLanguage: ["English"],
            },
          },
        };

      default:
        return baseData;
    }
  };

  const structuredData = { ...getStructuredData(), ...data };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

