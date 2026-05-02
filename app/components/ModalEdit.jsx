import { useState, useEffect } from 'react';

const NAMA_BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function ModalEdit({ isOpen, onClose, data, originalAnggota, onSave, styles }) {
  const [form, setForm] = useState({ anggota_id: '', nominal: '', tipe: 'masuk', keterangan: '', bulan: 1 });

  // Sinkronisasi data yang diklik dengan form di dalam modal
  useEffect(() => {
    if (data) {
      setForm({
        anggota_id: data.anggota?.id || '',
        nominal: data.nominal || '',
        tipe: data.tipe || 'masuk',
        keterangan: data.keterangan || '',
        bulan: data.bulan || 1,
      });
    }
  }, [data]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(data.id, form);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBody}>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
        <h2 className="text-xs font-bold mb-4 uppercase tracking-widest text-emerald-500">
          Edit Transaksi
        </h2>
        
        <form onSubmit={handleSubmit}>
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
          
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className={styles.buttonDelete}>Batal</button>
            <button type="submit" className={styles.buttonSubmit}>Update Data</button>
          </div>
        </form>
      </div>
    </div>
  );
}