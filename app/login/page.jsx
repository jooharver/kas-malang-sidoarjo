'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import styles from './login.module.css';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: 'Email atau password salah, Rek!',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    } else {
      router.push('/kas');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Masuk Admin</h1>
        <p className={styles.subtitle}>Silakan login untuk mengelola kas</p>
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="admin@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Mengecek...' : 'Login Sekarang'}
          </button>
        </form>

        {/* Link Tambahan untuk Publik */}
        <div className={styles.footerLink}>
          <p>Bukan admin? <Link href="/kas">Lihat Rekap Kas di sini</Link></p>
        </div>
      </div>
    </div>
  );
}