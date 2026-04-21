import SupabaseMFASetup from "@/components/admin/auth/SupabaseMFASetup";
import Layout from "@/components/layout";
import Head from "next/head";

export default function AdminMFASetupPage() {
  return (
    <Layout isAdmin>
      <Head>
        <title>Setup 2FA | Admin</title>
      </Head>
      <SupabaseMFASetup />
    </Layout>
  );
}
