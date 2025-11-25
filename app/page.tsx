"use client";

import { useState, FormEvent, useEffect } from "react";
import styles from "./page.module.css";
import StructuredData from "@/components/StructuredData";
import { getRecaptchaSiteKey, isRecaptchaConfigured } from "@/lib/recaptcha";
import type {
  LeadFormData,
  LeadAPIResponse,
  InsuranceType,
} from "@/types/lead";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

type FormState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [formData, setFormData] = useState<Partial<LeadFormData>>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    insuranceType: "Auto",
    currentProvider: "",
    currentPremium: "",
    coverageNeeds: "",
    notes: "",
  });

  // Load reCAPTCHA if configured
  useEffect(() => {
    if (!isRecaptchaConfigured()) {
      return;
    }

    const siteKey = getRecaptchaSiteKey();
    if (!siteKey) {
      return;
    }

    // Check if already loaded
    if (window.grecaptcha && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        setRecaptchaReady(true);
      });
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          setRecaptchaReady(true);
        });
      }
    };
    document.head.appendChild(script);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMessage("");

    // Get reCAPTCHA token if configured
    let recaptchaToken: string | null = null;
    if (isRecaptchaConfigured() && recaptchaReady) {
      try {
        const siteKey = getRecaptchaSiteKey();
        if (siteKey && window.grecaptcha) {
          await new Promise<void>((resolve) => {
            window.grecaptcha.ready(() => {
              resolve();
            });
          });
          recaptchaToken = await window.grecaptcha.execute(siteKey, {
            action: "submit",
          });
        }
      } catch (error) {
        console.error("Failed to get reCAPTCHA token:", error);
        // Continue without token in case of error (for better UX)
      }
    }

    try {
      const payload = {
        ...formData,
        ...(recaptchaToken && { recaptchaToken }),
      };

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: LeadAPIResponse = await response.json();

      if (data.status === "error") {
        setFormState("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      } else {
        setFormState("success");
        // Reset form on success
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          location: "",
          insuranceType: "Auto",
          currentProvider: "",
          currentPremium: "",
          coverageNeeds: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormState("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <StructuredData type="Service" />
      <div className={styles.container}>
        <main id="main-content" className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            QuoteNest – Smarter Insurance Quotes
          </h1>
          <p className={styles.heroSubtitle}>
            Compare insurance options and get AI-generated coverage summaries.
          </p>
        </section>

        <section className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName" className={styles.label}>
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className={styles.input}
                disabled={formState === "loading"}
                aria-required="true"
                aria-describedby={formState === "error" ? "error-message" : undefined}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Email <span className={styles.required}>*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.input}
                disabled={formState === "loading"}
                aria-required="true"
                aria-describedby={formState === "error" ? "error-message" : undefined}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.label}>Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                disabled={formState === "loading"}
                aria-label="Phone number (optional)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location" className={styles.label}>
                Location (City/State) <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className={styles.input}
                placeholder="e.g., New York, NY"
                disabled={formState === "loading"}
                aria-required="true"
                aria-describedby={formState === "error" ? "error-message" : undefined}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="insuranceType" className={styles.label}>
                Insurance Type <span className={styles.required}>*</span>
              </label>
              <select
                id="insuranceType"
                name="insuranceType"
                value={formData.insuranceType}
                onChange={handleInputChange}
                required
                className={styles.select}
                disabled={formState === "loading"}
                aria-required="true"
                aria-describedby={formState === "error" ? "error-message" : undefined}
              >
                <option value="Auto">Auto</option>
                <option value="Home">Home</option>
                <option value="Renters">Renters</option>
                <option value="Life">Life</option>
                <option value="Health">Health</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currentProvider" className={styles.label}>
                Current Provider
              </label>
              <input
                type="text"
                id="currentProvider"
                name="currentProvider"
                value={formData.currentProvider}
                onChange={handleInputChange}
                className={styles.input}
                disabled={formState === "loading"}
                aria-label="Current insurance provider (optional)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currentPremium" className={styles.label}>
                Current Premium
              </label>
              <input
                type="text"
                id="currentPremium"
                name="currentPremium"
                value={formData.currentPremium}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="e.g., $1,200/year"
                disabled={formState === "loading"}
                aria-label="Current premium amount (optional)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="coverageNeeds" className={styles.label}>
                What are you looking for? <span className={styles.required}>*</span>
              </label>
              <textarea
                id="coverageNeeds"
                name="coverageNeeds"
                value={formData.coverageNeeds}
                onChange={handleInputChange}
                required
                rows={4}
                className={styles.textarea}
                disabled={formState === "loading"}
                aria-required="true"
                aria-describedby={formState === "error" ? "error-message" : undefined}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes" className={styles.label}>
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className={styles.textarea}
                placeholder="Extra info, claims history, etc."
                disabled={formState === "loading"}
                aria-label="Additional notes (optional)"
              />
            </div>

            {formState === "error" && (
              <div id="error-message" className={styles.errorMessage} role="alert" aria-live="polite">
                {errorMessage}
              </div>
            )}

            {formState === "success" && (
              <div className={styles.successMessage} role="status" aria-live="polite">
                Thanks! We'll review your info and contact you shortly.
              </div>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={formState === "loading"}
              aria-label={formState === "loading" ? "Submitting your request" : "Submit quote request"}
            >
              {formState === "loading"
                ? "Submitting your request…"
                : "Submit Quote Request"}
            </button>
          </form>
        </section>
      </main>
    </div>
    </>
  );
}
