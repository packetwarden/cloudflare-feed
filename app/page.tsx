import { Metadata } from "next";
import { FeedViewer } from "@/components/tool/FeedViewer";

export const metadata: Metadata = {
  title: "Live Threat Feed | Security Operations Telemetry",
  description:
    "Professional-grade threat intelligence feed tracking active attack vectors, malicious IPs, and global security events in real-time.",
  keywords: [
    "threat intelligence",
    "cybersecurity",
    "IOC",
    "malicious IPs",
    "attack vectors",
    "security operations",
    "telemetry",
  ],
  authors: [{ name: "SecOps Intelligence" }],
  openGraph: {
    type: "website",
    title: "Live Threat Feed | Security Operations Telemetry",
    description: "Real-time tracking of active attack vectors and malicious IPs.",
    siteName: "ThreatFeed Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Threat Feed | SecOps",
    description: "Real-time threat intelligence telemetry.",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Live Threat Feed Telemetry",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Any",
    description: "Real-time cybersecurity threat intelligence feed.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-background text-foreground font-sans">
        <FeedViewer />
      </div>
    </>
  );
}
