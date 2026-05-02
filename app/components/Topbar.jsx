'use client';

import Image from 'next/image';
import styles from './Topbar.module.css';

export default function Topbar() {
  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>Dashboard Kas</h1>

      <div className={styles.profileArea}>
        <span className={styles.greeting}>Halo, Rek</span>

        <div className={styles.avatarWrapper}>
          <Image 
            src="/profile-admin.png" 
            alt="Profil"
            width={36}
            height={36}
            className={styles.avatar}
            priority
          />
        </div>
      </div>
    </header>
  );
}