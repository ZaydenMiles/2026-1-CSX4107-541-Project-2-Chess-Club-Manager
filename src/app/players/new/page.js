"use client";

import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import PlayerForm from "@/components/PlayerForm";
import { PageHeader } from "@/components/ui";
import OrganizerOnly from "@/components/OrganizerOnly";

export default function NewPlayerPage() {
  const router = useRouter();

  async function create(body) {
    const { player } = await api("/players", { method: "POST", body });
    router.push(`/players/${player._id}`);
  }

  return (
    <OrganizerOnly>
      <PageHeader back={{ href: "/players", label: "All players" }} title="Register a player" lede="Register a new club member." />
      <PlayerForm mode="create" onSubmit={create} submitLabel="Add player" />
    </OrganizerOnly>
  );
}
