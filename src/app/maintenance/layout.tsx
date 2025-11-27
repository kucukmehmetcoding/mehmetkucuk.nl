import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Site Under Maintenance - mehmetkucuk.nl",
  description: "We're currently performing scheduled maintenance to improve your experience.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}