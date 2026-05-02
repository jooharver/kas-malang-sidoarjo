import Sidebar from '@/app/components/Sidebar';
import Topbar from '@/app/components/Topbar';

export default function MainLayout({ children }) {
  return (
    // h-screen & overflow-hidden buat ngunci layar biar gak scroll satu halaman
    <div className="flex h-screen w-screen bg-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        <Topbar />
        
        {/* overflow-y-auto di sini yang bakal jadi area scroll utama */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}