"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useApi } from "@/components/useApi";
import TournamentForm from "@/components/TournamentForm";
import OrganizerOnly from "@/components/OrganizerOnly";
import { ErrorBox, Loading, PageHeader } from "@/components/ui";

export default function EditTournamentPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, error, loading } = useApi(`/tournaments/${id}`);

  async function save(body) {
    await api(`/tournaments/${id}`, { method: "PUT", body });
    router.push(`/tournaments/${id}`);
  }

  return (
    <OrganizerOnly>
      <PageHeader back={{ href: `/tournaments/${id}`, label: "Back to tournament" }} title="Edit tournament" lede={data?.tournament.name} />
      <ErrorBox error={error} />
      {loading && <Loading />}
      {data && <TournamentForm initial={data.tournament} onSubmit={save} submitLabel="Save changes" />}
    </OrganizerOnly>
  );
}
