'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import styles from './kas.module.css';
import { Users, CheckCircle, XCircle, BarChart3 } from 'lucide-react';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function KasPage() {
  const [originalData, setOriginalData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [totalAnggota, setTotalAnggota] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const bulanSekarang = new Date().getMonth() + 1;
  const namaBulanSekarang = NAMA_BULAN[bulanSekarang - 1];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { count } = await supabase.from('anggota').select('*', { count: 'exact', head: true });
      setTotalAnggota(count || 0);

      const { data, error } = await supabase
        .from('kas_iuran')
        .select(`
          id, nominal, tipe, keterangan, tanggal, bulan,
          anggota (nama)
        `)
        .order('bulan', { ascending: true })
        .order('tanggal', { ascending: false });

      if (!error) {
        setOriginalData(data);
        setFilteredData(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [supabase]);

  useEffect(() => {
    const results = originalData.filter((item) => {
      const nama = item.anggota?.nama?.toLowerCase() || '';
      const bulan = NAMA_BULAN[item.bulan - 1]?.toLowerCase() || '';
      return nama.includes(searchTerm.toLowerCase()) || bulan.includes(searchTerm.toLowerCase());
    });
    setFilteredData(results);
  }, [searchTerm, originalData]);

  const ringkasanDetail = originalData.reduce((acc, curr) => {
    const bulanNama = NAMA_BULAN[curr.bulan - 1];
    if (!acc[bulanNama]) {
      acc[bulanNama] = { masuk: 0, keluar: 0, total: 0 };
    }
    
    if (curr.tipe === 'masuk') {
      acc[bulanNama].masuk += curr.nominal;
      acc[bulanNama].total += curr.nominal;
    } else {
      acc[bulanNama].keluar += curr.nominal;
      acc[bulanNama].total -= curr.nominal;
    }
    return acc;
  }, {});

  const grandTotal = Object.values(ringkasanDetail).reduce((a, b) => a + b.total, 0);

  const sudahBayar = originalData.filter(item => item.bulan === bulanSekarang && item.tipe === 'masuk').length;
  const belumBayar = totalAnggota - sudahBayar;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <span className="text-emerald-500 text-sm animate-pulse">Memuat data kas...</span>
    </div>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Rekap Kas</h1>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className="flex justify-between items-start">
            <span className={styles.kpiLabel}>Total Anggota</span>
            <Users size={16} className="text-emerald-500" />
          </div>
          <span className={styles.kpiValue}>{totalAnggota}</span>
          <span className={styles.kpiSub}>Terdaftar di sistem</span>
        </div>

        <div className={styles.kpiCard}>
          <div className="flex justify-between items-start">
            <span className={styles.kpiLabel}>Sudah Bayar</span>
            <CheckCircle size={16} className="text-blue-500" />
          </div>
          <span className={styles.kpiValue}>{sudahBayar}</span>
          <span className={styles.kpiSub}>Periode {namaBulanSekarang}</span>
        </div>

        <div className={styles.kpiCard}>
          <div className="flex justify-between items-start">
            <span className={styles.kpiLabel}>Belum Bayar</span>
            <XCircle size={16} className="text-red-500" />
          </div>
          <span className={styles.kpiValue}>{belumBayar < 0 ? 0 : belumBayar}</span>
          <span className={styles.kpiSub}>Periode {namaBulanSekarang}</span>
        </div>
      </div>

      <div className={styles.searchWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Cari nama atau bulan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Bulan</th>
              <th className={styles.th}>Tanggal</th>
              <th className={styles.th}>Nama</th>
              <th className={styles.th}>Tipe</th>
              <th className={styles.th}>Nominal</th>
              <th className={styles.th}>Ket</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className={styles.row}>
                <td className={styles.td}>
                  <strong className="text-emerald-400">{NAMA_BULAN[item.bulan - 1].substring(0, 3)}</strong>
                </td>
                <td className={styles.td}>{item.tanggal}</td>
                <td className={styles.td}>{item.anggota?.nama || '-'}</td>
                <td className={styles.td}>
                  <span className={item.tipe === 'masuk' ? styles.badgeMasuk : styles.badgeKeluar}>
                    {item.tipe === 'masuk' ? 'In' : 'Out'}
                  </span>
                </td>
                <td className={styles.td}>
                  <span className="font-mono">Rp{item.nominal.toLocaleString('id-ID')}</span>
                </td>
                <td className={styles.td}>
                  <span className="text-gray-500 text-xs italic">{item.keterangan || '-'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.summarySection}>
        <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-emerald-500" />
            <h2 className={styles.summaryTitle}>Laporan Keuangan Bulanan</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Bulan</th>
                <th className={styles.th}>Pemasukan (In)</th>
                <th className={styles.th}>Pengeluaran (Out)</th>
                <th className={styles.th}>Total Saldo</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ringkasanDetail).map(([bulan, data]) => (
                <tr key={bulan}>
                  <td className={styles.td}>{bulan}</td>
                  <td className={`${styles.td} text-blue-400 font-mono`}>
                    Rp{data.masuk.toLocaleString('id-ID')}
                  </td>
                  <td className={`${styles.td} text-red-400 font-mono`}>
                    Rp{data.keluar.toLocaleString('id-ID')}
                  </td>
                  <td className={`${styles.td} font-mono ${data.total < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    Rp{data.total.toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={styles.footerRow}>
                <td colSpan="4">
                  <div className={styles.fullFooterContent}>
                    <span className={styles.grandLabel}>SALDO KAS SAAT INI (GRAND TOTAL)</span>
                    <span className={styles.grandValue}>Rp{grandTotal.toLocaleString('id-ID')}</span>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}