"use client";

import Link from "next/link";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { useApi } from "@/components/useApi";
import { DeleteButton, Empty, ErrorBox, Loading, Monogram, PageHeader, PlayerLink, ResultBadge, StatusBadge } from "@/components/ui";
import { formatDate, formatFormat, formatPoints } from "@/lib/format";

export default function TournamentPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { isOrganizer } = useAuth();
  const { data, error, loading, reload } = useApi(`/tournaments/${id}`);
  const allPlayers = useApi(isOrganizer ? "/players?sort=name" : null);
  const [toAdd, setToAdd] = useState("");
  const [actionError, setActionError] = useState(null);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const { tournament, players, matches, standings } = data;
  const open = !["completed", "cancelled"].includes(tournament.status);
  const registered = new Set(players.map((p) => p._id));
  const available = (allPlayers.data?.players ?? []).filter((p) => !registered.has(p._id));
  const rounds = [...new Set(matches.map((m) => m.round))].sort((a, b) => a - b);

  async function run(fn) {
    setActionError(null);
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError(err);
    }
  }

  async function addPlayer(e) {
    e.preventDefault();
    if (!toAdd) return;
    await run(() => api(`/tournaments/${id}/players`, { method: "POST", body: { playerId: toAdd } }));
    setToAdd("");
  }

  const setStatus = (status) => run(() => api(`/tournaments/${id}`, { method: "PUT", body: { status } }));

  async function remove() {
    await api(`/tournaments/${id}`, { method: "DELETE" });
    router.push("/tournaments");
  }

  return (
    <>
      <PageHeader
        back={{ href: "/tournaments", label: "All tournaments" }}
        title={tournament.name}
        monogram={<Monogram name={tournament.name} seed={tournament.format + tournament._id} size="lg" />}
        actions={
          isOrganizer && open && <Link href={`/matches/new?tournament=${id}`} className="btn btn-primary">Record a result</Link>
        }
      />
      <ErrorBox error={actionError} />

      <div className="detail">
        <div>
          {tournament.description && <p className="prose">{tournament.description}</p>}

          <section className="section">
            <div className="section-head">
              <h2>Standings</h2>
              <span className="muted small">Win 1 · Draw ½ · Loss 0 · ties broken by rating</span>
            </div>
            {standings.length === 0 ? (
              <Empty>Standings appear once players are registered.</Empty>
            ) : (
              <div className="table-wrap">
                <table className="standings">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Player</th>
                      <th className="num">Pl</th>
                      <th className="num">W</th>
                      <th className="num">D</th>
                      <th className="num">L</th>
                      <th className="num">Rating</th>
                      <th className="num">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => (
                      <tr key={row.playerId} className={row.rank === 1 && row.played > 0 ? "lead" : ""}>
                        <td className="rank">{row.rank}</td>
                        <td><PlayerLink id={row.playerId} name={row.name} /></td>
                        <td className="num">{row.played}</td>
                        <td className="num">{row.wins}</td>
                        <td className="num">{row.draws}</td>
                        <td className="num">{row.losses}</td>
                        <td className="num muted">{row.rating}</td>
                        <td className="num points">{formatPoints(row.points)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Pairings and results</h2>
              {isOrganizer && matches.length > 0 && (
                <Link href={`/matches?tournament=${id}`} className="text-link">Open in results</Link>
              )}
            </div>
            {matches.length === 0 ? (
              <Empty>No games recorded for this event yet.</Empty>
            ) : (
              rounds.map((round) => (
                <div key={round}>
                  <p className="round-label">Round {round}</p>
                  <div className="table-wrap">
                    <table className="pairings">
                      <tbody>
                        {matches
                          .filter((m) => m.round === round)
                          .map((m) => (
                            <tr key={m._id}>
                              <td className="white-cell"><PlayerLink player={m.whitePlayerId} /></td>
                              <td className="center"><ResultBadge result={m.result} /></td>
                              <td className="black-cell"><PlayerLink player={m.blackPlayerId} /></td>
                              <td className="muted small opening-cell">{m.opening}</td>
                              {isOrganizer && (
                                <td className="right">
                                  <Link href={`/matches/${m._id}/edit`} className="text-link">Edit</Link>
                                </td>
                              )}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="side-block">
            <h2>Event details</h2>
            <dl className="facts">
              <dt>Status</dt>
              <dd><StatusBadge status={tournament.status} /></dd>
              <dt>Date</dt>
              <dd>{formatDate(tournament.date)}</dd>
              <dt>Format</dt>
              <dd>{formatFormat(tournament.format)}</dd>
              <dt>Time control</dt>
              <dd>{tournament.timeControl}</dd>
              <dt>Location</dt>
              <dd>{tournament.location}</dd>
            </dl>
          </div>

          <div className="side-block">
            <h2>Players ({players.length})</h2>
            {isOrganizer && open && (
              <form className="inline-form" onSubmit={addPlayer}>
                <select value={toAdd} onChange={(e) => setToAdd(e.target.value)} aria-label="Player to register">
                  <option value="">Choose a player to register</option>
                  {available.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.rating})
                    </option>
                  ))}
                </select>
                <button className="btn btn-sm" disabled={!toAdd}>Register player</button>
              </form>
            )}
            {players.length === 0 ? (
              <p className="muted small">Nobody registered yet.</p>
            ) : (
              <ul className="rows compact">
                {[...players]
                  .sort((a, b) => b.rating - a.rating)
                  .map((p) => (
                    <li key={p._id}>
                      <div className="row-body">
                        <PlayerLink player={p} />
                      </div>
                      <span className="num muted small">{p.rating}</span>
                      {isOrganizer && open && (
                        <button
                          className="btn btn-quiet btn-sm"
                          onClick={() => run(() => api(`/tournaments/${id}/players/${p._id}`, { method: "DELETE" }))}
                          aria-label={`Unregister ${p.name}`}
                          title="Unregister"
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {isOrganizer && (
            <div className="side-block">
              <h2>Manage</h2>
              <div className="side-actions">
                {tournament.status === "upcoming" && (
                  <button className="btn" onClick={() => setStatus("ongoing")}>Start tournament</button>
                )}
                {tournament.status === "ongoing" && (
                  <button className="btn" onClick={() => setStatus("completed")}>Mark as completed</button>
                )}
                <Link href={`/tournaments/${id}/edit`} className="btn">Edit details</Link>
                {tournament.status !== "cancelled" && (
                  <button
                    className="btn"
                    onClick={() => window.confirm("Mark this tournament as cancelled?") && setStatus("cancelled")}
                  >
                    Cancel tournament
                  </button>
                )}
                <DeleteButton
                  label="Delete tournament"
                  onDelete={remove}
                  confirmText={`Delete "${tournament.name}" and its ${matches.length} game(s)? Ratings will be recalculated.`}
                />
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
