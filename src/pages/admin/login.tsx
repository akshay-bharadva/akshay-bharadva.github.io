import SupabaseLogin from "@/components/admin/auth/SupabaseLogin";
import Layout from "@/components/layout";
import Head from "next/head";

export default function AdminLoginPage() {
  // Use a special prop to tell the Layout not to render the public header/footer
  return (
    <Layout isAdmin>
      <Head>
        <title>Admin Login | Portfolio</title>
      </Head>
      <SupabaseLogin />
    </Layout>
  );
}
