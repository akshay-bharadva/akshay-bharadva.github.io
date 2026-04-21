import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ComponentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/ui");
  }, [router]);

  return null;
}
