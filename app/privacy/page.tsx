import type { Metadata } from "next";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy – QuoteNest",
  description: "Privacy Policy for QuoteNest. Learn how we collect, use, and protect your personal information.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: {new Date().toLocaleDateString()}</p>

        <section className={styles.section}>
          <h2>1. Introduction</h2>
          <p>
            QuoteNest ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our website
            and services.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Information You Provide</h3>
          <p>We collect information that you voluntarily provide to us when you:</p>
          <ul>
            <li>Submit a quote request form (name, email, phone, location, insurance type, coverage needs)</li>
            <li>Contact us through our website</li>
            <li>Subscribe to our newsletter or communications</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>We may automatically collect certain information about your device and usage patterns, including:</p>
          <ul>
            <li>IP address</li>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and respond to your quote requests</li>
            <li>Generate AI-powered insurance summaries</li>
            <li>Send you notifications and updates about your requests</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
            <li>Prevent fraud and ensure security</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or rent your personal information to third parties. We may share your
          information only in the following circumstances:</p>
          <ul>
            <li>With service providers who assist us in operating our website and conducting our business</li>
            <li>When required by law or to protect our rights</li>
            <li>In connection with a business transfer or merger</li>
            <li>With your explicit consent</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures to protect your personal
            information. However, no method of transmission over the Internet or electronic storage is 100%
            secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal information:</p>
          <ul>
            <li>Right to access your personal data</li>
            <li>Right to rectify inaccurate data</li>
            <li>Right to request deletion of your data</li>
            <li>Right to object to processing</li>
            <li>Right to data portability</li>
          </ul>
          <p>To exercise these rights, please contact us using the information provided in our Contact page.</p>
        </section>

        <section className={styles.section}>
          <h2>7. Cookies and Tracking Technologies</h2>
          <p>
            We may use cookies and similar tracking technologies to track activity on our website and store
            certain information. You can instruct your browser to refuse all cookies or to indicate when a
            cookie is being sent.
          </p>
        </section>

        <section className={styles.section}>
          <h2>8. Third-Party Services</h2>
          <p>
            Our website may contain links to third-party websites or services. We are not responsible for the
            privacy practices of these third parties. We encourage you to read their privacy policies.
          </p>
        </section>

        <section className={styles.section}>
          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under the age of 18. We do not knowingly collect
            personal information from children.
          </p>
        </section>

        <section className={styles.section}>
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting
            the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className={styles.section}>
          <h2>11. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us through our{" "}
            <a href="/contact" className={styles.link}>Contact page</a>.
          </p>
        </section>
      </main>
    </div>
  );
}

