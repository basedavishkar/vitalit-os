import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
      <h2 className="text-xl font-bold">VITALIt-OS</h2>
      <nav className="flex flex-col space-y-2">
        <Link href="/dashboard/patients">Patients</Link>
        <Link href="/dashboard/doctors">Doctors</Link>
        <Link href="/dashboard/appointments">Appointments</Link>
        <Link href="/dashboard/records">Records</Link>
        <Link href="/dashboard/billing">Billing</Link>
        <Link href="/dashboard/inventory">Inventory</Link>
      </nav>
    </aside>
  );
}
