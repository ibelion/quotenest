import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Terms of Service – QuoteNest",
  description: "Terms of Service for QuoteNest. Read our terms and conditions for using our insurance quote services.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>

        <section className={styles.section}>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using QuoteNest ("the Service"), you accept and agree to be bound by the terms
            and provision of this agreement. If you do not agree to abide by the above, please do not use
            this service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Description of Service</h2>
          <p>
            QuoteNest provides an online platform that allows users to request insurance quotes and receive
            AI-generated coverage summaries. The Service is for informational purposes only and does not
            constitute a binding insurance quote or offer.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. User Responsibilities</h2>
          <p>As a user of the Service, you agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information when submitting quote requests</li>
            <li>Maintain and promptly update your information to keep it accurate</li>
            <li>Not use the Service for any unlawful purpose or in any way that could damage, disable, or
            impair the Service</li>
            <li>Not attempt to gain unauthorized access to any portion of the Service</li>
            <li>Not transmit any viruses, malware, or other harmful code</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. AI-Generated Content Disclaimer</h2>
          <p>
            The AI-generated insurance summaries provided by QuoteNest are for informational purposes only.
            They do not constitute:
          </p>
          <ul>
            <li>Legal, financial, or insurance advice</li>
            <li>A binding insurance quote or offer</li>
            <li>Guaranteed coverage or pricing</li>
            <li>Recommendations from licensed insurance professionals</li>
          </ul>
          <p>
            All coverage decisions must be made through a licensed insurance agent after proper underwriting.
            QuoteNest is not responsible for any decisions made based on AI-generated summaries.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by QuoteNest and are
            protected by international copyright, trademark, patent, trade secret, and other intellectual
            property laws.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, QuoteNest shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, or any loss of profits or revenues,
            whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible
            losses resulting from your use of the Service.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Indemnification</h2>
          <p>
            You agree to defend, indemnify, and hold harmless QuoteNest and its officers, directors,
            employees, and agents from and against any claims, liabilities, damages, losses, and expenses,
            including reasonable attorneys' fees, arising out of or in any way connected with your use of the
            Service or violation of these Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your access to the Service immediately, without prior notice or
            liability, for any reason, including if you breach the Terms. Upon termination, your right to use
            the Service will cease immediately.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If
            a revision is material, we will try to provide at least 30 days notice prior to any new terms
            taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in
            which QuoteNest operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us through our{" "}
            <a href="/contact" className={styles.link}>Contact page</a>.
          </p>
        </section>
      </main>
    </div>
  );
}

