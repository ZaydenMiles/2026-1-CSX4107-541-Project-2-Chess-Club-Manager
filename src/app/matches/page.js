"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import OrganizerOnly from "@/components/OrganizerOnly";
import { useApi } from "@/components/useApi";
import { DeleteButton, Empty, ErrorBox, Loading, PageHeader, PlayerLink, ResultBadge } from "@/components/ui";
import { formatDate, signed } from "@/lib/format";

function Delta({ n }) {
  return <span className={`delta ${n > 0 ? "pos" : n < 0 ? "neg" : ""}`}>{signed(n)}</span>;
}

function ResultsList() {
  const params = useSearchParams();
  const [filters, setFilters] = useState({
    tournament: params.get("tournament") ?? "",
    round: "",
    player: params.get("player") ?? "",
  });
  const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
  const { data, error, loading, reload } = useApi(`/matches?${qs}`);
  const tournaments = useApi("/tournaments");
  const players = useApi("/players?sort=name");
  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <div className="filterbar">
        <select value={filters.tournament} onChange={set("tournament")} aria-label="Tournament">
          <option value="">All tournaments</option>
          {(tournaments.data?.tournaments ?? []).map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
        <input type="number" min="1" placeholder="Any round" value={filters.round} onChange={set("round")} aria-label="Round" />
        <select value={filters.player} onChange={set("player")} aria-label="Player">
          <option value="">All players</option>
          {(players.data?.players ?? []).map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="results-head">
        <h2>{data ? `${data.matches.length} ${data.matches.length === 1 ? "game" : "games"}` : "Games"}</h2>
        <Link href="/matches/new" className="text-link">+ Record a result</Link>
      </div>
      <ErrorBox error={error} />
      {loading && !data && <Loading />}
      {data &&
        (data.matches.length === 0 ? (
          <Empty>No games match those filters.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Event</th>
                  <th className="num">Rd</th>
                  <th>White</th>
                  <th className="center">Result</th>
                  <th>Black</th>
                  <th>Opening</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.matches.map((m) => (
                  <tr key={m._id}>
                    <td className="nowrap muted">{formatDate(m.playedAt)}</td>
                    <td>
                      {m.tournamentId ? (
                        <Link href={`/tournaments/${m.tournamentId._id}`} className="plain-link">{m.tournamentId.name}</Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="num">{m.round}</td>
                    <td className="nowrap"><PlayerLink player={m.whitePlayerId} /><Delta n={m.ratingChangeWhite} /></td>
                    <td className="center"><ResultBadge result={m.result} /></td>
                    <td className="nowrap"><PlayerLink player={m.blackPlayerId} /><Delta n={m.ratingChangeBlack} /></td>
                    <td className="muted small">{m.opening || "-"}</td>
                    <td className="right nowrap">
                      <Link href={`/matches/${m._id}/edit`} className="btn btn-quiet btn-sm">Edit</Link>
                      <DeleteButton
                        className="btn-sm"
                        onDelete={async () => {
                          await api(`/matches/${m._id}`, { method: "DELETE" });
                          reload();
                        }}
                        confirmText="Delete this game? Both players' rating changes will be reversed."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </>
  );
}

export default function MatchesPage() {
  return (
    <OrganizerOnly>
      <PageHeader title="Results" lede="Every recorded game, newest first. The small number next to each name is that player's rating change." />
      <Suspense>
        <ResultsList />
      </Suspense>
    </OrganizerOnly>
  );
}
