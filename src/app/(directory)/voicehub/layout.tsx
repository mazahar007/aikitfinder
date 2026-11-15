import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "VoiceHub — Bengali and English AI Voice Studio",
  description:
    "Write Bengali or English text, pick a voice, and generate natural-sounding speech with MP3 download. A separate VoiceHub section inside AIKitFinder.",
  alternates: { canonical: "/voicehub" },
};

export default function VoiceHubLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
