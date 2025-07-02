export default function Header() {
    return (
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <span className="text-sm text-gray-500">Logged in as Admin</span>
      </header>
    );
  }
