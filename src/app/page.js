"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useApi } from "@/components/useApi";
import { Empty, ErrorBox, Loading, PlayerLink, ResultBadge, StatusBadge } from "@/components/ui";
import { capitalize, formatDate, formatFormat } from "@/lib/format";

function DateBlock({ value }) {
  const d = new Date(value);
  return (
    <span className="date-block" aria-hidden="true">
      <span className="m">{d.toLocaleDateString("en-GB", { month: "short" })}</span>
      <span className="d">{d.getDate()}</span>
    </span>
  );
}

function Figure({ href, value, label }) {
  const body = (
    <>
      <span className="figure-value">{value}</span>
      <span className="figure-label">{label}</span>
    </>
  );
  return href ? <Link href={href} className="figure">{body}</Link> : <div className="figure">{body}</div>;
}

export default function Overview() {
  const router = useRouter();
  const { user, isOrganizer } = useAuth();
  const { data, error, loading } = useApi("/dashboard");
  const [q, setQ] = useState("");

  function search(e) {
    e.preventDefault();
    router.push(q.trim() ? `/players?q=${encodeURIComponent(q.trim())}` : "/players");
  }

  return (
    <>
      <section className="hero">
        <span className="eyebrow">University Chess Club</span>
        <h1>Every game, on the record.</h1>
        <p className="lede">
          Welcome back, {user?.name?.split(" ")[0]}. See what&apos;s coming up, check tournament standings, and
          follow the latest results.
        </p>
        <div className="hero-actions">
          <Link href="/tournaments" className="btn btn-primary">Browse tournaments</Link>
          {isOrganizer && <Link href="/matches/new" className="btn">Record a result</Link>}
          {isOrganizer && <Link href="/players/new" className="btn">Register a player</Link>}
        </div>
        {isOrganizer ? (
          <form className="hero-search" onSubmit={search} role="search">
            <label htmlFor="hero-q">Or look up a player</label>
            <div className="row">
              <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Player name" />
              <button className="btn">Search players</button>
            </div>
          </form>
        ) : (
          <Link href={`/players/${user?.id}`} className="text-link">View my profile and match history</Link>
        )}
      </section>

      <ErrorBox error={error} />
      {loading && <Loading />}
      {data && (
        <>
          <div className="figures">
            <Figure href={isOrganizer ? "/players" : null} value={data.stats.players} label="Registered players" />
            <Figure href="/tournaments" value={data.stats.tournaments} label="Tournaments" />
            <Figure href={isOrganizer ? "/matches" : null} value={data.stats.matches} label="Games recorded" />
          </div>

          <div className="two-col">
            <section className="section">
              <div className="section-head">
                <h2>Upcoming tournaments</h2>
                <Link href="/tournaments" className="text-link">All tournaments</Link>
              </div>
              {data.upcoming.length === 0 ? (
                <Empty>No upcoming tournaments.</Empty>
              ) : (
                <ul className="rows">
                  {data.upcoming.map((t) => (
                    <li key={t._id}>
                      <DateBlock value={t.date} />
                      <div className="row-body">
                        <Link href={`/tournaments/${t._id}`} className="title-link row-title">{t.name}</Link>
                        <div className="row-meta">
                          <span>{formatFormat(t.format)}</span>
                          <span>{t.timeControl}</span>
                          <span>{t.location}</span>
                        </div>
                        <div className="row-tags">
                          <StatusBadge status={t.status} />
                          <span className="tag">{t.playerIds.length} players</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="section">
              <div className="section-head">
                <h2>Top-rated players</h2>
                {isOrganizer && <Link href="/players" className="text-link">Full list</Link>}
              </div>
              {data.topPlayers.length === 0 ? (
                <Empty>No players yet.</Empty>
              ) : (
                <ol className="rows compact ranked">
                  {data.topPlayers.map((p, i) => (
                    <li key={p._id}>
                      <span className="rank-no">{i + 1}</span>
                      <div className="row-body">
                        <PlayerLink player={p} className="title-link row-title" textClassName="row-title serif" />
                        <div className="muted small">{capitalize(p.skillLevel)}</div>
                      </div>
                      <div className="row-aside">
                        <span className="big">{p.rating}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <section className="section">
            <div className="section-head">
              <h2>Recent match results</h2>
              {isOrganizer && <Link href="/matches" className="text-link">All results</Link>}
            </div>
            {data.recentMatches.length === 0 ? (
              <Empty>No games recorded yet.</Empty>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Event</th>
                      <th>White</th>
                      <th className="center">Result</th>
                      <th>Black</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentMatches.map((m) => (
                      <tr key={m._id}>
                        <td className="nowrap muted">{formatDate(m.playedAt)}</td>
                        <td>
                          {m.tournamentId ? (
                            <Link href={`/tournaments/${m.tournamentId._id}`} className="plain-link">{m.tournamentId.name}</Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td><PlayerLink player={m.whitePlayerId} /></td>
                        <td className="center"><ResultBadge result={m.result} /></td>
                        <td><PlayerLink player={m.blackPlayerId} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
