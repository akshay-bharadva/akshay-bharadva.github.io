import SupabaseMFAChallenge from "@/components/admin/auth/SupabaseMFAChallenge";
import Layout from "@/components/layout";
import Head from "next/head";

export default function AdminMFAChallengePage() {
  return (
    <Layout isAdmin>
      <Head>
        <title>Security Check | Admin</title>
      </Head>
      <SupabaseMFAChallenge />
    </Layout>
  );
}
