# QuoteNest

**QuoteNest – Smarter Insurance Quotes**

Compare insurance options and get AI-generated coverage summaries. QuoteNest is a Next.js application that helps users request insurance quotes and receive AI-powered summaries of their coverage needs.

## Features

- **Landing Page**: Clean, modern interface with a comprehensive quote request form
- **AI-Powered Summaries**: Uses OpenAI to generate personalized insurance summaries
- **Email Notifications**: Automatically sends lead notifications via SMTP
- **Form Validation**: Client-side and server-side validation for all form fields
- **TypeScript**: Fully typed for better developer experience and reliability

## Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- SMTP server credentials (Gmail, SendGrid, AWS SES, etc.)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd quotenest
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` and fill in all required environment variables (see below).

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@quotenest.com
LEAD_TARGET_EMAIL=leads@quotenest.com
```

### Environment Variable Details

- **OPENAI_API_KEY**: Your OpenAI API key for generating insurance summaries
- **SMTP_HOST**: Your SMTP server hostname (e.g., `smtp.gmail.com`, `smtp.sendgrid.net`)
- **SMTP_PORT**: SMTP server port (typically `587` for TLS or `465` for SSL)
- **SMTP_USER**: SMTP authentication username
- **SMTP_PASS**: SMTP authentication password
- **FROM_EMAIL**: Email address to send notifications from
- **LEAD_TARGET_EMAIL**: Email address where lead notifications will be sent

### Example SMTP Configurations

**Gmail:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

**SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will auto-update as you edit files in the `app` directory.

## Building for Production

Build the application:

```bash
npm run build
# or
yarn build
# or
pnpm build
```

Start the production server:

```bash
npm start
# or
yarn start
# or
pnpm start
```

## Deployment

### Cloudflare Pages

This project is configured to deploy on Cloudflare Pages using `@cloudflare/next-on-pages`.

**Cloudflare Pages Build Settings:**

- **Framework preset:** Next.js
- **Build command:** `npm run build:cf`
- **Build output directory:** `.vercel/output/static`

The `build:cf` script runs the standard Next.js build followed by `@cloudflare/next-on-pages`, which generates the output structure in `.vercel/output/static` that Cloudflare Pages serves.

**Local Testing:**

To test the Cloudflare build locally:

```bash
npm run build:cf
```

This will create the `.vercel/output/static` directory with the optimized build output for Cloudflare Pages.

**Note:** The `@cloudflare/next-on-pages` tool requires bash and may not work on Windows. This is not an issue on Cloudflare Pages, which runs builds in a Linux environment. The Next.js build step (`next build`) will complete successfully on all platforms.

## Project Structure

```
quotenest/
├── app/
│   ├── api/
│   │   └── lead/
│   │       └── route.ts          # API endpoint for lead submissions
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout component
│   ├── page.module.css            # Landing page styles (CSS Modules)
│   └── page.tsx                   # Landing page with quote form
├── lib/
│   ├── env.ts                     # Environment variable configuration
│   ├── email.ts                   # Email sending utility
│   └── openai.ts                  # OpenAI integration
├── types/
│   └── lead.ts                    # TypeScript type definitions
├── .env.example                   # Example environment variables
├── .gitignore                     # Git ignore rules
├── .prettierrc                    # Prettier configuration
├── eslint.config.mjs              # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

## API Endpoints

### POST `/api/lead`

Submits a quote request and generates an AI summary.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "location": "New York, NY",
  "insuranceType": "Auto",
  "currentProvider": "ABC Insurance",
  "currentPremium": "$1,200/year",
  "coverageNeeds": "Looking for comprehensive auto coverage...",
  "notes": "Additional information..."
}
```

**Success Response (200):**
```json
{
  "status": "ok",
  "message": "Lead received",
  "hasSummary": true,
  "summary": {
    "overview": "...",
    "recommendedCoverages": ["..."],
    "keyRiskFactors": ["..."],
    "savingsOrConsiderations": ["..."]
  }
}
```

**Error Response (400/500):**
```json
{
  "status": "error",
  "error": "Error message here"
}
```

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **OpenAI API**: AI-powered insurance summaries
- **Nodemailer**: Email sending via SMTP
- **CSS Modules**: Component-scoped styling
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Security Notes

- All environment variables are server-side only and never exposed to the client
- OpenAI API calls are made server-side only
- Email credentials are stored securely in environment variables
- Form validation is performed on both client and server
- Input sanitization prevents XSS attacks
- Rate limiting protects against abuse (10 requests per 15 minutes per IP)
- Security headers configured in `next.config.ts`
- CSRF protection via Content-Type validation

## Pre-Deployment Checklist

Before deploying to production, ensure the following:

### 1. Functional Sanity Check
- [ ] Homepage loads without console errors
- [ ] Navigation works on all primary pages (Home, Privacy, Terms, Contact)
- [ ] Form submits and responds correctly
- [ ] All buttons and links work (internal and external)
- [ ] Success and error messages display properly

### 2. Mobile + Browser Compatibility
- [ ] Test mobile layout (Chrome DevTools: 360px–1024px)
- [ ] Check responsiveness on Chrome, Firefox, and Safari
- [ ] No elements break out of screen, overlap, or disappear
- [ ] Form is usable on mobile devices

### 3. SEO + Metadata
- [ ] `<title>` and `<meta description>` set per page (✓ Implemented)
- [ ] Open Graph preview correct for social sharing (✓ Implemented)
- [ ] Sitemap generated and accessible at `/sitemap.xml` (✓ Implemented)
- [ ] robots.txt present and not blocking search (✓ Implemented)

### 4. Security Checks
- [ ] HTTPS enabled (check SSL cert)
- [ ] Force HTTPS redirect (configure in hosting provider)
- [ ] No secret keys, tokens, or API keys in frontend code (✓ Verified)
- [ ] Forms sanitize input, prevent XSS (✓ Implemented)
- [ ] Rate limiting active (✓ Implemented: 10 requests/15 min)
- [ ] Security headers configured (✓ Implemented in `next.config.ts`)
- [ ] Consider enabling reCAPTCHA if form spam becomes an issue (structure ready)

### 5. Performance
- [ ] Compress images (WebP preferred) - Next.js handles automatically
- [ ] Minify CSS/JS (build tools handle this)
- [ ] Lazy-load heavy assets where possible
- [ ] Run Lighthouse audit and check scores:
  - Performance: Target 90+
  - Accessibility: Target 90+
  - Best Practices: Target 90+
  - SEO: Target 90+

### 6. Analytics + Tracking
- [ ] Google Analytics connected (structure ready in `lib/analytics.ts`)
- [ ] Cookie banner functional (✓ Implemented)
- [ ] Privacy notice displayed (✓ Cookie banner links to Privacy Policy)

### 7. Backup + Recovery
- [ ] Source code committed and pushed to Git
- [ ] Database backed up (if applicable)
- [ ] Rollback method exists (previous deploy, environment snapshots)

### 8. Hosting / DNS Validation
- [ ] Domain routes correctly
- [ ] SSL certificate active and valid
- [ ] DNS propagation complete
- [ ] No broken redirects or loops
- [ ] Environment variables configured in hosting platform

### 9. Legal + Compliance
- [ ] Privacy Policy page created (✓ Implemented at `/privacy`)
- [ ] Terms of Service page created (✓ Implemented at `/terms`)
- [ ] Contact information page created (✓ Implemented at `/contact`)
- [ ] ADA accessibility basics:
  - [ ] Alt text on images (add when images are added)
  - [ ] Good contrast (✓ Verified in CSS)
  - [ ] Keyboard navigable (✓ Skip link and focus styles implemented)
  - [ ] ARIA labels on form inputs (✓ Implemented)

### 10. Final User Test
- [ ] Incognito test (fresh session)
- [ ] Test with low network speed to check loading behavior
- [ ] Have one extra person click through

### Additional Implementation Notes

**Analytics Integration:**
- Analytics structure is ready in `lib/analytics.ts`
- Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable
- Uncomment initialization code in `lib/analytics.ts` when ready

**reCAPTCHA Integration:**
- reCAPTCHA structure is ready in `lib/recaptcha.ts`
- Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET_KEY` environment variables
- Uncomment verification code in `app/api/lead/route.ts` and `app/page.tsx` when ready

**Rate Limiting:**
- Currently using in-memory rate limiting (suitable for single-instance deployments)
- For production scale with multiple instances, consider using Redis-based rate limiting

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
