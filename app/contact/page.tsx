import type { Metadata } from "next";
import styles from "./page.module.css";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: "Contact Us – QuoteNest",
  description: "Get in touch with QuoteNest. Contact us for questions, support, or feedback about our insurance quote services.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <>
      <StructuredData type="ContactPage" />
      <div className={styles.container}>
        <main className={styles.main}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.subtitle}>
          Have questions or need assistance? We're here to help.
        </p>

        <section className={styles.section}>
          <h2>Get in Touch</h2>
          <p>
            For general inquiries, support, or feedback about QuoteNest, please use the contact information
            below or submit a quote request through our{" "}
            <a href="/" className={styles.link}>homepage</a>.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Contact Information</h2>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <h3>Email</h3>
              <p>
                <a href="mailto:support@quotenest.com" className={styles.link}>
                  support@quotenest.com
                </a>
              </p>
            </div>

            <div className={styles.contactItem}>
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 5:00 PM EST</p>
              <p>Saturday - Sunday: Closed</p>
            </div>

            <div className={styles.contactItem}>
              <h3>Response Time</h3>
              <p>We typically respond to inquiries within 1-2 business days.</p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Privacy & Data Requests</h2>
          <p>
            For privacy-related inquiries, data access requests, or to exercise your rights under applicable
            privacy laws, please contact us at{" "}
            <a href="mailto:privacy@quotenest.com" className={styles.link}>
              privacy@quotenest.com
            </a>
            . Please review our{" "}
            <a href="/privacy" className={styles.link}>Privacy Policy</a> for more information.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Legal & Terms</h2>
          <p>
            For questions about our Terms of Service or legal matters, please review our{" "}
            <a href="/terms" className={styles.link}>Terms of Service</a> or contact us at{" "}
            <a href="mailto:legal@quotenest.com" className={styles.link}>
              legal@quotenest.com
            </a>
            .
          </p>
        </section>

        <section className={styles.section}>
          <h2>Quote Requests</h2>
          <p>
            To request an insurance quote, please use our{" "}
            <a href="/" className={styles.link}>quote request form</a> on the homepage. Our system will
            process your request and generate an AI-powered summary of your coverage needs.
          </p>
        </section>
      </main>
    </div>
    </>
  );
}

