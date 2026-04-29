import { redirect } from "next/navigation";

export const metadata = {
  title: "Roadmap | CodeTrack Pro",
};

export default function RoadmapPage() {
  redirect("/job-checklist");
}
