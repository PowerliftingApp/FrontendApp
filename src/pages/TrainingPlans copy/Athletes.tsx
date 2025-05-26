import { AthletesTable } from "./AthletesTable/AthletesTable";
import { columns } from "./AthletesTable/columns";

const mockData = [
  {
    _id: "681fd4c52c8548045b13b43a",
    fullName: "José López",
    email: "fercitox@gmail.com",
    role: "athlete",
    coach: "COACH-1GMTFP",
  },
];

export default function Athletes() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Tus Atletas</h1>
      <AthletesTable columns={columns} data={mockData} />
    </div>
  );
}
