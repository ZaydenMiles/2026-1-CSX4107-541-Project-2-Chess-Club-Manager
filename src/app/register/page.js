"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import PlayerForm from "@/components/PlayerForm";
import { PageHeader } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();

  async function register(body) {
    await api("/auth/register", { method: "POST", body });
    router.replace("/");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        eyebrow="Membership"
        title="Join the club"
        lede={
          <>
            New accounts can view everything. Club officers handle tournaments and results. Already a member?{" "}
            <Link href="/login" className="plain-link">Sign in</Link>
          </>
        }
      />
      <PlayerForm mode="register" onSubmit={register} submitLabel="Create my account" />
    </>
  );
}
