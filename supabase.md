# Supabase Setup Guide

This guide provides the necessary steps to configure a Supabase project to serve as the backend for this portfolio application.

### Prerequisites

- A free [Supabase](https://supabase.com) account.

---

### Step 1: Create a New Project

1.  Log in to your Supabase account and click **New project**.
2.  Choose an organization, give your project a **Name**, and generate a secure **Database Password**.
3.  Choose the **Region** closest to your users.
4.  Click **Create project** and wait for it to be provisioned.

---

### Step 2: Configure Environment Variables

1.  In your Supabase project dashboard, navigate to **Project Settings** (the gear icon) > **API**.
2.  You will need the **Project URL** and the `anon` **Project API Key**.
3.  In your local project folder, create a new file named `.env.local` by copying `.env.example`.
4.  Update your `.env.local` file with these values:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY
    NEXT_PUBLIC_BUCKET_NAME=assets
    NEXT_PUBLIC_SITE_URL=http://localhost:8889
    ```

---

### Step 3: Run the Database Setup Script

This single SQL script creates all necessary tables, security policies, server-side functions, and seed data for initial setup.

1.  In your Supabase project dashboard, navigate to the **SQL Editor** (the terminal icon).
2.  Click **+ New query**.
3.  Copy the entire contents of [`db/schema.sql`](db/schema.sql) and paste it into the editor.
4.  Click **Run**. The script is idempotent, meaning you can safely run it multiple times.

> **What the script creates:** 15+ tables with Row Level Security, 10+ RPC functions, storage bucket policies, and seed data for site identity, navigation, and security settings.

---

### Step 4: Configure Storage

The application uses Supabase Storage for image uploads. The SQL script automatically creates the `assets` bucket, but you should verify it:

1.  Navigate to **Storage** in your Supabase dashboard.
2.  Confirm the `assets` bucket exists and is set to **Public**.
3.  If it doesn't exist, create it manually: click **Create a new bucket**, name it `assets`, and toggle **Public bucket** to **ON**.

> The RLS policies from the SQL script secure access — public reads are allowed, but writes are restricted to authenticated users.

---

### Step 5: Enable Two-Factor Authentication (MFA)

The admin panel requires MFA for security.

1.  Navigate to **Authentication** > **Providers** in your Supabase dashboard.
2.  Find **Multi-Factor Authentication** and click to configure.
3.  Enable **TOTP**.

---

### Step 6: Create Your Admin User

The admin panel does not have a public sign-up page. You must create your first user manually.

1.  Go to **Authentication** > **Users** in your Supabase dashboard.
2.  Click **Add user** and create your admin account via email.
3.  You will receive a confirmation email from Supabase. Click the link to verify your account.
4.  You can now proceed to `http://localhost:8889/admin/login` to log in for the first time and set up MFA.

---

### Troubleshooting

**Site settings not saving?**
If you previously ran an older version of the schema, the RLS policy for `site_identity` may use `auth.uid() = user_id` which fails because the seed row has no `user_id`. Run this fix in the SQL Editor:

```sql
DROP POLICY IF EXISTS "Admin can manage site identity" ON site_identity;
DROP POLICY IF EXISTS "Admin manage site identity" ON site_identity;
CREATE POLICY "Admin manage site identity" ON site_identity
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```
