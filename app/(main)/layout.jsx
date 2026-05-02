import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-black overflow-x-hidden">
      {/* Sidebar - Position Fixed di mobile, Absolute/Relative di Desktop */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}