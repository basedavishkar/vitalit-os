import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-emerald-50/80 dark:bg-emerald-950/80 border-r border-emerald-100 dark:border-emerald-900 p-6 flex flex-col gap-8 backdrop-blur-xl">
      <h2 className="text-xl font-extrabold text-emerald-700 dark:text-emerald-200 tracking-tight">VITALIt-OS</h2>
      <nav className="flex flex-col gap-3">
        <Link className="font-semibold rounded px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition text-emerald-900 dark:text-emerald-100" href="/dashboard/patients">Patients</Link>
        <Link className="font-semibold rounded px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition text-emerald-900 dark:text-emerald-100" href="/dashboard/doctors">Doctors</Link>
        <Link className="font-semibold rounded px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition text-emerald-900 dark:text-emerald-100" href="/dashboard/appointments">Appointments</Link>
        <Link className="font-semibold rounded px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition text-emerald-900 dark:text-emerald-100" href="/dashboard/records">Records</Link>
        <Link className="font-semibold rounded px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition text-emerald-900 dark:text-emerald-100" href="/dashboard/billing">Billing</Link>
        <Link className="font-semibold rounded px-3 py-2 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition text-emerald-900 dark:text-emerald-100" href="/dashboard/inventory">Inventory</Link>
      </nav>
    </aside>
  );
}
