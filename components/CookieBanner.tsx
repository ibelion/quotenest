"use client";

import { useState, useEffect } from "react";
import styles from "./CookieBanner.module.css";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
    // Initialize analytics when user accepts
    // TODO: Call initAnalytics() when analytics is implemented
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.banner} role="dialog" aria-labelledby="cookie-banner-title" aria-live="polite">
      <div className={styles.content}>
        <h2 id="cookie-banner-title" className={styles.title}>
          Cookie Consent
        </h2>
        <p className={styles.description}>
          We use cookies and similar tracking technologies to improve your experience on our website.
          By clicking "Accept", you consent to our use of cookies. You can learn more in our{" "}
          <a href="/privacy" className={styles.link}>Privacy Policy</a>.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={handleAccept}
            className={styles.acceptButton}
            aria-label="Accept cookies"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className={styles.declineButton}
            aria-label="Decline cookies"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}

