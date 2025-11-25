import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <nav className={styles.nav} aria-label="Footer navigation">
        <Link href="/privacy" className={styles.link}>
          Privacy Policy
        </Link>
        <span className={styles.separator}>•</span>
        <Link href="/terms" className={styles.link}>
          Terms of Service
        </Link>
        <span className={styles.separator}>•</span>
        <Link href="/contact" className={styles.link}>
          Contact
        </Link>
      </nav>
      <p className={styles.copyright}>
        © {new Date().getFullYear()} QuoteNest. All rights reserved.
      </p>
    </footer>
  );
}

