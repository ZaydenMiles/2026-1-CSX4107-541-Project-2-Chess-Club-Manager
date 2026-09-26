"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useApi } from "@/components/useApi";
import PlayerForm from "@/components/PlayerForm";
import OrganizerOnly from "@/components/OrganizerOnly";
import { ErrorBox, Loading, PageHeader } from "@/components/ui";

export default function EditPlayerPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, error, loading } = useApi(`/players/${id}`);

  async function save(body) {
    await api(`/players/${id}`, { method: "PUT", body });
    router.push(`/players/${id}`);
  }

  return (
    <OrganizerOnly>
      <PageHeader back={{ href: `/players/${id}`, label: "Back to profile" }} title="Edit player" lede={data?.player.name} />
      <ErrorBox error={error} />
      {loading && <Loading />}
      {data && <PlayerForm mode="edit" initial={data.player} onSubmit={save} submitLabel="Save changes" />}
    </OrganizerOnly>
  );
}
