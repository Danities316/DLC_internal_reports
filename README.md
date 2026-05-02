# Data Logs Center (DLC) Reporting System

An internal operational portal built for the **Federal Road Safety Corps (FRSC) Data Logs Center**. This application replaces manual, paper-based reporting with a streamlined, mobile-first digital ledger. It enables non-technical officers to easily submit daily production metrics, track license card inventory, and instantly generate formatted reports for WhatsApp communications or official archival.

## 🚀 Key Features

*   **Administrative Ledger UI**: A clean, distraction-free interface utilizing FRSC brand colors (Blue and Maroon) built specifically for field officers.
*   **Daily Production Entry**: Intuitive form for capturing daily processing numbers (Fresh, Renewal, Re-issue), license classes, and demographics.
*   **Inventory Tracking**: Built-in validation to calculate License Card Stock balances (Bal B/F + Received - Claimed = Bal C/F).
*   **WhatsApp-Optimized Reporting**: One-click generation of strictly-formatted text reports that can be instantly copied to the clipboard for sharing in official reporting chat groups.
*   **Official Document Export**: Generates professional, print-ready PDF and Word Document (DOCX) memorandums for monthly, quarterly, and annual archival.

## 🛠 Tech Stack

*   **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons
*   **Backend**: Node.js (Next.js Server Actions)
*   **Database**: PostgreSQL via Prisma ORM
*   **Document Generation**: `jspdf` (PDF), `docx` (Word)

## 📦 Local Development Setup

### Prerequisites
*   Node.js (v18 or higher)
*   PostgreSQL (Running locally or via a cloud provider like Supabase/Neon)

### Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory and add your database connection string:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/dlcreports?schema=public"
    ```

3.  **Database Migration:**
    Push the Prisma schema to your database and generate the client:
    ```bash
    npx prisma db push
    npx prisma generate
    ```

4.  **Run the Application:**
    Start the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚢 Deployment Architecture (Free Tier)

For a permanent, free hosting architecture, the recommended stack is:
1.  **Web Hosting**: Deploy the Next.js application on [Vercel](https://vercel.com) (100% free for hobby/internal apps).
2.  **Database Hosting**: Host the PostgreSQL database on [Supabase](https://supabase.com) or [Neon](https://neon.tech) (Permanent free tier, does not expire or sleep).

**Steps:**
1. Push your code to a GitHub repository.
2. Import the repository into Vercel.
3. Add the Database connection string provided by Supabase/Neon to your Vercel project's Environment Variables as `DATABASE_URL`.
4. Deploy.
