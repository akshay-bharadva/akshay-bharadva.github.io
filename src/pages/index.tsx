import Container from "@/components/container";
import Hero from "@/components/hero";
import Layout from "@/components/layout";
import Technology from "@/components/technology";
import Tools from "@/components/tools";

export default function Home() {
  return (
    <Layout title="Home">
      <Container>
        <Hero />
        <Technology />
        <Tools />
      </Container>
    </Layout>
  );
}
