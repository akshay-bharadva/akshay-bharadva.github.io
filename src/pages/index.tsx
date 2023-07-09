import Container from "@/components/container";
import Hero from "@/components/hero";
import Layout from "@/components/layout";
import LittleAboutMyself from "@/components/little-about-myself";
import Me from "@/components/me";
import Technology from "@/components/technology";
import Tools from "@/components/tools";

export default function Home() {
  return (
    <Layout title="Portfolio">
      <Container>
        <LittleAboutMyself/>
      </Container>
    </Layout>
  );
}
