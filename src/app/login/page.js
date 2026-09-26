"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { ErrorBox, Field } from "@/components/ui";

function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/auth/login", { method: "POST", body: { email, password } });
      const next = params.get("next");
      router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
      // Re-render the server layout so it picks up the new session.
      router.refresh();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <h2>Sign in</h2>
      <p className="muted">Use the email you registered with the club.</p>
      <ErrorBox error={error} />
      <Field label="Email" htmlFor="email">
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password">
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </Field>
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy ? "Signing in..." : "Sign in"}
      </button>
      <p className="auth-foot">
        Not a member yet? <Link href="/register">Join the club</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="auth">
      <div className="auth-intro">
        <span className="eyebrow">University Chess Club</span>
        <h1>Every game, on the record.</h1>
        <p className="lede">
          One place for the club&apos;s players, tournaments and results. Ratings and standings update as soon as a
          game is entered.
        </p>
        <ul>
          <li><strong>Players.</strong> Ratings, records and full match history.</li>
          <li><strong>Tournaments.</strong> Swiss, round robin and knockout events.</li>
          <li><strong>Results.</strong> Elo ratings recalculated after every game.</li>
        </ul>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
