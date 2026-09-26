"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import Logo from "./Logo";
import { api } from "@/lib/client";

// Organizers manage players and results. Members see the dashboard, tournaments and their own profile.
export function navLinks(user) {
  if (user?.role === "organizer") {
    return [
      { href: "/", label: "Overview" },
      { href: "/players", label: "Players" },
      { href: "/tournaments", label: "Tournaments" },
      { href: "/matches", label: "Results" },
    ];
  }
  return [
    { href: "/", label: "Overview" },
    { href: "/tournaments", label: "Tournaments" },
    { href: `/players/${user?.id}`, label: "My profile" },
  ];
}

export default function Nav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const close = () => setOpen(false);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Logo />
        {user ? (
          <>
            <button
              className="btn btn-sm menu-button"
              aria-expanded={open}
              aria-controls="site-nav"
              onClick={() => setOpen(!open)}
            >
              {open ? "Close" : "Menu"}
            </button>
            <nav id="site-nav" className={`site-nav ${open ? "open" : ""}`}>
              {navLinks(user).map((l) => (
                <Link key={l.href} href={l.href} className={isActive(l.href) ? "active" : ""} onClick={close}>
                  {l.label}
                </Link>
              ))}
              <div className="nav-account">
                <Link href={`/players/${user.id}`} className="who" onClick={close} title="Your profile">
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </Link>
                <button className="btn btn-sm" onClick={logout}>
                  Sign out
                </button>
              </div>
            </nav>
          </>
        ) : (
          <nav className="site-nav guest">
            <Link href="/login" className={pathname === "/login" ? "active" : ""}>Sign in</Link>
            <Link href="/register" className={pathname === "/register" ? "active" : ""}>Join the club</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
