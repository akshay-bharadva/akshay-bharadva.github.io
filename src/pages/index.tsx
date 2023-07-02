import Container from "@/components/container";
import Hero from "@/components/hero";
import Layout from "@/components/layout";
import Technology from "@/components/technology";

export default function Home() {
  return (
    <Layout title="Home">
      <Container>
        <Hero />
        <Technology />
      </Container>
    </Layout>
  );
}
