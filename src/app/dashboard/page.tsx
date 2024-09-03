import DashboardCard from "@/components/Dashboard/Card";
import DashboardNavbar from "@/components/Dashboard/Navbar";
import Sidebar from "@/components/Dashboard/Sidebar";
import DashboardLayout from "./layout";
import H3 from "@/components/H3";
import Table from "@/components/Dashboard/Table";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex h-screen bg-zinc-100 ">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <DashboardNavbar />
          <main className="flex-1 overflow-x-hidden bg-zinc-100">
            <div className="container mx-auto px-6 py-8">
              <H3 className="text-zinc-700">Dashboard</H3>
              {/* Cards */}
              <div className="mt-8  gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {CardContent.map((card, index) => (
                  <DashboardCard
                    key={index}
                    title={card.title}
                    description={card.description}
                    buttonText={card.buttonText}
                    onClick={card.onClick}
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
        </div>
      </div>
    </DashboardLayout>
  );
}

// Fake data
const CardContent = [
  {
    title: "Complete your profile",
    description: "Supervise your drive space in the easiest way",
    buttonText: "Complete",
    onClick: () => {},
  },
  {
    title: "Upload your paper",
    description: "Supervise your drive space in the easiest way",
    buttonText: "Upload",
    onClick: () => {},
  },
];

const columns = [
  { key: "title", header: "Paper Title" },
  { key: "authors", header: "Authors" },
  { key: "createdDate", header: "Created Date" },
  { key: "domain", header: "Domain" },
  { key: "status", header: "Status" },
];

const data = [...Array(5)].map((_, index) => ({
  title: "",
  authors: "",
  createdDate: "",
  domain: "",
  status:
    index % 3 === 0 ? "Approved" : index % 3 === 1 ? "Reviewing" : "Rejected",
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
    <div
      className={`h-2 bg-zinc-200 rounded ${
        column.key === "title"
          ? "w-3/4"
          : column.key === "authors"
          ? "w-full"
          : "w-1/2"
      }`}
    ></div>
  );
}
