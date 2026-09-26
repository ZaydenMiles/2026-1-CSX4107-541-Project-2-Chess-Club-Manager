import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: { default: "Chess Club Manager", template: "%s | Chess Club Manager" },
  description: "Players, tournaments, results and standings for the university chess club.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  const pathname = (await headers()).get("x-pathname");
  const isPublic = ["/login", "/register"].includes(pathname);

  // A signed cookie whose player no longer exists (for example after the database
  // was reseeded) counts as signed out, so the login page stays reachable.
  if (pathname && !user && !isPublic) {
    redirect(pathname === "/" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`);
  }
  if (user && isPublic) redirect("/");

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AuthProvider user={user}>
          <Nav />
          <main id="main-content" className="wrap">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
