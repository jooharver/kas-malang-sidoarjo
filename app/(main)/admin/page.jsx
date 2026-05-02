'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import styles from './admin.module.css';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ModalEdit from '../../components/ModalEdit';
import ModalEditUser from '../../components/ModalEditUser';

const MySwal = withReactContent(Swal);
const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function AdminPage() {
  const [originalKas, setOriginalKas] = useState([]);
  const [originalAnggota, setOriginalAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [searchKas, setSearchKas] = useState('');
  const [searchAnggota, setSearchAnggota] = useState('');

  // State Transaksi
  const [form, setForm] = useState({ anggota_id: '', nominal: '', tipe: 'masuk', keterangan: '', bulan: new Date().getMonth() + 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  // State Anggota
  const [namaBaru, setNamaBaru] = useState(''); // Khusus untuk create
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const fetchData = async () => {
    setLoading(true);
    const { data: dataAnggota } = await supabase.from('anggota').select('id, nama').order('nama');
    if (dataAnggota) setOriginalAnggota(dataAnggota);
    
    const { data: dataKas } = await supabase
      .from('kas_iuran')
      .select('id, nominal, tipe, keterangan, tanggal, bulan, anggota(id, nama)')
      .order('bulan', { ascending: true })
      .order('tanggal', { ascending: false });
    if (dataKas) setOriginalKas(dataKas);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filteredKas = originalKas.filter(i => 
    i.anggota?.nama?.toLowerCase().includes(searchKas.toLowerCase()) || 
    NAMA_BULAN[i.bulan-1].toLowerCase().includes(searchKas.toLowerCase())
  );
  
  const filteredAnggota = originalAnggota.filter(a => 
    a.nama.toLowerCase().includes(searchAnggota.toLowerCase())
  );

  const Toast = MySwal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, background: '#111', color: '#fff' });

  // --- HANDLER TRANSAKSI ---
  const handleCreateKas = async (e) => {
    e.preventDefault();
    const res = await MySwal.fire({ title: 'Simpan Transaksi?', icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', background: '#111', color: '#fff' });
    
    if (res.isConfirmed) {
      setLoadingSubmit(true);
      const payload = { ...form, nominal: parseInt(form.nominal) };
      const { error } = await supabase.from('kas_iuran').insert([payload]);
        
      if (!error) { 
        Toast.fire({ icon: 'success', title: 'Berhasil ditambahkan!' }); 
        setForm({ anggota_id: '', nominal: '', tipe: 'masuk', keterangan: '', bulan: new Date().getMonth() + 1 }); 
        fetchData(); 
      }
      setLoadingSubmit(false);
    }
  };

  const handleUpdateKas = async (id, updatedForm) => {
    const res = await MySwal.fire({ title: 'Update Transaksi?', icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', background: '#111', color: '#fff' });
    
    if (res.isConfirmed) {
      const payload = { ...updatedForm, nominal: parseInt(updatedForm.nominal) };
      const { error } = await supabase.from('kas_iuran').update(payload).eq('id', id);
        
      if (!error) { 
        Toast.fire({ icon: 'success', title: 'Berhasil diupdate!' }); 
        setIsModalOpen(false);
        setEditData(null);
        fetchData(); 
      } else {
        Toast.fire({ icon: 'error', title: 'Gagal update' });
      }
    }
  };

  const handleHapusKas = async (id) => {
    const res = await MySwal.fire({ title: 'Hapus Transaksi?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', background: '#111', color: '#fff' });
    if (res.isConfirmed) { 
      await supabase.from('kas_iuran').delete().eq('id', id); 
      fetchData(); 
      Toast.fire({ icon: 'success', title: 'Terhapus' }); 
    }
  };

  // --- HANDLER ANGGOTA ---
  const handleCreateAnggota = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('anggota').insert([{ nama: namaBaru }]);
    
    if (!error) { 
      setNamaBaru(''); 
      fetchData(); 
      Toast.fire({ icon: 'success', title: 'Anggota ditambah!' }); 
    }
  };

  const handleUpdateAnggota = async (id, updatedNama) => {
    const { error } = await supabase.from('anggota').update({ nama: updatedNama }).eq('id', id);
    
    if (!error) {
      setIsUserModalOpen(false);
      setEditUserData(null);
      fetchData();
      Toast.fire({ icon: 'success', title: 'Berhasil diupdate!' });
    } else {
      Toast.fire({ icon: 'error', title: 'Gagal update' });
    }
  };

  const handleHapusAnggota = async (id, nama) => {
    const res = await MySwal.fire({ title: `Hapus ${nama}?`, text: "Data kas orang ini juga akan hilang!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', background: '#111', color: '#fff' });
    if (res.isConfirmed) { 
      await supabase.from('anggota').delete().eq('id', id); 
      fetchData(); 
      Toast.fire({ icon: 'success', title: 'Anggota dihapus' }); 
    }
  };

  if (loading) return <div className="p-10 text-emerald-500 animate-pulse text-sm">Memuat data admin...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kelola Admin</h1>

      {/* MODAL EDIT TRANSAKSI */}
      <ModalEdit 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        data={editData} 
        originalAnggota={originalAnggota} 
        onSave={handleUpdateKas}
        styles={styles}
      />

      {/* MODAL EDIT ANGGOTA */}
      <ModalEditUser 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        data={editUserData}
        onSave={handleUpdateAnggota}
        styles={styles}
      />

      {/* FORM INPUT TRANSAKSI (STRICTLY CREATE) */}
      <div className={styles.formCard}>
        <h2 className="text-xs font-bold mb-4 uppercase tracking-widest text-emerald-500">➕ Tambah Transaksi</h2>
        <form onSubmit={handleCreateKas}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Anggota</label>
              <select className={styles.select} value={form.anggota_id} onChange={e => setForm({...form, anggota_id: e.target.value})} required>
                <option value="">Pilih Anggota...</option>
                {originalAnggota.map(a => <option key={a.id} value={a.id}>{a.nama}</option>)}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Untuk Bulan</label>
              <select className={styles.select} value={form.bulan} onChange={e => setForm({...form, bulan: e.target.value})} required>
                {NAMA_BULAN.map((n, i) => <option key={i+1} value={i+1}>{n}</option>)}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Tipe</label>
              <select className={styles.select} value={form.tipe} onChange={e => setForm({...form, tipe: e.target.value})}>
                <option value="masuk">Uang Masuk</option>
                <option value="keluar">Uang Keluar</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Nominal (Rp)</label>
              <input type="number" className={styles.input} value={form.nominal} onChange={e => setForm({...form, nominal: e.target.value})} required />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: '1 / -1' }}>
              <label className={styles.label}>Keterangan</label>
              <input type="text" className={styles.input} value={form.keterangan} onChange={e => setForm({...form, keterangan: e.target.value})} placeholder="Opsional" />
            </div>
          </div>
          <div className="flex mt-4">
            <button type="submit" className={styles.buttonSubmit} disabled={loadingSubmit}>
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>

      {/* TABEL OVERVIEW TRANSAKSI LENGKAP */}
      <div className={styles.formCard}>
        <h2 className="text-xs font-bold mb-4 uppercase tracking-widest text-emerald-500">📋 Overview Rekapan Kas</h2>
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Cari transaksi (Nama/Bulan)..." 
          value={searchKas} 
          onChange={e => setSearchKas(e.target.value)} 
        />
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Bulan</th>
                <th className={styles.th}>Nama</th>
                <th className={styles.th}>Tipe</th>
                <th className={styles.th}>Nominal</th>
                <th className={styles.th}>Keterangan</th>
                <th className={styles.th}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKas.map((item) => (
                <tr key={item.id}>
                  <td className={styles.td}><strong className="text-emerald-400">{NAMA_BULAN[item.bulan - 1].substring(0, 3)}</strong></td>
                  <td className={styles.td}>{item.anggota?.nama}</td>
                  <td className={styles.td}>
                    <span className={item.tipe === 'masuk' ? styles.badgeMasuk : styles.badgeKeluar}>
                      {item.tipe === 'masuk' ? 'In' : 'Out'}
                    </span>
                  </td>
                  <td className={styles.td}>Rp{item.nominal.toLocaleString('id-ID')}</td>
                  <td className={styles.td}><span className="text-gray-500 italic text-xs">{item.keterangan || '-'}</span></td>
                  <td className={styles.td}>
                    <div className="flex gap-1">
                      <button onClick={() => {
                        setEditData(item);
                        setIsModalOpen(true);
                      }} className={styles.buttonEdit}>Edit</button>
                      <button onClick={() => handleHapusKas(item.id)} className={styles.buttonDelete}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KELOLA ANGGOTA (STRICTLY CREATE) */}
      <div className={styles.anggotaCard}>
        <h2 className="text-xs font-bold mb-4 uppercase tracking-widest text-emerald-500">👥 Daftar Anggota</h2>
        <form onSubmit={handleCreateAnggota} className={styles.flexRow}>
          <div className={styles.inputGroup} style={{flex: 1}}>
            <input type="text" className={styles.input} placeholder="Nama anggota baru..." value={namaBaru} onChange={e => setNamaBaru(e.target.value)} required />
          </div>
          <button type="submit" className={styles.buttonSubmit}>+ Tambah</button>
        </form>
        
        <input type="text" className={styles.input + " mt-4"} placeholder="Cari nama..." value={searchAnggota} onChange={e => setSearchAnggota(e.target.value)} />
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead><tr><th className={styles.th}>No</th><th className={styles.th}>Nama</th><th className={styles.th}>Aksi</th></tr></thead>
            <tbody>
              {filteredAnggota.map((a, i) => (
                <tr key={a.id}>
                  <td className={styles.td}>{i+1}</td>
                  <td className={styles.td}>{a.nama}</td>
                  <td className={styles.td}>
                    <div className="flex gap-1">
                      <button onClick={() => {
                        setEditUserData(a);
                        setIsUserModalOpen(true);
                      }} className={styles.buttonEdit}>Edit</button>
                      <button onClick={() => handleHapusAnggota(a.id, a.nama)} className={styles.buttonDelete}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}