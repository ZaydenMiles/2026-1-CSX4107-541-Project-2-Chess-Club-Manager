"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import MatchForm from "@/components/MatchForm";
import OrganizerOnly from "@/components/OrganizerOnly";
import { PageHeader } from "@/components/ui";

function NewMatch() {
  const router = useRouter();
  const params = useSearchParams();
  const tournament = params.get("tournament") ?? "";

  async function create(body) {
    await api("/matches", { method: "POST", body });
    router.push(`/tournaments/${body.tournamentId}`);
  }

  return <MatchForm defaultTournament={tournament} onSubmit={create} submitLabel="Record match" />;
}

export default function NewMatchPage() {
  return (
    <OrganizerOnly>
      <PageHeader back={{ href: "/matches", label: "All results" }} title="Record a result" lede="Enter the result of a game between two registered players." />
      <Suspense>
        <NewMatch />
      </Suspense>
    </OrganizerOnly>
  );
}
