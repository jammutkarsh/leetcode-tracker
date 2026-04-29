import { redirect } from "next/navigation";

export const metadata = {
  title: "Roadmap | Leetcode Tracker",
};

export default function RoadmapPage() {
  redirect("/job-checklist");
}
