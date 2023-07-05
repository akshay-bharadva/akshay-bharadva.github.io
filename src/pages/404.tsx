import Container from "@/components/container";
import Layout from "@/components/layout";
import NotFound from "@/components/not-found";

export default function Home() {
  return (
    <Layout title="404">
      <Container>
        <NotFound />
      </Container>
    </Layout>
  );
}
