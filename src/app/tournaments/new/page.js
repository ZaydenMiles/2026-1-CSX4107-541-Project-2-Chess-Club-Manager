"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import TournamentForm from "@/components/TournamentForm";
import OrganizerOnly from "@/components/OrganizerOnly";
import { PageHeader } from "@/components/ui";

export default function NewTournamentPage() {
  const router = useRouter();

  async function create(body) {
    const { tournament } = await api("/tournaments", { method: "POST", body });
    router.push(`/tournaments/${tournament._id}`);
  }

  return (
    <OrganizerOnly>
      <PageHeader back={{ href: "/tournaments", label: "All tournaments" }} title="New tournament" lede="Players can be registered after the tournament is created." />
      <TournamentForm onSubmit={create} submitLabel="Create tournament" />
    </OrganizerOnly>
  );
}
