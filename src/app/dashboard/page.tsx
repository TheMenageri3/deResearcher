"use client";

import DashboardCard from "@/components/Dashboard/Card";
import H3 from "@/components/H3";
import Table from "@/components/Dashboard/Table";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <main className="flex-1 overflow-x-hidden bg-zinc-100">
      <div className="container mx-auto px-6 pt-2 pb-8">
        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CardContent.map((card, index) => (
            <DashboardCard
              key={index}
              title={card.title}
              description={card.description}
              buttonText={card.buttonText}
              onClick={() => router.push(card.action)}
            />
          ))}
        </div>

        <H3 className="mt-8 text-zinc-700">Latest Peer Review Papers</H3>
        {/* Table */}
        <div className="flex flex-col">
          <Table columns={columns} data={data} renderCell={renderCell} />
        </div>
      </div>
    </main>
  );
}

// Fake data
const CardContent = [
  {
    title: "Complete your profile ⚡",
    description:
      "Ensure your profile is up to date to maximize visibility and enhance collaboration opportunities.",
    buttonText: "Complete Profile",
    action: "/dashboard/profile",
  },
  {
    title: "Upload your paper 🦒",
    description:
      "Contribute to the community by sharing your research and gaining valuable peer feedback.",
    buttonText: "Upload Paper",
    action: "/dashboard/papers",
  },
];

const columns = [
  { key: "title", header: "Paper Title" },
  { key: "authors", header: "Authors" },
  { key: "createdDate", header: "Created Date" },
  { key: "domain", header: "Domain" },
  { key: "status", header: "Status" },
];

const papers = [
  {
    title:
      "The Role of Artificial Intelligence in Revolutionizing Healthcare Systems",
    authors: ["John Doe"],
    createdDate: "2024-08-10",
    domain: "Healthcare",
    status: "Approved",
  },
  {
    title: "Quantum Computing: Advances, Challenges, and Future Directions",
    authors: ["Jane Smith", "Robert White", "Clara Adams"],
    createdDate: "2024-08-11",
    domain: "Quantum Computing",
    status: "Reviewing",
  },
  {
    title: "Exploring Blockchain Technology for Enhanced Education Systems",
    authors: ["Alice Johnson"],
    createdDate: "2024-08-12",
    domain: "Education",
    status: "Rejected",
  },
  {
    title:
      "Neural Networks and Their Application in Artificial Intelligence Systems",
    authors: ["Mark Brown", "Sarah Green", "Tom Lee"],
    createdDate: "2024-08-13",
    domain: "Artificial Intelligence",
    status: "Approved",
  },
  {
    title:
      "Data Privacy and Security: Challenges and Solutions in the Digital Age",
    authors: ["Emily Davis"],
    createdDate: "2024-08-14",
    domain: "Cybersecurity",
    status: "Reviewing",
  },
];

const data = papers.map((paper) => ({
  title: paper.title,
  authors: paper.authors.join(", "),
  createdDate: paper.createdDate,
  domain: paper.domain,
  status: paper.status,
}));

function renderCell(item: any, column: { key: string; header: string }) {
  if (column.key === "status") {
    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          item.status === "Approved"
            ? "bg-secondary-foreground text-secondary"
            : item.status === "Reviewing"
            ? "bg-primary-foreground text-primary"
            : "bg-destructive-foreground text-destructive"
        }`}
      >
        {item.status}
      </span>
    );
  }
  return (
    <span className="text-zinc-700 text-sm break-words whitespace-normal">
      {item[column.key]}
    </span>
  );
}
