"use client";

import Link from "next/link";
import { use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { useAuth } from "@/components/AuthProvider";
import { useApi } from "@/components/useApi";
import { DeleteButton, Empty, ErrorBox, Loading, Monogram, PageHeader, PlayerLink, ResultBadge, StatusBadge } from "@/components/ui";
import { capitalize, formatDate, signed } from "@/lib/format";
import { whiteScore } from "@/lib/elo";

export default function PlayerPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isOrganizer } = useAuth();
  const { data, error, loading } = useApi(`/players/${id}`);

  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const { player, record, matches, tournaments } = data;
  const isMe = user?.id === id;
  const sinceJoining = player.rating - player.startingRating;

  async function remove() {
    await api(`/players/${id}`, { method: "DELETE" });
    router.push("/players");
  }

  return (
    <>
      <PageHeader
        back={isOrganizer ? { href: "/players", label: "All players" } : { href: "/", label: "Overview" }}
        title={player.name}
        monogram={<Monogram name={player.name} seed={player._id} size="lg" />}
        lede={isMe ? "This is your profile." : null}
      />

      <div className="detail">
        <div>
          <div className="rating-line">
            <span className="value">{player.rating}</span>
            <span className="caption">
              current rating
              <br />
              <span className={sinceJoining > 0 ? "pos" : sinceJoining < 0 ? "neg" : ""}>{signed(sinceJoining)}</span> since
              joining
            </span>
          </div>

          <div className="tally">
            <div><strong>{record.played}</strong><span>Played</span></div>
            <div className="w"><strong>{record.wins}</strong><span>Won</span></div>
            <div><strong>{record.draws}</strong><span>Drawn</span></div>
            <div className="l"><strong>{record.losses}</strong><span>Lost</span></div>
          </div>

          <section className="section">
            <div className="section-head">
              <h2>Match history</h2>
              {isOrganizer && matches.length > 0 && (
                <Link href={`/matches?player=${id}`} className="text-link">Open in results</Link>
              )}
            </div>
            {matches.length === 0 ? (
              <Empty>No games recorded yet.</Empty>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Event</th>
                      <th className="num">Rd</th>
                      <th>Colour</th>
                      <th>Opponent</th>
                      <th className="center">Result</th>
                      <th className="num">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => {
                      const isWhite = String(m.whitePlayerId?._id) === id;
                      const opponent = isWhite ? m.blackPlayerId : m.whitePlayerId;
                      const score = isWhite ? whiteScore(m.result) : 1 - whiteScore(m.result);
                      const change = isWhite ? m.ratingChangeWhite : m.ratingChangeBlack;
                      const outcome = score === 1 ? "win" : score === 0 ? "loss" : "draw";
                      return (
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
                          <td><span className={`side-colour ${isWhite ? "white" : "black"}`}>{isWhite ? "White" : "Black"}</span></td>
                          <td><PlayerLink player={opponent} /></td>
                          <td className="center nowrap">
                            <ResultBadge result={m.result} /> <span className={`small outcome-${outcome}`}>{capitalize(outcome)}</span>
                          </td>
                          <td className={`num ${change > 0 ? "pos" : change < 0 ? "neg" : ""}`}>{signed(change)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="detail-side">
          <div className="side-block">
            <h2>Player details</h2>
            <dl className="facts">
              <dt>Skill level</dt>
              <dd>{capitalize(player.skillLevel)}</dd>
              <dt>Starting rating</dt>
              <dd>
                {player.startingRating}{" "}
                <span className="muted small">
                  ({player.startingRatingSource === "manual-entry" ? "entered manually" : "skill level default"})
                </span>
              </dd>
              <dt>Role</dt>
              <dd>{capitalize(player.role)}</dd>
              {player.studentYear && (
                <>
                  <dt>Student year</dt>
                  <dd>{player.studentYear}</dd>
                </>
              )}
              {player.email && (
                <>
                  <dt>Email</dt>
                  <dd>{player.email}</dd>
                </>
              )}
              <dt>Member since</dt>
              <dd>{formatDate(player.joinedAt)}</dd>
            </dl>
          </div>

          <div className="side-block">
            <h2>Tournaments</h2>
            {tournaments.length === 0 ? (
              <p className="muted small">Not registered in any tournaments.</p>
            ) : (
              <ul className="rows compact">
                {tournaments.map((t) => (
                  <li key={t._id}>
                    <div className="row-body">
                      <Link href={`/tournaments/${t._id}`} className="plain-link">{t.name}</Link>
                      <div className="muted small">{formatDate(t.date)}</div>
                    </div>
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isOrganizer && (
            <div className="side-block">
              <h2>Manage</h2>
              <div className="side-actions">
                <Link href={`/players/${id}/edit`} className="btn">Edit player</Link>
                {!isMe && (
                  <DeleteButton
                    label="Remove from club"
                    onDelete={remove}
                    confirmText={`Remove ${player.name}? Their ${record.played} recorded game(s) will also be deleted and all ratings recalculated.`}
                  />
                )}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
