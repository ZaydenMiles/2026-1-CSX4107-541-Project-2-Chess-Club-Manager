"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { navLinks } from "./Nav";

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <span>
          Built for CSX4107 Web Development by Lwin Pyae Aung, Bhone Pyae San and Nyan Myo Sett
        </span>
        {user && (
          <nav aria-label="Footer">
            {navLinks(user)
              .filter((l) => l.href !== "/")
              .map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
          </nav>
        )}
      </div>
    </footer>
  );
}
