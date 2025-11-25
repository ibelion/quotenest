/**
 * Environment configuration utility
 * Safely reads and validates environment variables
 * Values are lazy-loaded to avoid build-time errors
 */

const requiredEnvVars = [
  "OPENAI_API_KEY",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "FROM_EMAIL",
  "LEAD_TARGET_EMAIL",
] as const;

type EnvVar = (typeof requiredEnvVars)[number];

function getEnvVar(key: EnvVar, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvVarAsNumber(key: EnvVar, defaultValue?: number): number {
  const value = process.env[key];
  if (value) {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      throw new Error(`Invalid number for environment variable: ${key}`);
    }
    return num;
  }
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  throw new Error(`Missing required environment variable: ${key}`);
}

// Lazy-load environment variables to avoid build-time errors
export const env = {
  get openai() {
    return {
      get apiKey() {
        return getEnvVar("OPENAI_API_KEY");
      },
    };
  },
  get smtp() {
    return {
      get host() {
        return getEnvVar("SMTP_HOST");
      },
      get port() {
        return getEnvVarAsNumber("SMTP_PORT");
      },
      get user() {
        return getEnvVar("SMTP_USER");
      },
      get pass() {
        return getEnvVar("SMTP_PASS");
      },
    };
  },
  get email() {
    return {
      get from() {
        return getEnvVar("FROM_EMAIL");
      },
      get leadTarget() {
        return getEnvVar("LEAD_TARGET_EMAIL");
      },
    };
  },
};

