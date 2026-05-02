'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Settings, 
  LogOut, 
  LogIn, 
  ChevronLeft, 
  Menu, 
  Wallet, 
  X 
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    // 1. Cek User Saat Pertama Kali Load
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();

    // 2. Pantau Perubahan Status Login (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={() => setIsOpen(false)} />}

      <aside className={`
        ${styles.sidebar} 
        ${isExpanded ? styles.expanded : styles.collapsed}
        ${isOpen ? styles.mobileShow : ''}
      `}>
        <div className={styles.header}>
          {(isExpanded || isOpen) && <span className={styles.logo}>Kas Iuran</span>}
          <button className={`${styles.toggleBtn} hidden md:flex`} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
          <button className="md:hidden text-gray-400" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className={styles.nav}>
          <Link href="/kas" className={`${styles.navLink} ${pathname === '/kas' ? styles.activeLink : ''}`}>
            <Wallet size={22} />
            {(isExpanded || isOpen) && <span className={styles.linkLabel}>Rekap Kas</span>}
          </Link>

          {/* HANYA MUNCUL JIKA ADMIN LOGIN */}
          {user && (
            <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.activeLink : ''}`}>
              <Settings size={22} />
              {(isExpanded || isOpen) && <span className={styles.linkLabel}>Kelola Admin</span>}
            </Link>
          )}
        </nav>

        <div className={styles.footer}>
          {user ? (
            // JIKA LOGIN -> TOMBOL KELUAR
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={22} />
              {(isExpanded || isOpen) && <span className={styles.linkLabel}>Keluar</span>}
            </button>
          ) : (
            // JIKA TIDAK LOGIN -> TOMBOL LOGIN ADMIN
            <Link href="/login" className={styles.loginBtn}>
              <LogIn size={22} />
              {(isExpanded || isOpen) && <span className={styles.linkLabel}>Login Admin</span>}
            </Link>
          )}
        </div>
      </aside>

      <button 
        className="fixed bottom-6 right-6 p-4 bg-emerald-500 text-white rounded-full shadow-lg z-[80] md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>
    </>
  );
}