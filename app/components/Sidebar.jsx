'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LayoutDashboard, Settings, LogOut, ChevronLeft, Menu, Wallet, X } from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true); // Desktop collapse
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle
  const pathname = usePathname();
  const router = useRouter();

  // Tutup sidebar otomatis kalau pindah halaman di mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Overlay: Muncul cuma pas mobile sidebar terbuka */}
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <aside className={`
        ${styles.sidebar} 
        ${isExpanded ? styles.expanded : styles.collapsed}
        ${isOpen ? styles.mobileShow : ''}
      `}>
        <div className={styles.header}>
          {(isExpanded || isOpen) && <span className={styles.logo}>Kas Iuran</span>}
          
          {/* Tombol Toggle (Desktop) */}
          <button className={`${styles.toggleBtn} hidden md:flex`} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>

          {/* Tombol Close (Mobile) */}
          <button className="md:hidden text-gray-400" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/kas" className={`${styles.navLink} ${pathname === '/kas' ? styles.activeLink : ''}`}>
            <Wallet size={22} />
            <span className={styles.linkLabel}>Rekap Kas</span>
          </Link>

          <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.activeLink : ''}`}>
            <Settings size={22} />
            <span className={styles.linkLabel}>Kelola Admin</span>
          </Link>
        </nav>

        <div className={styles.footer}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={22} />
            <span className={styles.linkLabel}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Button Hamburger (Cuma muncul di Mobile) */}
      <button 
        className="fixed bottom-6 right-6 p-4 bg-emerald-500 text-white rounded-full shadow-lg z-[80] md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>
    </>
  );
}