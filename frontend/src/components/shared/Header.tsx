"use client";

export default function Header() {
  return (
    <header className="bg-white/80 shadow flex justify-between items-center px-8 py-4 border-b border-emerald-100">
      <h1 className="text-2xl font-extrabold text-emerald-700 tracking-tight">VITALIt-OS</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">Logged in as Admin</span>
      </div>
    </header>
  );
}
