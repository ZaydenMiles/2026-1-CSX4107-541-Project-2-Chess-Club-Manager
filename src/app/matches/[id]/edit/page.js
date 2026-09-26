"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useApi } from "@/components/useApi";
import MatchForm from "@/components/MatchForm";
import OrganizerOnly from "@/components/OrganizerOnly";
import { DeleteButton, ErrorBox, Loading, PageHeader } from "@/components/ui";

export default function EditMatchPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, error, loading } = useApi(`/matches/${id}`);

  async function save(body) {
    await api(`/matches/${id}`, { method: "PUT", body });
    router.push(`/tournaments/${body.tournamentId}`);
  }

  async function remove() {
    await api(`/matches/${id}`, { method: "DELETE" });
    router.push(data?.match.tournamentId ? `/tournaments/${data.match.tournamentId._id}` : "/matches");
  }

  return (
    <OrganizerOnly>
      <PageHeader
        back={{ href: "/matches", label: "All results" }}
        title="Edit result"
        lede={data && `${data.match.whitePlayerId?.name} vs ${data.match.blackPlayerId?.name}`}
        actions={
          data && (
            <DeleteButton
              onDelete={remove}
              label="Delete match"
              confirmText="Delete this match? Both players' rating changes will be reversed."
            />
          )
        }
      />
      <ErrorBox error={error} />
      {loading && <Loading />}
      {data && <MatchForm initial={data.match} onSubmit={save} submitLabel="Save changes" />}
    </OrganizerOnly>
  );
}
