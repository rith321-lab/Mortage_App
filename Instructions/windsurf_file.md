---

# .windsurfrules

## Project Overview
- **Type:** windsurf_file
- **Description:** Product Requirements Document: AI-Driven Mortgage Underwriting Solution
  
  This solution streamlines the mortgage pre-approval process for home buyers and lenders by leveraging an AI-driven underwriting engine. It aims to provide a partially underwritten pre-approval within 24 hours by gathering, verifying, and processing borrower information in a single digital application while adhering to Fannie Mae’s guidelines.
- **Primary Goal:** Enable rapid, compliant pre-approval decisions within 24 hours by automating the underwriting process using AI, reducing redundant document uploads, and integrating secure third-party services for digital signatures and API-driven lender interactions.

## Project Structure
### Framework-Specific Routing
- **Directory Rules:**
  - Next.js 14 (App Router): Implements the route structure logic using the `app/[route]/page.tsx` conventions.
  - Example 1: "Next.js 14 (App Router)" → `app/[route]/page.tsx` conventions
  - Example 2: "Next.js (Pages Router)" → `pages/[route].tsx` pattern
  - Example 3: "React Router 6" → `src/routes/` with `createBrowserRouter`

### Core Directories
- **Versioned Structure:**
  - `app/api`: Next.js 14 API routes with Route Handlers for secure server-side logic and data processing.
  - `app/views`: Houses modern UI components developed with Windsurf IDE and V0 by Vercel, ensuring a clean, fintech-inspired design.

### Key Files
- **Stack-Versioned Patterns:**
  - `app/dashboard/layout.tsx`: Next.js 14 root layouts providing a unified structure for authenticated user areas and dashboards.
  - `app/auth/login/page.tsx`: Implements authentication flows using server actions to seamlessly integrate AI underwriting triggers.

## Tech Stack Rules
- **Version Enforcement:**
  - next@14: App Router required, no `getInitialProps`, ensuring modern routing and server-side rendering standards.

## PRD Compliance
- **Non-Negotiable:**
  - "This solution leverages AI to gather, verify, and process borrower information in one single application, generating a partially underwritten pre-approval in less than 24 hours." : Enforce rapid processing and compliance with Fannie Mae underwriting guidelines through integrated API flows and secure, real-time data verification.

## App Flow Integration
- **Stack-Aligned Flow:**
  - Next.js 14 Auth Flow → `app/auth/login/page.tsx` uses server actions to trigger the AI underwriting process immediately after user authentication, ensuring a smooth transition from application submission to underwriting analysis.

---

### Input Context (Priority Order):
1. techStackDoc (Tools and version details such as Windsurf, V0 by Vercel, Lovable, Replit, Claude AI, and Gemini for coordinated development and AI support.)
2. prd (Detailed AI-driven process requirements ensuring a 24-hour pre-approval cycle, strict adherence to Fannie Mae guidelines, and secure, compliant data management.)
3. appFlow (Mapping of routes to components emphasizing a unified digital application, real-time status tracking, and seamless lender integration.)
4. answers (Clarifications on design, security, scalability, and user role implementations aligning with modern fintech and cloud standards.)

---