export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-xl font-semibold mb-6">CRMS</h2>
        <nav className="space-y-3">
          <div>Dashboard</div>
          <div>Calendar</div>
          <div>Resources</div>
          <div>Bookings</div>
        </nav>
      </aside>

      <main className="flex-1 p-6 bg-gray-100">
        {children}
      </main>
    </div>
  );
}